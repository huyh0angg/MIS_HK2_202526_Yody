import { paymentMethods } from '../data/catalog.js';

export function formatDisplayPrice(value) {
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value)} VNĐ`;
}

export function productEmoji(product) {
  if (!product) return '🛍️';
  if (product.category === 'Nam') return '👕';
  if (product.category === 'Nữ') return '👗';
  if (product.category === 'Trẻ em') return '🧒';
  return '👜';
}

export function colorSwatchStyle(color) {
  const palette = {
    Navy: '#001a33',
    Trắng: '#f5f5f5',
    Đen: '#333333',
    Kem: '#f3e7d3',
    Hồng: '#e9b3c4',
    Xanh: '#87ceeb',
    Be: '#d8c3a5',
    'Xanh rêu': '#6b8f71',
    'Xanh dương': '#5b7db8',
    Vàng: '#f1d04d'
  };

  return { backgroundColor: palette[color] || '#d1d5db' };
}

export function ratingText(product, fallbackIndex = 0) {
  const counts = [125, 98, 156, 82, 45, 67, 112, 58];
  const count = product?.ratingCount ?? counts[fallbackIndex % counts.length];
  return `⭐⭐⭐⭐⭐ (${count})`;
}

export function paymentLabel(code) {
  return paymentMethods.find((item) => item.code === code)?.label || code;
}

export function paymentDescription(code) {
  return paymentMethods.find((item) => item.code === code)?.description || 'Thanh toán đơn hàng';
}
