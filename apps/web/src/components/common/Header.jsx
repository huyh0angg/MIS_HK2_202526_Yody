import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthSession } from '../../hooks/useAuthSession';

export default function Header({ cartCount, onQuickLogout }) {
  const navigate = useNavigate();
  const auth = useAuthSession();
  const authSession = auth?.authSession;
  const isAdmin = authSession?.user?.role?.toLowerCase() === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');

  const categoryNavClass = (cat) => ({ isActive }) =>
    isActive && currentCategory === cat ? 'active' : undefined;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTopbarLogout = () => {
    onQuickLogout?.();
    navigate('/login', { state: { reason: 'logged-out' } });
  };

  return (
    <header className="topbar">
      <div className="header-content">
        <Link className="brand" to="/">Yody</Link>
        <nav className="nav-menu" aria-label="Điều hướng chính">
          <NavLink to="/products" end className={({ isActive }) => isActive && !currentCategory ? 'active' : undefined}>Sản phẩm mới</NavLink>
          <NavLink to="/products?category=Nữ" className={categoryNavClass('Nữ')}>Nữ</NavLink>
          <NavLink to="/products?category=Nam" className={categoryNavClass('Nam')}>Nam</NavLink>
          <NavLink to="/products?category=Trẻ em" className={categoryNavClass('Trẻ em')}>Trẻ em</NavLink>
          <NavLink to="/products?category=Phụ kiện" className={categoryNavClass('Phụ kiện')}>Phụ kiện</NavLink>
        </nav>
        <form className="search-bar" role="search" aria-label="Tìm kiếm sản phẩm" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Tìm kiếm sản phẩm"
          />
          <button type="submit" aria-label="Tìm kiếm">🔍</button>
        </form>
        <div className="header-actions">
          <a href="#favorites" aria-label="Danh sách yêu thích">❤️</a>
          <Link className="cart-icon" to="/cart" aria-label={`Giỏ hàng hiện có ${cartCount} sản phẩm`}>
            🛒 <span className="cart-count">{cartCount}</span>
          </Link>
          <details className="user-dropdown">
            <summary aria-label={authSession ? `Mở menu tài khoản ${authSession.user?.email || ''}` : 'Mở menu tài khoản'}>👤</summary>
            <div className="dropdown-menu">
              {authSession ? (
                <>
                  <span className="dropdown-user">{authSession.user?.email || 'demo@yody.vn'}</span>
                  <NavLink to="/customer">Khách hàng</NavLink>
                  {isAdmin ? <NavLink to="/admin">Admin</NavLink> : null}
                  <button type="button" onClick={handleTopbarLogout}>Đăng xuất</button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Đăng nhập</NavLink>
                  <NavLink to="/register">Đăng ký</NavLink>
                </>
              )}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
