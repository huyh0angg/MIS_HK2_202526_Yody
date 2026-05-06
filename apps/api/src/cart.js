import { queryOne, queryAll, execute, transaction } from './db/connections.js';
import { formatCartItem } from './db/helpers.js';

export async function getCartBySession(sessionId) {
  const items = await queryAll(
    `SELECT ci.id, ci.session_id, ci.user_id, ci.product_id, ci.quantity, ci.created_at,
            p.name as product_name, p.sku as product_sku, p.price_cents,
            pi.url as image_url
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1
     WHERE ci.session_id = ?
     ORDER BY ci.created_at DESC`,
    [sessionId]
  );
  return items.map(formatCartItem);
}

export async function getCartByUser(userId) {
  const items = await queryAll(
    `SELECT ci.id, ci.session_id, ci.user_id, ci.product_id, ci.quantity, ci.created_at,
            p.name as product_name, p.sku as product_sku, p.price_cents,
            pi.url as image_url
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.sort_order = 1
     WHERE ci.user_id = ?
     ORDER BY ci.created_at DESC`,
    [userId]
  );
  return items.map(formatCartItem);
}

export async function addToCart(sessionId, productId, quantity = 1, userId = null) {
  const existing = await queryOne(
    'SELECT id, quantity FROM cart_items WHERE product_id = ? AND (session_id = ? OR user_id = ?)',
    [productId, sessionId, userId]
  );

  if (existing) {
    return execute(
      'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
      [quantity, existing.id]
    );
  }

  return execute(
    'INSERT INTO cart_items (session_id, user_id, product_id, quantity) VALUES (?, ?, ?, ?)',
    [sessionId, userId, productId, quantity]
  );
}

export async function updateCartQuantity(sessionId, productId, quantity, userId = null) {
  if (quantity <= 0) {
    return removeFromCart(sessionId, productId, userId);
  }
  return execute(
    'UPDATE cart_items SET quantity = ? WHERE product_id = ? AND (session_id = ? OR user_id = ?)',
    [quantity, productId, sessionId, userId]
  );
}

export async function removeFromCart(sessionId, productId, userId = null) {
  return execute(
    'DELETE FROM cart_items WHERE product_id = ? AND (session_id = ? OR user_id = ?)',
    [productId, sessionId, userId]
  );
}

export async function clearCart(sessionId, userId = null) {
  return execute(
    'DELETE FROM cart_items WHERE session_id = ? OR user_id = ?',
    [sessionId, userId]
  );
}

export async function mergeCartToUser(anonymousSessionId, userId) {
  return transaction(async (connection) => {
    await connection.execute(
      'UPDATE cart_items SET user_id = ? WHERE session_id = ? AND user_id IS NULL',
      [userId, anonymousSessionId]
    );
    await connection.execute(
      'DELETE FROM cart_items WHERE session_id = ? AND user_id IS NOT NULL AND user_id != ?',
      [anonymousSessionId, userId]
    );
    return { success: true };
  });
}

export async function getCartCount(sessionId, userId = null) {
  const result = await queryOne(
    'SELECT SUM(quantity) as total FROM cart_items WHERE session_id = ? OR user_id = ?',
    [sessionId, userId]
  );
  return result?.total || 0;
}
