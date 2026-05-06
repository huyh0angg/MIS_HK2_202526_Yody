import React from 'react';
import { Link } from 'react-router-dom';
import { productEmoji, formatDisplayPrice } from '../../lib/helpers';

export default function ProductCard({ product, showBadge = false, badge = 'MỚI', onAddToCart }) {
  const handleAddToCart = (e) => {
    e.preventDefault();
    onAddToCart?.(product);
  };

  const imageUrl = product.image_url || product.imageUrl;
  const discountPercent = Number(product.discountPercent ?? product.discount_percent ?? 0);
  const hasDiscount = discountPercent > 0;
  const originalPrice = hasDiscount
    ? Math.round(product.priceCents / (1 - discountPercent / 100))
    : null;

  return (
    <Link to={`/products/${product.sku}`} className="product-card">
      <div className="product-image">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} className="product-card-image" />
        ) : productEmoji(product)}
        {showBadge && <span className="new-badge">{badge}</span>}
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <div className="product-rating">⭐⭐⭐⭐⭐ ({product.ratingCount ?? 125})</div>
        <div className="product-price">
          <span className="current-price">{formatDisplayPrice(product.priceCents)}</span>
          {hasDiscount && <span className="original-price">{formatDisplayPrice(originalPrice)}</span>}
        </div>
        <button className="product-button" type="button" onClick={handleAddToCart}>
          Thêm vào giỏ
        </button>
      </div>
    </Link>
  );
}
