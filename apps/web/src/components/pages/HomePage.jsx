import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Shell from '../common/Shell';
import ProductCard from '../UI/ProductCard';

const BANNER_IMAGE_URL = 'https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-6/677094412_1334720288709497_6542534204058565144_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=104&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeGzQAaubow0vzWHySBewruB8Rjq0kX8tlXxGOrSRfy2VeYV5jQOZxevbMWhAYst9pXgC1uHoDzwNSVbdvGSdBtz&_nc_ohc=U9UICQnkDekQ7kNvwGn-CUI&_nc_oc=Adra_vAzEZ4GfvPx3zM2007x-HwxeLaGrt56sPDk7z-GeenH-LEw1yqPj7d3TOsH8jM&_nc_zt=23&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=2YDO9uZhRVyuO-5Xjl7sIA&_nc_ss=7b2a8&oh=00_Af5PvjOlfjrm0l6zSLajWHBcC0RZJcd5oGKsPQe00HRrLg&oe=6A009744';

export default function HomePage({ products, cartCount, onAddToCart, onQuickLogout }) {
  const featuredProducts = useMemo(() => {
    return products.filter((product) => product.featured).slice(0, 4);
  }, [products]);

  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Yody Fashion">
      <section className="banner banner-image-hero">
        <img className="banner-image" src={BANNER_IMAGE_URL} alt="Khuyến mãi mùa hè Yody" />
        <div className="banner-overlay" />
        <div className="banner-content">
          <h1>Khuyến Mãi Mùa Hè</h1>
          <p>Giảm đến 50% cho tất cả sản phẩm. Mua sắm ngay hôm nay!</p>
          <Link className="banner-button" to="/products">Mua Ngay</Link>
        </div>
      </section>

      <div className="container" style={{ paddingTop: 40 }}>
        <div className="section-title">Sản Phẩm Nổi Bật</div>
        <div className="products-grid home-grid">
          {featuredProducts.map((item) => (
            <ProductCard key={item.sku} product={item} onAddToCart={onAddToCart} showBadge badge={item.tag || 'Nổi bật'} />
          ))}
        </div>
      </div>
    </Shell>
  );
}
