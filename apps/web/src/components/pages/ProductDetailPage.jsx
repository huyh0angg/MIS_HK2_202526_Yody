import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProductBySku } from '../../data/catalog';
import { fetchStorefrontProduct } from '../../lib/api';
import { productEmoji, formatDisplayPrice, colorSwatchStyle } from '../../lib/helpers';
import Shell from '../common/Shell';
import ProductCard from '../UI/ProductCard';

export default function ProductDetailPage({ products, cartCount, onAddToCart, onQuickLogout }) {
  const navigate = useNavigate();
  const { sku } = useParams();
  const fallbackProduct = products.find((item) => item.sku === sku) || getProductBySku(sku) || products[0];
  const [product, setProduct] = useState(fallbackProduct);
  const relatedProducts = useMemo(() => {
    const sameCategory = products.filter((item) => item.category === product?.category && item.sku !== product?.sku).slice(0, 3);
    if (sameCategory.length) {
      return sameCategory;
    }
    return products.filter((item) => item.sku !== product?.sku).slice(0, 3);
  }, [product?.category, product?.sku, products]);
  const [selectedSize, setSelectedSize] = useState(fallbackProduct?.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(fallbackProduct?.colors?.[0] || 'Navy');
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = product?.images?.length ? product.images.map(img => img.url || img) : null;
  const discountPercent = Number(product?.discountPercent ?? product?.discount_percent ?? 0);
  const hasDiscount = discountPercent > 0;
  const originalPrice = hasDiscount
    ? Math.round(product.priceCents / (1 - discountPercent / 100))
    : null;

  useEffect(() => {
    let active = true;

    setProduct(fallbackProduct);
    fetchStorefrontProduct(sku).then((payload) => {
      if (active && payload) {
        setProduct(payload);
        setSelectedSize(payload.sizes?.[0] || 'M');
        setSelectedColor(payload.colors?.[0] || 'Navy');
      }
    });

    return () => {
      active = false;
    };
  }, [fallbackProduct, sku]);

  useEffect(() => {
    setSelectedSize(product.sizes?.[0] || 'M');
    setSelectedColor(product.colors?.[0] || 'Navy');
  }, [product]);

  if (!product) {
    return (
      <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Chi tiết sản phẩm">
        <div className="card panel empty-state">Không có dữ liệu sản phẩm.</div>
      </Shell>
    );
  }

  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Chi tiết sản phẩm">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> / {product.category} / {product.name}
        </div>

        <section className="product-wrapper">
          <div className="product-gallery">
            <div className="thumbnail-images">
              {images ? images.map((url, index) => (
                <div
                  className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={url} alt={`${product.name} - ảnh ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                </div>
              )) : (
                <div className="thumbnail active">{productEmoji(product)}</div>
              )}
            </div>
            <div className="main-image" style={{ overflow: 'hidden' }}>
              {images ? (
                <img
                  src={images[activeImageIndex]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : productEmoji(product)}
            </div>
          </div>

          <div className="product-details">
            <div className="product-title">{product.name}</div>

            <div className="product-rating">
              <span className="stars">⭐⭐⭐⭐⭐</span>
              <span className="review-count">({product.ratingCount ?? 124} đánh giá)</span>
            </div>

            <div className="product-price">
              <span className="current-price">{formatDisplayPrice(product.priceCents)}</span>
              {hasDiscount && <span className="original-price">{formatDisplayPrice(originalPrice)}</span>}
              {hasDiscount && <span className="discount-badge">-{discountPercent}%</span>}
            </div>

            <div className="description">{product.description}</div>

            <div className="product-info">
              <div className="info-row">
                <span className="info-label">Màu sắc:</span>
                <span className="info-value">{selectedColor}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Kích thước:</span>
                <span className="info-value">{selectedSize}</span>
              </div>
            </div>

            <div className="options">
              <div className="option-group">
                <span className="option-label">Màu sắc</span>
                <div className="option-values">
                  {product.colors?.map((color) => (
                    <button
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      key={color}
                      type="button"
                      aria-label={`Chọn màu ${color}`}
                      style={colorSwatchStyle(color)}
                      onClick={() => setSelectedColor(color)}
                    >
                      <span className="sr-only">{color}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <span className="option-label">Kích thước</span>
                <div className="option-values">
                  {product.sizes?.map((size) => (
                    <button
                      className={`option-btn ${selectedSize === size ? 'selected' : ''}`}
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <span className="option-label">Số lượng</span>
                <div className="quantity-select">
                  <div className="quantity-input">
                    <button className="quantity-btn" type="button">−</button>
                    <input className="quantity-value" type="number" value="1" readOnly />
                    <button className="quantity-btn" type="button">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              <button className="add-to-cart-btn" type="button" onClick={() => { onAddToCart(product); navigate('/cart'); }}>
                🛒 Thêm vào giỏ hàng
              </button>
              <button className="buy-now-btn" type="button" onClick={() => { onAddToCart(product); navigate('/checkout'); }}>
                Mua ngay
              </button>
            </div>

            <div className="extra-info">
              <div className="extra-info-item">
                <div className="extra-info-icon">🚚</div>
                <div>Miễn phí giao hàng</div>
              </div>
              <div className="extra-info-item">
                <div className="extra-info-icon">🎁</div>
                <div>Được tặng voucher</div>
              </div>
              <div className="extra-info-item">
                <div className="extra-info-icon">✓</div>
                <div>Chính hãng 100%</div>
              </div>
            </div>
          </div>
        </section>

        <section className="product-tabs">
          <div className="tabs-header">
            <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('description')}>Mô tả</button>
            <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('details')}>Chi tiết & Bảo quản</button>
            <button className={`tab-btn ${activeTab === 'care' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('care')}>Hướng dẫn kiểm thước</button>
            <button className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('shipping')}>Vận chuyển & Đổi trả</button>
            <button className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('reviews')}>Đánh giá (124)</button>
          </div>

          <div className={`tab-content ${activeTab === 'description' ? 'active' : ''}`}>
            <h3>Mô Tả Sản Phẩm</h3>
            <p>{product.description}</p>
            <p>Chất liệu mềm mại, giữ form tốt và dễ phối đồ cho nhiều hoàn cảnh sử dụng.</p>
            <p>Thiết kế tối giản, hiện đại, phù hợp mặc hằng ngày hoặc đi chơi cuối tuần.</p>
          </div>

          <div className={`tab-content ${activeTab === 'details' ? 'active' : ''}`}>
            <h3>Chất liệu & Bảo Quản</h3>
            <p><strong>Thành phần:</strong> Cotton, Polyester, Spandex</p>
            <p><strong>Cách bảo quản:</strong> Giặt tay hoặc máy giặt ở nhiệt độ tối đa 30°C. Không sử dụng chất tẩy. Phơi nơi thoáng mát.</p>
          </div>

          <div className={`tab-content ${activeTab === 'care' ? 'active' : ''}`}>
            <h3>Hướng Dẫn Kích Thước</h3>
            {product.sizes?.map((size, index) => (
              <p key={size}>Size {size}: Tham khảo số đo chuẩn và chọn theo form mặc yêu thích #{index + 1}</p>
            ))}
          </div>

          <div className={`tab-content ${activeTab === 'shipping' ? 'active' : ''}`}>
            <h3>Vận Chuyển & Đổi Trả</h3>
            <p><strong>Vận chuyển:</strong> Miễn phí vận chuyển toàn quốc cho đơn hàng đủ điều kiện.</p>
            <p><strong>Thời gian giao hàng:</strong> 1-3 ngày làm việc tại thành phố lớn, 2-5 ngày với các tỉnh khác.</p>
            <p><strong>Chính sách đổi trả:</strong> Chấp nhận đổi/trả trong 30 ngày nếu lỗi do nhà sản xuất.</p>
          </div>

          <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
            <h3>Đánh Giá Từ Khách Hàng</h3>
            <p>Sản phẩm có 124 đánh giá từ khách hàng. Mức đánh giá trung bình: 4.8/5.0 sao.</p>
            <p>Khách hàng đánh giá cao chất lượng, form dáng và độ thoáng mát của sản phẩm.</p>
          </div>
        </section>

        <section className="related-products">
          <div className="section-title">Sản Phẩm Liên Quan</div>
          <div className="products-grid related-grid">
            {relatedProducts.length ? relatedProducts.map((item) => (
              <ProductCard key={item.sku} product={item} onAddToCart={onAddToCart} />
            )) : <div className="empty-state">Chưa có sản phẩm liên quan trong nhóm này.</div>}
          </div>
        </section>
      </div>
    </Shell>
  );
}
