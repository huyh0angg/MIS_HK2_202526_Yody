import { pool, queryOne, queryAll, execute, transaction } from './db/connections.js';
import { formatOrder, formatOrderItem, formatProduct } from './db/helpers.js';

export async function getProducts(options = {}) {
  const { category, search, limit = 50, offset = 0 } = options;

  let sql = `
    SELECT p.*, c.name as category_name, COALESCE(pi.url, p.image_url) as image_url
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    sql += ' AND c.name = ?';
    params.push(category);
  }

  if (search) {
    sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ' ORDER BY p.created_at DESC';

  const [rows] = await pool.query(sql, params);
  return rows.slice(offset, offset + limit).map(row => ({ ...formatProduct(row), images: [] }));
}

export async function getProductBySku(sku) {
  const product = await queryOne(
    `SELECT p.*, c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.sku = ?`,
    [sku]
  );

  if (!product) return null;

  const images = await queryAll(
    'SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order',
    [product.id]
  );

  const inventory = await queryOne(
    'SELECT stock FROM inventory WHERE product_id = ?',
    [product.id]
  );

  return {
    ...formatProduct(product),
    images: images.map(i => i.url),
    stock: inventory?.stock || 0,
    reviews: []
  };
}

export async function getProductById(productId) {
  const product = await queryOne('SELECT * FROM products WHERE id = ?', [productId]);
  return formatProduct(product);
}

export async function getCategories() {
  return queryAll('SELECT id, name, icon, description, display_order FROM categories ORDER BY display_order');
}

export async function getBanners() {
  return queryAll('SELECT * FROM banners WHERE active = 1 ORDER BY display_order LIMIT 5');
}

export async function createOrder(orderData) {
  const { userId, sessionId, items, shipping, paymentMethod, totalCents, shippingCents } = orderData;

  return transaction(async (connection) => {
    const [orderResult] = await connection.execute(
      `INSERT INTO orders
         (user_id, total_cents, status, payment_method, payment_status,
          shipping_name, shipping_phone, shipping_province, shipping_district, shipping_ward,
          shipping_address, shipping_fee_cents, notes)
       VALUES (?, ?, 'PENDING', ?, 'PENDING', ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, totalCents, paymentMethod,
        shipping.fullName, shipping.phone,
        shipping.province, shipping.district, shipping.ward, shipping.address,
        shippingCents, shipping.note || null
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price_cents, quantity, subtotal_cents)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.productName, item.productImage, item.priceCents, item.quantity, item.subtotalCents]
      );
    }

    await connection.execute(
      'DELETE FROM cart_items WHERE session_id = ? OR user_id = ?',
      [sessionId, userId]
    );

    return {
      id: orderId,
      status: 'PENDING',
      paymentMethod,
      totalCents,
      shippingCents,
      items,
      createdAt: new Date().toISOString()
    };
  });
}

export async function getOrdersByUser(userId) {
  const rows = await queryAll(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  const result = [];
  for (const order of rows) {
    const items = await queryAll(
      'SELECT * FROM order_items WHERE order_id = ?',
      [order.id]
    );
    result.push({ ...formatOrder(order), items: items.map(formatOrderItem) });
  }

  return result;
}

export async function getOrderById(orderId, userId = null) {
  let sql = 'SELECT * FROM orders WHERE id = ?';
  const params = [orderId];

  if (userId) {
    sql += ' AND user_id = ?';
    params.push(userId);
  }

  const order = await queryOne(sql, params);
  if (!order) return null;

  const items = await queryAll(
    'SELECT * FROM order_items WHERE order_id = ?',
    [orderId]
  );

  return { ...formatOrder(order), items: items.map(formatOrderItem) };
}

export async function getDashboardSummary() {
  const summary = await queryOne(
    `SELECT COUNT(*) as total_orders,
            COALESCE(SUM(total_cents), 0) as revenue_cents,
            COUNT(DISTINCT user_id) as customers
     FROM orders WHERE status != 'CANCELLED'`
  );

  const pending = await queryOne(
    'SELECT COUNT(*) as count FROM orders WHERE status = ?',
    ['PENDING']
  );

  const shipping = await queryOne(
    'SELECT COUNT(*) as count FROM orders WHERE status = ?',
    ['SHIPPING']
  );

  return {
    revenueCents: summary?.revenue_cents || 0,
    totalOrders: summary?.total_orders || 0,
    customers: summary?.customers || 0,
    pendingOrders: pending?.count || 0,
    shippingOrders: shipping?.count || 0
  };
}

export async function getAllOrders() {
  const rows = await queryAll(
    `SELECT o.*, u.email as user_email, u.full_name as user_full_name
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC
     LIMIT 100`
  );
  const result = [];
  for (const order of rows) {
    const items = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    result.push({ 
      ...formatOrder(order), 
      userEmail: order.user_email, 
      userFullName: order.user_full_name,
      items: items.map(formatOrderItem) 
    });
  }
  return result;
}

export async function updateOrderStatus(orderId, status) {
  await execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  return getOrderById(orderId);
}

export async function getAdminProducts() {
  const [rows] = await pool.query(`
    SELECT p.*, c.name as category_name, COALESCE(i.stock, 0) as stock
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN inventory i ON p.id = i.product_id
    ORDER BY p.created_at DESC
    LIMIT 200
  `);
  return rows.map(row => ({ ...formatProduct(row), stock: row.stock }));
}

export async function adminCreateProduct({ name, categoryId, description, priceCents, discountPercent, imageUrl, stock = 0 }) {
  const result = await execute(
    'INSERT INTO products (sku, name, category_id, description, price_cents, discount_percent, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [`YDY-CUSTOM-${Date.now()}`, name, categoryId, description, priceCents, discountPercent || 0, imageUrl || null]
  );
  const productId = result.insertId;
  
  // Create product image record if imageUrl is provided
  if (imageUrl) {
    await execute(
      'INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)',
      [productId, imageUrl, 1]
    );
  }
  
  await execute(
    'INSERT INTO inventory (product_id, stock) VALUES (?, ?) ON DUPLICATE KEY UPDATE stock = ?',
    [productId, stock, stock]
  );
  const row = await queryOne(
    'SELECT p.*, c.name as category_name, COALESCE(i.stock, 0) as stock FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN inventory i ON p.id = i.product_id WHERE p.id = ?',
    [productId]
  );
  return { ...formatProduct(row), stock: row?.stock || 0 };
}

export async function adminUpdateProduct(id, fields) {
  const { name, categoryId, description, priceCents, discountPercent, imageUrl, stock } = fields;
  await execute(
    'UPDATE products SET name=?, category_id=?, description=?, price_cents=?, discount_percent=?, image_url=? WHERE id=?',
    [name, categoryId, description, priceCents, discountPercent || 0, imageUrl || null, id]
  );
  
  // Update product image record if imageUrl is provided
  if (imageUrl) {
    const existingImage = await queryOne(
      'SELECT id FROM product_images WHERE product_id = ? AND sort_order = 1',
      [id]
    );
    
    if (existingImage) {
      // Update existing image
      await execute(
        'UPDATE product_images SET url = ? WHERE product_id = ? AND sort_order = 1',
        [imageUrl, id]
      );
    } else {
      // Create new image record
      await execute(
        'INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)',
        [id, imageUrl, 1]
      );
    }
  }
  
  if (stock !== undefined) {
    await execute(
      'INSERT INTO inventory (product_id, stock) VALUES (?, ?) ON DUPLICATE KEY UPDATE stock = ?',
      [id, stock, stock]
    );
  }
  const row = await queryOne(
    'SELECT p.*, c.name as category_name, COALESCE(i.stock, 0) as stock FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN inventory i ON p.id = i.product_id WHERE p.id = ?',
    [id]
  );
  return { ...formatProduct(row), stock: row?.stock || 0 };
}

export async function adminDeleteProduct(id) {
  await execute('DELETE FROM product_images WHERE product_id = ?', [id]);
  await execute('DELETE FROM inventory WHERE product_id = ?', [id]);
  await execute('DELETE FROM products WHERE id = ?', [id]);
}

export async function adminCreateCategory({ name, description }) {
  const result = await execute(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description || null]
  );
  return queryOne('SELECT * FROM categories WHERE id = ?', [result.insertId]);
}

export async function adminUpdateCategory(id, { name, description }) {
  await execute('UPDATE categories SET name=?, description=? WHERE id=?', [name, description || null, id]);
  return queryOne('SELECT * FROM categories WHERE id = ?', [id]);
}

export async function adminDeleteCategory(id) {
  await execute('DELETE FROM categories WHERE id = ?', [id]);
}
