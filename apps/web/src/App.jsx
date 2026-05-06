import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthSessionContext } from './hooks/useAuthSession';
import { useStorefrontData } from './hooks/useStorefrontData';
import { clearAuthSession, getAuthSession, getOrCreateSessionId } from './lib/storage';
import { addToCart as apiAddToCart, fetchCartCount } from './lib/api';

import HomePage from './components/pages/HomePage';
import ProductsPage from './components/pages/ProductsPage';
import ProductDetailPage from './components/pages/ProductDetailPage';
import CartPage from './components/pages/CartPage';
import CheckoutPage from './components/pages/CheckoutPage';
import AuthPage from './components/pages/AuthPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import CustomerDashboardPage from './components/pages/CustomerDashboardPage';
import AdminPage from './components/pages/AdminPage';
import OrderConfirmPage from './components/pages/OrderConfirmPage';
import ProtectedRoute from './components/pages/ProtectedRoute';

export default function App() {
  const { products, summary } = useStorefrontData();
  const [authSession, setAuthSessionState] = useState(() => getAuthSession());
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    getOrCreateSessionId();
    fetchCartCount().then(setCartCount);
  }, []);

  const syncCartCount = () => {
    fetchCartCount().then(setCartCount);
  };

  const handleAddToCart = async (product, quantity = 1) => {
    if (!product.id) return;
    try {
      await apiAddToCart(product.id, quantity);
      syncCartCount();
    } catch (e) {
      console.error('Add to cart failed:', e);
    }
  };

  const handleCartMutate = () => {
    syncCartCount();
  };

  const handleQuickLogout = () => {
    clearAuthSession();
    setAuthSessionState(null);
  };

  return (
    <AuthSessionContext.Provider value={{ authSession, setAuthSession: setAuthSessionState }}>
      <Routes>
        <Route path="/" element={<HomePage products={products} summary={summary} cartCount={cartCount} onAddToCart={handleAddToCart} onQuickLogout={handleQuickLogout} />} />
        <Route path="/products" element={<ProductsPage products={products} cartCount={cartCount} onAddToCart={handleAddToCart} onQuickLogout={handleQuickLogout} />} />
        <Route path="/products/:sku" element={<ProductDetailPage products={products} cartCount={cartCount} onAddToCart={handleAddToCart} onQuickLogout={handleQuickLogout} />} />
        <Route path="/product-detail" element={<Navigate to="/products/YDY-M-POLO-001" replace />} />
        <Route path="/cart" element={<CartPage products={products} cartCount={cartCount} onCartMutate={handleCartMutate} onQuickLogout={handleQuickLogout} />} />
        <Route path="/checkout" element={<CheckoutPage products={products} cartCount={cartCount} onCartMutate={handleCartMutate} onQuickLogout={handleQuickLogout} />} />
        <Route path="/auth" element={<AuthPage cartCount={cartCount} onQuickLogout={handleQuickLogout} />} />
        <Route path="/login" element={<LoginPage cartCount={cartCount} onQuickLogout={handleQuickLogout} />} />
        <Route path="/register" element={<RegisterPage cartCount={cartCount} onQuickLogout={handleQuickLogout} />} />
        <Route
          path="/customer"
          element={(
            <ProtectedRoute>
              <CustomerDashboardPage cartCount={cartCount} summary={summary} onQuickLogout={handleQuickLogout} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin"
          element={(
            <ProtectedRoute requireRole="admin">
              <AdminPage cartCount={cartCount} summary={summary} onQuickLogout={handleQuickLogout} />
            </ProtectedRoute>
          )}
        />
        <Route path="/order-confirm" element={<OrderConfirmPage cartCount={cartCount} onQuickLogout={handleQuickLogout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthSessionContext.Provider>
  );
}
