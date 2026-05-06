import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerCustomer } from '../../lib/api';
import { setAuthSession, setSessionId } from '../../lib/storage';
import { useAuthSession } from '../../hooks/useAuthSession';

export default function RegisterPage({ cartCount, onQuickLogout }) {
  const auth = useAuthSession();
  const navigate = useNavigate();
  const setSession = auth?.setAuthSession || (() => {});
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Mật khẩu không khớp. Vui lòng kiểm tra lại.');
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      setLoading(false);
      return;
    }

    try {
      const payload = await registerCustomer({
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password
      });
      setMessage(`Đăng ký thành công: ${payload.user?.email || registerForm.email}. Đang chuyển hướng...`);
      setRegisterForm({ fullName: '', email: '', password: '', confirmPassword: '' });

      const nextSession = {
        token: payload.token,
        user: {
          ...payload.user,
          email: payload.user?.email || registerForm.email,
          role: 'customer'
        },
        loggedAt: new Date().toISOString()
      };
      setAuthSession(nextSession);
      setSession(nextSession);
      if (payload.sessionId) setSessionId(payload.sessionId);
      setTimeout(() => navigate('/'), 1000);
    } catch (_e) {
      setError('Đăng ký thất bại. Email này có thể đã được sử dụng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page-wrapper">
      <div className="register-container">
        <div className="register-left">
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

        <div className="register-right">
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
              <Link to="/login" className="tab-link">Đăng nhập</Link>
              <button className="active">Đăng ký</button>
            </div>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="fullname">Họ và tên</label>
                <input
                  type="text"
                  id="fullname"
                  placeholder="Nhập họ và tên của bạn"
                  value={registerForm.fullName}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Nhập địa chỉ email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                  required
                  autoComplete="new-password"
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={registerForm.confirmPassword}
                  onChange={(event) => setRegisterForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  required
                  autoComplete="new-password"
                  minLength="6"
                />
              </div>

              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                  required
                />
                <label htmlFor="agree-terms">
                  Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo mật</a>
                </label>
              </div>

              <button type="submit" className="register-button" disabled={loading}>
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>
            </form>

            <div className="login-link">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
