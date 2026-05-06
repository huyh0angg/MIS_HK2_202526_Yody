import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { loginCustomer } from '../../lib/api';
import { setAuthSession, clearAuthSession } from '../../lib/storage';
import { useAuthSession } from '../../hooks/useAuthSession';

export default function LoginPage({ cartCount, onQuickLogout }) {
  const auth = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const session = auth?.authSession || null;
  const setSession = auth?.setAuthSession || (() => {});
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (location.state?.reason === 'auth-required') {
      setError('Bạn cần đăng nhập để truy cập trang này.');
      setMessage('');
      return;
    }

    if (location.state?.reason === 'admin-required') {
      setError('Bạn cần tài khoản admin để truy cập dashboard admin.');
      setMessage('');
      return;
    }

    if (location.state?.reason === 'logged-out') {
      setMessage('Bạn đã đăng xuất thành công.');
      setError('');
    }
  }, [location.state]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = await loginCustomer(loginForm);
      const normalizedEmail = payload.user?.email || loginForm.email;
      const normalizedRole = (payload.user?.role || 'user').toLowerCase();
      const nextSession = {
        token: payload.token,
        user: {
          ...payload.user,
          email: normalizedEmail,
          role: normalizedRole
        },
        loggedAt: new Date().toISOString()
      };

      setAuthSession(nextSession);
      setSession(nextSession);
      setMessage(`Đăng nhập thành công: ${payload.user?.email || loginForm.email}`);
      setTimeout(() => navigate('/'), 1000);
    } catch (_e) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    setMessage('Bạn đã đăng xuất.');
    setError('');
  };

  return (
    <div className="login-page-wrapper">
      {session ? (
        <div className="auth-notification">
          <div className="notification-content">
            <p>Phiên đăng nhập: <strong>{session.user?.email || 'demo@yody.vn'}</strong></p>
            <button className="notification-logout-btn" type="button" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      ) : null}

      <div className="login-container">
        <div className="login-left">
          <div className="left-content">
            <h2>Khám phá phong cách của bạn cùng Yody</h2>
            <ul className="features">
              <li>Lưu lại các trang phục yêu thích</li>
              <li>Theo dõi đơn hàng dễ dàng</li>
              <li>Nhận ưu đãi độc quyền</li>
              <li>Gợi ý cá nhân hóa cho bạn</li>
            </ul>
          </div>
        </div>

        <div className="login-right">
          <div className="form-container">
            <Link to="/" className="logo">Yody</Link>

            {message ? (
              <div className="auth-message" role="status" aria-live="polite">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="auth-error" role="alert" aria-live="assertive">
                {error}
              </div>
            ) : null}

            <div className="form-tabs">
              <button className="active">Đăng nhập</button>
              <Link to="/register" className="tab-link">Đăng ký</Link>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập email của bạn"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                  required
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Nhập mật khẩu"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="forgot-password">
                <a href="#">Quên mật khẩu?</a>
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <div className="signup-link">
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
