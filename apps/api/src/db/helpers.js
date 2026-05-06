export function formatRow(row) {
  if (!row) return null;
  return row;
}

export function formatRows(rows) {
  return Array.isArray(rows) ? rows : (rows ? [rows] : []);
}

export function snakeToCamel(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

export function camelToSnake(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = obj[key];
  }
  return result;
}

export function formatProduct(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category_name || row.category,
    category_name: row.category_name,
    categoryId: row.category_id,
    description: row.description,
    priceCents: row.price_cents,
    discountPercent: row.discount_percent || 0,
    imageUrl: row.image_url,
    specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || null),
    features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || null),
    createdAt: row.created_at
  };
}

export function formatOrder(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    userId: row.user_id,
    totalCents: row.total_cents,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    shippingName: row.shipping_name,
    shippingPhone: row.shipping_phone,
    shippingProvince: row.shipping_province,
    shippingDistrict: row.shipping_district,
    shippingWard: row.shipping_ward,
    shippingAddress: row.shipping_address,
    shippingFeeCents: row.shipping_fee_cents || 0,
    trackingNumber: row.tracking_number,
    notes: row.notes,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
    shippedAt: row.shipped_at,
    deliveredAt: row.delivered_at,
    cancelledAt: row.cancelled_at
  };
}

export function formatOrderItem(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image,
    priceCents: row.price_cents,
    quantity: row.quantity,
    subtotalCents: row.subtotal_cents
  };
}

export function formatUser(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    phone: row.phone,
    province: row.province,
    role: row.role,
    isVerified: row.is_verified === 1,
    createdAt: row.created_at
  };
}

export function formatCartItem(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    productId: row.product_id,
    quantity: row.quantity,
    productName: row.product_name,
    productSku: row.product_sku,
    priceCents: row.price_cents,
    imageUrl: row.image_url,
    lineTotal: row.price_cents * row.quantity,
    createdAt: row.created_at
  };
}