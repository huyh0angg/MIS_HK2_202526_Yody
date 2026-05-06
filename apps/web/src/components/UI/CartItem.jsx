import React from 'react';
import { productEmoji, formatDisplayPrice } from '../../lib/helpers';

export default function CartItem({ item, onQuantityChange, onRemove }) {
  const imageUrl = item.imageUrl || item.image_url;

  return (
    <article className="cart-item">
      <div className="item-image">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="item-image-photo" />
        ) : (
          productEmoji(item)
        )}
      </div>
      <div className="item-name">{item.name}</div>
      <div className="item-size-color">Màu sắc: {item.colors?.[0] || 'Navy'} | Kích cỡ: {item.sizes?.[0] || 'One size'}</div>
      <div className="item-price">{formatDisplayPrice(item.priceCents)}</div>
      <div className="item-quantity">
        <button className="quantity-btn" type="button" onClick={() => onQuantityChange(item.sku, item.quantity - 1)}>−</button>
        <input className="quantity-input" type="number" value={item.quantity} readOnly />
        <button className="quantity-btn" type="button" onClick={() => onQuantityChange(item.sku, item.quantity + 1)}>+</button>
      </div>
      <div className="item-divider" />
      <button className="item-wishlist" type="button">♡ Lưu vào yêu thích</button>
      <div className="item-total">Tổng: {formatDisplayPrice(item.lineTotal)}</div>
      <div className="item-remove">
        <button className="remove-btn" type="button" onClick={() => onRemove(item.sku)}>🗑️</button>
      </div>
    </article>
  );
}
