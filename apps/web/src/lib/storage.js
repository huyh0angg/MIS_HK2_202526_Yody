const CART_KEY = 'yody_cart_v1';
const ORDER_KEY = 'yody_latest_order';
const AUTH_KEY = 'yody_auth_session_v1';
const SESSION_KEY = 'yody_session_id';

function readJson(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') {
    return value;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function getOrCreateSessionId() {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getSessionId() {
  return localStorage.getItem(SESSION_KEY);
}

export function setSessionId(sessionId) {
  localStorage.setItem(SESSION_KEY, sessionId);
}

export function clearSessionId() {
  localStorage.removeItem(SESSION_KEY);
}

export function getCartItems() {
  return readJson(CART_KEY, []);
}

export function setCartItems(items) {
  return writeJson(CART_KEY, items);
}

export function addCartItem(product, quantity = 1) {
  const items = getCartItems();
  const existing = items.find((item) => item.sku === product.sku);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ sku: product.sku, quantity });
  }

  return setCartItems(items);
}

export function updateCartQuantity(sku, quantity) {
  const normalized = Math.max(0, Number(quantity) || 0);
  const items = getCartItems().filter((item) => item.sku !== sku);

  if (normalized > 0) {
    items.push({ sku, quantity: normalized });
  }

  return setCartItems(items);
}

export function removeCartItem(sku) {
  return setCartItems(getCartItems().filter((item) => item.sku !== sku));
}

export function clearCart() {
  return setCartItems([]);
}

export function getLatestOrder() {
  return readJson(ORDER_KEY, null);
}

export function setLatestOrder(order) {
  return writeJson(ORDER_KEY, order);
}

export function getAuthSession() {
  return readJson(AUTH_KEY, null);
}

export function setAuthSession(session) {
  return writeJson(AUTH_KEY, session);
}

export function clearAuthSession() {
  return writeJson(AUTH_KEY, null);
}

export function cartLineItems(products) {
  const items = getCartItems();
  return items
    .map((entry) => {
      const product = products.find((candidate) => candidate.sku === entry.sku);
      if (!product) {
        return null;
      }

      return {
        ...product,
        quantity: entry.quantity,
        lineTotal: product.priceCents * entry.quantity
      };
    })
    .filter(Boolean);
}

export function calculateCartTotals(lines) {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const discount = subtotal >= 1000000 ? 50000 : 0;
  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount)
  };
}
