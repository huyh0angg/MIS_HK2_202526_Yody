import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <section className="footer-section">
          <h3>Yody</h3>
          <p className="footer-section-description">Mặc đẹp mỗi ngày cùng Yody. Chúng tôi cam kết mang đến những sản phẩm chất lượng tốt nhất với giá cả hợp lý.</p>
          <div className="footer-social">
            <a href="#facebook" className="social-link">f</a>
            <a href="#instagram" className="social-link">in</a>
            <a href="#tiktok" className="social-link">tt</a>
          </div>
        </section>
        <section className="footer-section">
          <h3>Hỗ Trợ Khách Hàng</h3>
          <ul>
            <li><a href="#faq">Câu hỏi thường gặp</a></li>
            <li><a href="#shipping">Chính sách vận chuyển</a></li>
            <li><a href="#returns">Chính sách đổi trả</a></li>
            <li><a href="#contact">Liên hệ chúng tôi</a></li>
          </ul>
        </section>
        <section className="footer-section">
          <h3>Về Yody</h3>
          <ul>
            <li><a href="#about">Giới thiệu</a></li>
            <li><a href="#careers">Tuyển dụng</a></li>
          </ul>
        </section>
        <section className="footer-section">
          <h3>Đăng Ký Nhận Tin</h3>
          <p className="footer-newsletter-text">Đăng ký để nhận ưu đãi độc quyền và cập nhật sản phẩm mới nhất.</p>
          <div className="footer-newsletter">
            <input type="email" placeholder="Email của bạn" aria-label="Email nhận tin" />
            <button type="button">Đăng ký</button>
          </div>
        </section>
      </div>
      <div className="footer-bottom">© 2026 Yody Fashion. All rights reserved.</div>
    </footer>
  );
}
