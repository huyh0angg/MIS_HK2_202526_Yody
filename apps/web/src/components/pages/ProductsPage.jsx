import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../../data/catalog';
import Shell from '../common/Shell';
import ProductCard from '../UI/ProductCard';

const PRICE_RANGES = [
  { label: '0 - 200.000 VNĐ', min: 0, max: 200000 },
  { label: '200.000 - 500.000 VNĐ', min: 200000, max: 500000 },
  { label: '500.000 - 1.000.000 VNĐ', min: 500000, max: 1000000 },
  { label: 'Trên 1.000.000 VNĐ', min: 1000000, max: Infinity },
];

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ALL_COLORS = ['Trắng', 'Đen', 'Navy', 'Kem', 'Hồng', 'Xanh', 'Be', 'Xanh rêu', 'Xanh dương', 'Vàng', 'Đỏ'];

function toggle(set, value) {
  const next = new Set(set);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
}

export default function ProductsPage({ products, cartCount, onAddToCart, onQuickLogout }) {
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'Tất cả');
  const [sortBy, setSortBy] = useState('Mới nhất');

  useEffect(() => {
    setCategory(searchParams.get('category') || 'Tất cả');
    if (searchParams.get('search') !== null) {
      setQuery(searchParams.get('search') || '');
    }
  }, [searchParams]);
  const [selectedPrices, setSelectedPrices] = useState(new Set());
  const [selectedSizes, setSelectedSizes] = useState(new Set());
  const [selectedColors, setSelectedColors] = useState(new Set());

  const availableSizes = useMemo(() => {
    const sizes = new Set();
    products.forEach(p => (p.sizes || []).forEach(s => sizes.add(s)));
    const ordered = ALL_SIZES.filter(s => sizes.has(s));
    sizes.forEach(s => { if (!ALL_SIZES.includes(s)) ordered.push(s); });
    return ordered;
  }, [products]);

  const availableColors = useMemo(() => {
    const colors = new Set();
    products.forEach(p => (p.colors || []).forEach(c => colors.add(c)));
    const ordered = ALL_COLORS.filter(c => colors.has(c));
    colors.forEach(c => { if (!ALL_COLORS.includes(c)) ordered.push(c); });
    return ordered;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const next = products.filter((product) => {
      const matchesQuery = `${product.name} ${product.sku} ${product.shortDescription ?? ''}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'Tất cả' || product.category === category;

      const matchesPrice = selectedPrices.size === 0 || [...selectedPrices].some(label => {
        const range = PRICE_RANGES.find(r => r.label === label);
        return range && product.priceCents >= range.min && product.priceCents < range.max;
      });

      const matchesSize = selectedSizes.size === 0 || (product.sizes || []).some(s => selectedSizes.has(s));
      const matchesColor = selectedColors.size === 0 || (product.colors || []).some(c => selectedColors.has(c));

      return matchesQuery && matchesCategory && matchesPrice && matchesSize && matchesColor;
    });

    switch (sortBy) {
      case 'Mới nhất':
        return [...next].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      case 'Bán chạy nhất':
        return [...next].sort((a, b) => {
          const tagScore = (p) => p.tag === 'Bán chạy' ? 2 : p.tag === 'Hot' ? 1 : 0;
          const diff = tagScore(b) - tagScore(a);
          return diff !== 0 ? diff : (a.stock ?? 999) - (b.stock ?? 999);
        });
      case 'Giá: Thấp đến cao':
        return [...next].sort((a, b) => a.priceCents - b.priceCents);
      case 'Giá: Cao đến thấp':
        return [...next].sort((a, b) => b.priceCents - a.priceCents);
      case 'Đánh giá cao nhất':
        return [...next].sort((a, b) => (b.ratingCount ?? 0) - (a.ratingCount ?? 0));
      default:
        return next;
    }
  }, [category, products, query, sortBy, selectedPrices, selectedSizes, selectedColors]);

  const hasActiveFilters = selectedPrices.size > 0 || selectedSizes.size > 0 || selectedColors.size > 0;

  const clearFilters = () => {
    setSelectedPrices(new Set());
    setSelectedSizes(new Set());
    setSelectedColors(new Set());
    setQuery('');
    setCategory('Tất cả');
  };

  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Sản phẩm mới">
      <div className="container catalog-layout">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link> / Sản phẩm mới
        </div>

        <div className="page-header">
          <div className="page-title">Sản Phẩm Mới</div>
          <div className="page-description">Khám phá các bộ sưu tập mới nhất của Yody Fashion</div>
        </div>

        <aside className="filter-section">
          {hasActiveFilters && (
            <button type="button" className="filter-clear-btn" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}

          <div className="filter-group">
            <div className="filter-label">Danh Mục</div>
            <div className="filter-options">
              {categories.slice(1).map((item) => (
                <label className="filter-option" key={item}>
                  <input type="radio" name="product-category" checked={category === item} onChange={() => setCategory(item)} />
                  <span>{item}</span>
                </label>
              ))}
              <label className="filter-option">
                <input type="radio" name="product-category" checked={category === 'Tất cả'} onChange={() => setCategory('Tất cả')} />
                <span>Tất cả</span>
              </label>
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-label">Tìm kiếm</div>
            <input className="input" placeholder="Tìm sản phẩm..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          <div className="filter-group">
            <div className="filter-label">Giá</div>
            <div className="filter-options">
              {PRICE_RANGES.map((range) => (
                <label className="filter-option" key={range.label}>
                  <input
                    type="checkbox"
                    checked={selectedPrices.has(range.label)}
                    onChange={() => setSelectedPrices(prev => toggle(prev, range.label))}
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {availableSizes.length > 0 && (
            <div className="filter-group">
              <div className="filter-label">Kích Thước</div>
              <div className="filter-options">
                {availableSizes.map((size) => (
                  <label className="filter-option" key={size}>
                    <input
                      type="checkbox"
                      checked={selectedSizes.has(size)}
                      onChange={() => setSelectedSizes(prev => toggle(prev, size))}
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {availableColors.length > 0 && (
            <div className="filter-group">
              <div className="filter-label">Màu Sắc</div>
              <div className="filter-options">
                {availableColors.map((color) => (
                  <label className="filter-option" key={color}>
                    <input
                      type="checkbox"
                      checked={selectedColors.has(color)}
                      onChange={() => setSelectedColors(prev => toggle(prev, color))}
                    />
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="main-content">
          <div className="sort-section">
            <span className="product-count">Hiển thị {filteredProducts.length} sản phẩm</span>
            <div>
              <label className="sort-label">Sắp xếp theo:</label>
              <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option>Mới nhất</option>
                <option>Bán chạy nhất</option>
                <option>Giá: Thấp đến cao</option>
                <option>Giá: Cao đến thấp</option>
                <option>Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          <div className="products-grid catalog-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((item) => (
                <ProductCard key={item.sku} product={item} onAddToCart={onAddToCart} showBadge badge={item.tag || 'MỚI'} />
              ))
            ) : (
              <div className="filter-empty-state">Không tìm thấy sản phẩm phù hợp. <button type="button" onClick={clearFilters}>Xóa bộ lọc</button></div>
            )}
          </div>

          <div className="pagination">
            <button type="button" className="active">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">4</button>
            <span>...</span>
            <button type="button">10</button>
            <button type="button">Tiếp theo</button>
          </div>
        </main>
      </div>
    </Shell>
  );
}
