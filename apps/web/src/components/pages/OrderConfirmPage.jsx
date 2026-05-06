import React from 'react';
import { Link } from 'react-router-dom';
import { getLatestOrder } from '../../lib/storage';
import { formatDisplayPrice, productEmoji, paymentLabel, paymentDescription } from '../../lib/helpers';
import Shell from '../common/Shell';

function getDeliveryDate(order) {
  const base = new Date(order?.created_at || Date.now());
  const days = order?.shippingMethod === 'express' ? 2 : order?.shippingMethod === 'same-day' ? 0 : 5;
  base.setDate(base.getDate() + days);
  return base.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function OrderConfirmPage({ cartCount, onQuickLogout }) {
  const order = getLatestOrder();
  const items = order?.items || [];
  const subtotalCents = items.reduce((sum, item) => sum + (item.lineTotal || item.priceCents * item.quantity || 0), 0);
  const totalCents = order?.totalCents ?? order?.total_cents ?? subtotalCents;
  const shippingCents = totalCents - subtotalCents;
  const customer = order?.customer || {};
  const paymentCode = order?.paymentMethod || order?.payment_method || 'COD';

  const addressParts = [customer.address, customer.ward, customer.district, customer.province].filter(Boolean);
  const fullAddress = addressParts.join(', ') || 'Chưa có địa chỉ';

  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Xác nhận đơn hàng">
      <div className="container">
        {order ? (
          <>
            <div className="oc-success-header">
              <div className="oc-success-icon">✓</div>
              <h1 className="oc-success-title">Đặt hàng thành công!</h1>
              <p className="oc-success-message">
                Cảm ơn bạn đã mua sắm cùng Yody. Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
              </p>
            </div>

            <div className="oc-content-grid">
              <div className="oc-left-column">
                <div className="oc-card oc-order-meta">
                  <div className="oc-order-meta-top">
                    <div className="oc-meta-block">
                      <div className="oc-meta-label">Mã đơn hàng</div>
                      <div className="oc-meta-value">{order.id || '—'}</div>
                    </div>
                    <div className="oc-meta-block oc-meta-right">
                      <div className="oc-meta-label">Dự kiến giao hàng</div>
                      <div className="oc-meta-value">{getDeliveryDate(order)}</div>
                    </div>
                  </div>

                  <div className="oc-order-status">
                    <div className="oc-status-step oc-done">
                      <div className="oc-status-icon">✓</div>
                      <div className="oc-status-title">Đặt hàng</div>
                      <div className="oc-status-subtitle">Đã xác nhận</div>
                    </div>
                    <div className="oc-status-step oc-active">
                      <div className="oc-status-icon">⏺</div>
                      <div className="oc-status-title">Đang xử lý</div>
                      <div className="oc-status-subtitle">Hiện tại</div>
                    </div>
                    <div className="oc-status-step">
                      <div className="oc-status-icon">○</div>
                      <div className="oc-status-title">Giao hàng</div>
                      <div className="oc-status-subtitle">Sắp tới</div>
                    </div>
                    <div className="oc-status-step">
                      <div className="oc-status-icon">○</div>
                      <div className="oc-status-title">Đã nhận</div>
                      <div className="oc-status-subtitle">Sắp tới</div>
                    </div>
                  </div>
                </div>

                <div className="oc-info-grid">
                  <div className="oc-card oc-info-card">
                    <div className="oc-info-title">Địa chỉ nhận hàng</div>
                    <div className="oc-info-line">
                      <span className="oc-info-label">Người nhận</span>
                      <span className="oc-info-value">{customer.fullName || '—'}</span>
                    </div>
                    <div className="oc-info-line">
                      <span className="oc-info-label">Địa chỉ</span>
                      <span className="oc-info-value">{fullAddress}</span>
                    </div>
                    <div className="oc-info-line">
                      <span className="oc-info-label">SĐT</span>
                      <span className="oc-info-value">{customer.phone || '—'}</span>
                    </div>
                  </div>

                  <div className="oc-card oc-info-card">
                    <div className="oc-info-title">Phương thức thanh toán</div>
                    <div className="oc-info-line">
                      <span className="oc-info-label">Hình thức</span>
                      <span className="oc-info-value">{paymentLabel(paymentCode)}</span>
                    </div>
                    <div className="oc-payment-note">{paymentDescription(paymentCode)}</div>
                  </div>
                </div>
              </div>

              <div className="oc-card oc-summary">
                <div className="oc-summary-title">Tóm tắt đơn hàng</div>

                {items.map((item) => (
                  <div className="oc-summary-item" key={item.sku || item.productId}>
                    <div className="oc-summary-left">
                      <div className="oc-summary-thumb">
                        {(item.imageUrl || item.image_url || item.productImage) ? (
                          <img src={item.imageUrl || item.image_url || item.productImage} alt={item.name} />
                        ) : (
                          productEmoji(item)
                        )}
                      </div>
                      <div>
                        <div className="oc-summary-name">{item.name}</div>
                        <div className="oc-summary-sub">SL: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="oc-summary-price">{formatDisplayPrice(item.lineTotal || item.priceCents * item.quantity)}</div>
                  </div>
                ))}

                <div className="oc-summary-breakdown">
                  <div className="oc-breakdown-row">
                    <span>Tạm tính</span>
                    <span>{formatDisplayPrice(subtotalCents)}</span>
                  </div>
                  {shippingCents > 0 && (
                    <div className="oc-breakdown-row">
                      <span>Phí vận chuyển</span>
                      <span>{formatDisplayPrice(shippingCents)}</span>
                    </div>
                  )}
                  <div className="oc-breakdown-row oc-total">
                    <span>Tổng cộng</span>
                    <span className="oc-total-amount">{formatDisplayPrice(totalCents)}</span>
                  </div>
                </div>

                <div className="oc-shipping-note">↪ Theo dõi đơn hàng được cập nhật liên tục.</div>

                <div className="oc-cta-buttons">
                  <Link className="oc-btn oc-btn-primary" to="/customer">Theo dõi đơn hàng</Link>
                  <Link className="oc-btn oc-btn-secondary" to="/products">Tiếp tục mua sắm</Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="oc-empty">
            Chưa có đơn hàng nào. Hãy đặt hàng từ trang thanh toán trước nhé.
          </div>
        )}
      </div>
    </Shell>
  );
}
