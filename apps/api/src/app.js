import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';
import { execute, pool } from './db/connections.js';
import {
  getSessionById, updateSessionUser, deleteSession,
  loginUser, registerUser, getUserById, updateUserProfile, getUserAddresses
} from './auth.js';
import {
  getCartBySession, addToCart, updateCartQuantity, removeFromCart,
  clearCart, mergeCartToUser, getCartCount
} from './cart.js';
import {
  getProducts, getProductBySku, getCategories, getBanners,
  createOrder, getOrdersByUser, getOrderById, getDashboardSummary,
  getAllOrders, updateOrderStatus,
  getAdminProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory
} from './orders.js';
import { formatUser } from './db/helpers.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.use(async (req, res, next) => {
    const sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
    req.session = null;

    if (sessionId) {
      try {
        req.session = await getSessionById(sessionId);
        if (!req.session) {
          await execute('INSERT IGNORE INTO sessions (session_id) VALUES (?)', [sessionId]);
          req.session = { session_id: sessionId, user_id: null };
        }
      } catch (e) {
        console.error('Session error:', e.message);
      }
    }

    next();
  });

  app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'yody-api', timestamp: new Date().toISOString() });
  });

  app.post('/sessions', async (req, res) => {
    try {
      const sessionId = uuidv4();
      await execute('INSERT INTO sessions (session_id) VALUES (?)', [sessionId]);
      res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ sessionId });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  });

  app.get('/store/products', async (req, res) => {
    try {
      const { category, search } = req.query;
      const products = await getProducts({ category, search });
      res.json({ data: products });
    } catch (error) {
      console.error('Products error:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.get('/store/products/:sku', async (req, res) => {
    try {
      const product = await getProductBySku(req.params.sku);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json({ data: product });
    } catch (error) {
      console.error('Product detail error:', error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  app.get('/store/categories', async (req, res) => {
    try {
      res.json({ data: await getCategories() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.get('/store/banners', async (req, res) => {
    try {
      res.json({ data: await getBanners() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch banners' });
    }
  });

  app.get('/store/cart', async (req, res) => {
    try {
      if (!req.session) return res.json({ data: [] });
      res.json({ data: await getCartBySession(req.session.session_id) });
    } catch (error) {
      console.error('Cart error:', error);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  });

  app.get('/store/cart/count', async (req, res) => {
    try {
      if (!req.session) return res.json({ count: 0 });
      const count = await getCartCount(req.session.session_id, req.session.user_id);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cart count' });
    }
  });

  app.post('/store/cart', async (req, res) => {
    try {
      if (!req.session) return res.status(401).json({ error: 'No session' });
      const { productId, quantity = 1 } = req.body;
      await addToCart(req.session.session_id, productId, quantity, req.session.user_id);
      res.json({ data: await getCartBySession(req.session.session_id) });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ error: 'Failed to add to cart' });
    }
  });

  app.put('/store/cart/:productId', async (req, res) => {
    try {
      if (!req.session) return res.status(401).json({ error: 'No session' });
      const { quantity } = req.body;
      await updateCartQuantity(req.session.session_id, parseInt(req.params.productId), quantity, req.session.user_id);
      res.json({ data: await getCartBySession(req.session.session_id) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update cart' });
    }
  });

  app.delete('/store/cart/:productId', async (req, res) => {
    try {
      if (!req.session) return res.status(401).json({ error: 'No session' });
      await removeFromCart(req.session.session_id, parseInt(req.params.productId), req.session.user_id);
      res.json({ data: await getCartBySession(req.session.session_id) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove from cart' });
    }
  });

  app.delete('/store/cart', async (req, res) => {
    try {
      if (!req.session) return res.status(401).json({ error: 'No session' });
      await clearCart(req.session.session_id, req.session.user_id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  });

  app.post('/store/cart/merge', async (req, res) => {
    try {
      if (!req.session) return res.status(401).json({ error: 'No session' });
      await mergeCartToUser(req.session.session_id, req.session.user_id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to merge cart' });
    }
  });

  app.post('/store/auth/register', async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      const user = await registerUser(email, password, fullName);
      res.json({ user });
    } catch (error) {
      console.error('Register error:', error);
      if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/store/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

      const result = await loginUser(email, password);
      if (result.error) return res.status(401).json({ error: result.error });

      let sessionId = req.session?.session_id;
      if (sessionId) {
        await updateSessionUser(sessionId, result.id);
      } else {
        sessionId = uuidv4();
        await execute(
          'INSERT INTO sessions (session_id, user_id) VALUES (?, ?)',
          [sessionId, result.id]
        );
        res.cookie('sessionId', sessionId, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      }

      if (req.session?.session_id) {
        await mergeCartToUser(req.session.session_id, result.id);
      }

      res.json({
        token: `yody_${result.id}_${Date.now()}`,
        sessionId,
        user: {
          id: result.id,
          email: result.email,
          fullName: result.fullName,
          role: result.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/store/auth/logout', async (req, res) => {
    try {
      if (req.session) {
        await deleteSession(req.session.session_id);
        res.clearCookie('sessionId');
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  app.get('/store/auth/me', async (req, res) => {
    try {
      if (!req.session?.user_id) return res.status(401).json({ error: 'Not authenticated' });
      const user = await getUserById(req.session.user_id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user: formatUser(user) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  app.put('/store/auth/profile', async (req, res) => {
    try {
      if (!req.session?.user_id) return res.status(401).json({ error: 'Not authenticated' });
      await updateUserProfile(req.session.user_id, req.body);
      const user = await getUserById(req.session.user_id);
      res.json({ user: formatUser(user) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.get('/store/auth/addresses', async (req, res) => {
    try {
      if (!req.session?.user_id) return res.status(401).json({ error: 'Not authenticated' });
      res.json({ data: await getUserAddresses(req.session.user_id) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get addresses' });
    }
  });

  app.post('/store/orders', async (req, res) => {
    try {
      if (!req.session) return res.status(401).json({ error: 'No session' });
      const { items, shipping, paymentMethod, totalCents, subtotalCents, discountCents, shippingCents } = req.body;
      if (!items?.length) return res.status(400).json({ error: 'No items in order' });

      const order = await createOrder({
        userId: req.session.user_id,
        sessionId: req.session.session_id,
        items,
        shipping,
        paymentMethod,
        totalCents,
        subtotalCents,
        discountCents,
        shippingCents
      });

      res.json({ order });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  app.get('/store/orders', async (req, res) => {
    try {
      if (!req.session?.user_id) return res.status(401).json({ error: 'Not authenticated' });
      res.json({ data: await getOrdersByUser(req.session.user_id) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.get('/store/orders/:id', async (req, res) => {
    try {
      if (!req.session?.user_id) return res.status(401).json({ error: 'Not authenticated' });
      const order = await getOrderById(parseInt(req.params.id), req.session.user_id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json({ data: order });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  });

  app.get('/dashboard/summary', async (req, res) => {
    try {
      res.json(await getDashboardSummary());
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
  });

  async function requireAdmin(req, res, next) {
    if (!req.session?.user_id) return res.status(401).json({ error: 'Not authenticated' });
    const user = await getUserById(req.session.user_id);
    if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    next();
  }

  app.get('/admin/summary', requireAdmin, async (req, res) => {
    try {
      res.json(await getDashboardSummary());
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch summary' });
    }
  });

  app.get('/admin/orders', requireAdmin, async (req, res) => {
    try {
      res.json({ data: await getAllOrders() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.put('/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const order = await updateOrderStatus(parseInt(req.params.id), status);
      res.json({ data: order });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  app.get('/admin/products', requireAdmin, async (req, res) => {
    try {
      res.json({ data: await getAdminProducts() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  app.post('/admin/products', requireAdmin, async (req, res) => {
    try {
      const product = await adminCreateProduct(req.body);
      res.json({ data: product });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.put('/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      const product = await adminUpdateProduct(parseInt(req.params.id), req.body);
      res.json({ data: product });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/admin/products/:id', requireAdmin, async (req, res) => {
    try {
      await adminDeleteProduct(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.get('/admin/categories', requireAdmin, async (req, res) => {
    try {
      res.json({ data: await getCategories() });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/admin/categories', requireAdmin, async (req, res) => {
    try {
      const category = await adminCreateCategory(req.body);
      res.json({ data: category });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  });

  app.put('/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      const category = await adminUpdateCategory(parseInt(req.params.id), req.body);
      res.json({ data: category });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  });

  app.delete('/admin/categories/:id', requireAdmin, async (req, res) => {
    try {
      await adminDeleteCategory(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  return app;
}
