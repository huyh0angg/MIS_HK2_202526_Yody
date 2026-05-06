import { fallbackProducts, fallbackSummary } from '../data/catalog';
import { getSessionId } from './storage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function requestJson(path, options = {}) {
  const sessionId = getSessionId();
  
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId && { 'X-Session-Id': sessionId }),
      ...(options.headers || {})
    },
    credentials: 'include',
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value);
}

export function mergeProducts(remoteProducts = []) {
  const catalogBySku = new Map(fallbackProducts.map((product) => [product.sku, product]));

  if (!remoteProducts.length) {
    return fallbackProducts.map((product) => ({
      ...product,
      priceLabel: formatCurrency(product.priceCents)
    }));
  }

  return remoteProducts.map((product) => {
    const fallback = catalogBySku.get(product.sku) || {};
    const priceCents = product.price_cents ?? product.priceCents ?? fallback.priceCents ?? 0;
    const imageUrl = product.imageUrl ?? product.image_url ?? fallback.imageUrl ?? fallback.image_url ?? null;
    const discountPercent = product.discount_percent ?? product.discountPercent ?? fallback.discountPercent ?? 0;

    return {
      ...fallback,
      id: product.id,
      sku: product.sku,
      name: product.name || fallback.name || product.sku,
      category: product.category || fallback.category || 'Khác',
      priceCents,
      priceLabel: formatCurrency(priceCents),
      discountPercent,
      imageUrl,
      image_url: imageUrl,
      shortDescription: fallback.shortDescription || 'Sản phẩm Yody Fashion',
      description: fallback.description || product.name || product.sku,
      tag: fallback.tag || 'Yody',
      featured: fallback.featured || false
    };
  });
}

export function normalizeProduct(product, fallback = {}) {
  if (!product) {
    return null;
  }

  const priceCents = product.price_cents ?? product.priceCents ?? fallback.priceCents ?? 0;
  const category = product.category || fallback.category || 'Khác';
  const imageUrl = product.imageUrl ?? product.image_url ?? fallback.imageUrl ?? fallback.image_url ?? null;
  const discountPercent = product.discount_percent ?? product.discountPercent ?? fallback.discountPercent ?? 0;

  return {
    ...fallback,
    ...product,
    sku: product.sku || fallback.sku,
    name: product.name || fallback.name || product.sku,
    category,
    priceCents,
    priceLabel: formatCurrency(priceCents),
    discountPercent,
    imageUrl,
    image_url: imageUrl,
    shortDescription: product.short_description || product.shortDescription || fallback.shortDescription || 'Sản phẩm Yody Fashion',
    description: product.description || fallback.description || product.name || product.sku,
    sizes: product.sizes || fallback.sizes || [],
    colors: product.colors || fallback.colors || [],
    stock: product.stock ?? fallback.stock ?? 0,
    tag: product.tag || fallback.tag || 'Yody',
    featured: product.featured ?? fallback.featured ?? false
  };
}

export async function fetchStorefrontProducts() {
  try {
    const payload = await requestJson('/store/products');
    return mergeProducts(payload.data || []);
  } catch (_error) {
    return fallbackProducts.map((product) => ({
      ...product,
      priceLabel: formatCurrency(product.priceCents)
    }));
  }
}

export async function fetchDashboardSummary() {
  try {
    return await requestJson('/dashboard/summary');
  } catch (_error) {
    return fallbackSummary();
  }
}

export async function fetchStorefrontProduct(sku) {
  try {
    const payload = await requestJson(`/store/products/${encodeURIComponent(sku)}`);
    const fallback = fallbackProducts.find((product) => product.sku === sku) || {};
    return normalizeProduct(payload.data, fallback);
  } catch (_error) {
    return normalizeProduct(fallbackProducts.find((product) => product.sku === sku) || fallbackProducts[0]);
  }
}

export async function createStoreOrder(orderPayload) {
  try {
    const payload = await requestJson('/store/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });

    return payload.order;
  } catch (_error) {
    return {
      id: `YD-${Date.now()}`,
      status: 'PENDING',
      payment_method: orderPayload.payment_method,
      total_cents: orderPayload.total_cents,
      items: orderPayload.items
    };
  }
}

export async function loginCustomer(payload) {
  const data = await requestJson('/store/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return {
    token: data.token,
    sessionId: data.sessionId,
    user: data.user
  };
}

export async function registerCustomer(payload) {
  const data = await requestJson('/store/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  return {
    user: data.user
  };
}

export async function fetchCart() {
  try {
    const payload = await requestJson('/store/cart');
    return payload.data || [];
  } catch (_error) {
    return [];
  }
}

export async function addToCart(productId, quantity = 1) {
  try {
    const payload = await requestJson('/store/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity })
    });
    return payload.data || [];
  } catch (_error) {
    throw _error;
  }
}

export async function updateCartItem(productId, quantity) {
  try {
    const payload = await requestJson(`/store/cart/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
    return payload.data || [];
  } catch (_error) {
    throw _error;
  }
}

export async function removeCartItem(productId) {
  try {
    const payload = await requestJson(`/store/cart/${productId}`, {
      method: 'DELETE'
    });
    return payload.data || [];
  } catch (_error) {
    throw _error;
  }
}

export async function clearCartItems() {
  try {
    await requestJson('/store/cart', {
      method: 'DELETE'
    });
    return true;
  } catch (_error) {
    return false;
  }
}

export async function fetchCartCount() {
  try {
    const payload = await requestJson('/store/cart/count');
    return payload.count || 0;
  } catch (_error) {
    return 0;
  }
}

export async function logoutCustomer() {
  try {
    await requestJson('/store/auth/logout', {
      method: 'POST'
    });
    return true;
  } catch (_error) {
    return false;
  }
}

export async function fetchAdminSummary() {
  const data = await requestJson('/admin/summary');
  return data;
}

export async function fetchAdminOrders() {
  const data = await requestJson('/admin/orders');
  return data.data || [];
}

export async function updateAdminOrderStatus(orderId, status) {
  const data = await requestJson(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
  return data.data;
}

export async function fetchAdminProducts() {
  const data = await requestJson('/admin/products');
  return data.data || [];
}

export async function adminCreateProduct(fields) {
  const data = await requestJson('/admin/products', {
    method: 'POST',
    body: JSON.stringify(fields)
  });
  return data.data;
}

export async function adminUpdateProduct(id, fields) {
  const data = await requestJson(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fields)
  });
  return data.data;
}

export async function adminDeleteProduct(id) {
  await requestJson(`/admin/products/${id}`, { method: 'DELETE' });
  return true;
}

export async function fetchAdminCategories() {
  const data = await requestJson('/admin/categories');
  return data.data || [];
}

export async function adminCreateCategory(fields) {
  const data = await requestJson('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(fields)
  });
  return data.data;
}

export async function adminUpdateCategory(id, fields) {
  const data = await requestJson(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fields)
  });
  return data.data;
}

export async function adminDeleteCategory(id) {
  await requestJson(`/admin/categories/${id}`, { method: 'DELETE' });
  return true;
}