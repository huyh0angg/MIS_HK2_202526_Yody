import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStoreOrder, fetchCart } from '../../lib/api';
import { calculateCartTotals, setLatestOrder } from '../../lib/storage';
import { formatDisplayPrice, productEmoji, paymentLabel } from '../../lib/helpers';
import { paymentMethods } from '../../data/catalog.js';
import { provinces, getDistricts, getWards } from '../../data/addressData';
import Shell from '../common/Shell';

export default function CheckoutPage({ products, cartCount, onCartMutate, onQuickLogout }) {
  const navigate = useNavigate();
  const [lines, setLines] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', email: '',
    province: '', district: '', ward: '', address: '', note: ''
  });

  const districts = useMemo(() => getDistricts(form.province), [form.province]);
  const wards = useMemo(() => getWards(form.province, form.district), [form.province, form.district]);

  const totals = useMemo(() => calculateCartTotals(lines), [lines]);
  const shippingFee = shippingMethod === 'express' ? 50000 : shippingMethod === 'same-day' ? 80000 : 30000;
  const finalTotal = totals.total + shippingFee;

  useEffect(() => {
    fetchCart().then(items => {
      setLines(items.map(item => ({
        productId: item.productId,
        sku: item.productSku,
        name: item.productName,
        imageUrl: item.imageUrl || item.image_url || null,
        priceCents: item.priceCents,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })));
    });
  }, [cartCount]);

  const setField = (field, value) => {
    if (field === 'province') {
      setForm(f => ({ ...f, province: value, district: '', ward: '' }));
    } else if (field === 'district') {
      setForm(f => ({ ...f, district: value, ward: '' }));
    } else {
      setForm(f => ({ ...f, [field]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const order = await createStoreOrder({
      shipping: {
        fullName: form.fullName,
        phone: form.phone,
        province: form.province,
        district: form.district,
        ward: form.ward,
        address: form.address,
        note: form.note
      },
      paymentMethod,
      totalCents: finalTotal,
      subtotalCents: totals.subtotal,
      discountCents: totals.discount,
      shippingCents: shippingFee,
      items: lines.map(item => ({
        productId: item.productId,
        productName: item.name,
        productImage: item.imageUrl || null,
        priceCents: item.priceCents,
        quantity: item.quantity,
        subtotalCents: item.lineTotal,
      }))
    });

    setLatestOrder({
      ...order,
      customer: form,
      paymentMethod,
      shippingMethod,
      shippingCents: shippingFee,
      subtotalCents: totals.subtotal,
      totalCents: finalTotal,
      items: lines
    });
    onCartMutate();
    setSubmitting(false);
    navigate('/order-confirm');
  };

  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Thanh toán">
      <div className="container">
        <div className="checkout-wrapper">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <div className="section-title">Thông tin khách hàng</div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullname">Họ và tên *</label>
                  <input id="fullname" type="text" placeholder="Nhập họ và tên" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại *</label>
                  <input id="phone" type="tel" placeholder="Nhập số điện thoại" value={form.phone} onChange={(e) => setField('phone', e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">Địa chỉ giao hàng</div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="province">Tỉnh / Thành phố *</label>
                  <select id="province" value={form.province} onChange={(e) => setField('province', e.target.value)} required>
                    <option value="">Chọn tỉnh / thành phố</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="district">Quận / Huyện *</label>
                  <select id="district" value={form.district} onChange={(e) => setField('district', e.target.value)} required disabled={!form.province}>
                    <option value="">Chọn quận / huyện</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ward">Phường / Xã *</label>
                  <select id="ward" value={form.ward} onChange={(e) => setField('ward', e.target.value)} required disabled={!form.district}>
                    <option value="">Chọn phường / xã</option>
                    {wards.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="address">Địa chỉ cụ thể *</label>
                  <input id="address" type="text" placeholder="Số nhà, tên đường..." value={form.address} onChange={(e) => setField('address', e.target.value)} required />
                </div>
              </div>

              <div className="form-row full">
                <div className="form-group">
                  <label htmlFor="note">Ghi chú đơn hàng</label>
                  <input id="note" type="text" placeholder="Ghi chú thêm (không bắt buộc)" value={form.note} onChange={(e) => setField('note', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">Phương thức vận chuyển</div>
              <div className="shipping-method">
                {[
                  { code: 'standard', label: 'Giao hàng tiêu chuẩn', description: 'Nhận hàng trong 3 - 5 ngày làm việc', fee: '30.000đ' },
                  { code: 'express', label: 'Giao hàng nhanh', description: 'Nhận hàng trong 1 - 2 ngày làm việc', fee: '50.000đ' },
                  { code: 'same-day', label: 'Giao hàng trong ngày', description: 'Nhận hàng trước 20:00 hôm nay (Chỉ áp dụng nội thành)', fee: '80.000đ' }
                ].map((option) => (
                  <label className="shipping-option" key={option.code}>
                    <div>
                      <span><input type="radio" name="shipping" value={option.code} checked={shippingMethod === option.code} onChange={(e) => setShippingMethod(e.target.value)} />{option.label}</span>
                      <small>{option.description}</small>
                    </div>
                    <div className="shipping-fee">{option.fee}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">Phương thức thanh toán</div>
              <div className="payment-method">
                {paymentMethods.map((method) => (
                  <label className="payment-option" key={method.code}>
                    <input type="radio" name="payment" value={method.code} checked={paymentMethod === method.code} onChange={(e) => setPaymentMethod(e.target.value)} />
                    <span>{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </form>

          <div className="checkout-summary">
            <div className="summary-title">Tóm tắt đơn hàng</div>

            {lines.length === 0 ? (
              <div className="cart-empty-state">Giỏ hàng rỗng. Vui lòng quay lại chọn sản phẩm.</div>
            ) : lines.map((item) => (
              <div className="summary-item" key={item.sku}>
                <div className="summary-thumb">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    productEmoji(item)
                  )}
                </div>
                <div className="item-details">
                  <div className="item-name">{item.name}</div>
                  <div className="item-qty">x{item.quantity}</div>
                </div>
                <div className="item-price">{formatDisplayPrice(item.lineTotal)}</div>
              </div>
            ))}

            <div className="promo-code-section" style={{ display: 'flex', gap: 12, margin: '18px 0 20px' }}>
              <input type="text" placeholder="Nhập mã giảm giá" />
              <button type="button">Áp dụng</button>
            </div>

            <div className="summary-row">
              <span>Tạm tính</span>
              <span>{formatDisplayPrice(totals.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <span>{formatDisplayPrice(shippingFee)}</span>
            </div>
            <div className="summary-row">
              <span>Giảm giá</span>
              <span style={{ color: '#ff8c00' }}>-{formatDisplayPrice(totals.discount)}</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng</span>
              <span className="price">{formatDisplayPrice(finalTotal)}</span>
            </div>

            <div className="summary-note">↪ Đổi trả dễ dàng trong 7 ngày.</div>

            <button className="checkout-btn" type="button" onClick={handleSubmit} disabled={submitting || lines.length === 0}>
              {submitting ? 'Đang xử lý...' : 'Đặt hàng →'}
            </button>
            <button className="checkout-btn" type="button" style={{ background: '#f5f5f5', color: '#002D5E', marginTop: 12 }} onClick={() => navigate('/cart')}>
              Quay lại giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
