import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem } from '../../lib/api';
import { calculateCartTotals } from '../../lib/storage';
import { formatDisplayPrice } from '../../lib/helpers';
import Shell from '../common/Shell';
import CartItem from '../UI/CartItem';
import ProductCard from '../UI/ProductCard';

export default function CartPage({ products, cartCount, onCartMutate, onQuickLogout }) {
  const navigate = useNavigate();
  const [lines, setLines] = useState([]);

  const loadCart = async () => {
    const items = await fetchCart();
    setLines(items.map(item => ({
      id: item.id,
      productId: item.productId,
      sku: item.productSku,
      name: item.productName,
      imageUrl: item.imageUrl || item.image_url || null,
      priceCents: item.priceCents,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })));
  };

  useEffect(() => {
    loadCart();
  }, [cartCount]);

  const totals = useMemo(() => calculateCartTotals(lines), [lines]);

  const suggestedProducts = useMemo(() => {
    if (!products.length) return [];
    return Array.from({ length: 6 }, (_, index) => products[index % products.length]);
  }, [products]);

  const refreshCart = async () => {
    await loadCart();
    onCartMutate();
  };

  const handleQuantity = async (sku, nextQuantity) => {
    const item = lines.find(l => l.sku === sku);
    if (!item) return;
    await apiUpdateCartItem(item.productId, nextQuantity);
    await refreshCart();
  };

  const handleRemove = async (sku) => {
    const item = lines.find(l => l.sku === sku);
    if (!item) return;
    await apiRemoveCartItem(item.productId);
    await refreshCart();
  };

  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Giỏ hàng">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> / Giỏ hàng
        </div>

        <div className="page-title">Giỏ Hàng của Bạn</div>

        <div className="cart-wrapper">
          <div className="cart-items">
            {lines.length === 0 ? (
              <div className="cart-empty-state">
                <strong>Giỏ hàng đang trống</strong>
                <span>Hãy thêm vài món trước khi checkout nhé.</span>
              </div>
            ) : lines.map((item) => (
              <CartItem key={item.sku} item={item} onQuantityChange={handleQuantity} onRemove={handleRemove} />
            ))}
          </div>

          <aside className="cart-summary">
            <div className="summary-title">Tóm tắt đơn hàng</div>

            <div className="summary-row">
              <span>Tạm tính ({lines.length} sản phẩm)</span>
              <span className="price">{formatDisplayPrice(totals.subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Khuyến mãi</span>
              <span className="discount">- 0 đ</span>
            </div>

            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span className="price">{formatDisplayPrice(totals.total)}</span>
            </div>

            <div className="promo-code-section">
              <input type="text" placeholder="Nhập mã giảm giá" />
              <button type="button">Áp dụng</button>
            </div>

            <button className="checkout-btn" type="button" onClick={() => navigate('/checkout')}>Tiến hành thanh toán</button>

            <div className="return-policy">
              <div className="return-policy-icon">ℹ️</div>
              <div>Miễn phí đổi trả trong 7 ngày cho sản phẩm còn nguyên tem mác.</div>
            </div>
          </aside>
        </div>

        <div className="suggested-products">
          <div className="section-title">Sản Phẩm Gợi Ý Thêm</div>
          <div className="products-grid suggested-grid">
            {suggestedProducts.map((item, index) => (
              <ProductCard key={`${item.sku}-${index}`} product={item} onAddToCart={() => {}} showBadge={index % 3 === 1 || index % 4 === 2} badge={index % 3 === 1 ? '-20%' : 'Mới'} />
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
