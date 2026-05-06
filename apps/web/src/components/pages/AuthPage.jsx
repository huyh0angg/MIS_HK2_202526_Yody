import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { loginCustomer, registerCustomer } from '../../lib/api';
import { setAuthSession, clearAuthSession, getAuthSession } from '../../lib/storage';
import { useAuthSession } from '../../hooks/useAuthSession';
import Shell from '../common/Shell';

export default function AuthPage({ cartCount, onQuickLogout }) {
  const auth = useAuthSession();
  const location = useLocation();
  const session = auth?.authSession || null;
  const setSession = auth?.setAuthSession || (() => {});
  const currentSessionRef = useRef(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ fullName: '', email: '', password: '' });
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const feedbackId = error ? 'auth-feedback-error' : message ? 'auth-feedback-message' : undefined;
  const hasAuthError = Boolean(error);

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

  useEffect(() => {
    if (!session || !currentSessionRef.current) {
      return;
    }

    currentSessionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    currentSessionRef.current.focus({ preventScroll: true });
  }, [session]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoadingLogin(true);
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
    } catch (_e) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.');
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoadingRegister(true);
    setMessage('');
    setError('');

    try {
      const payload = await registerCustomer(registerForm);
      setMessage(`Đăng ký thành công: ${payload.user?.email || registerForm.email}. Bạn có thể đăng nhập ngay.`);
      setLoginForm((current) => ({ ...current, email: registerForm.email }));
      setRegisterForm((current) => ({ ...current, password: '' }));
    } catch (_e) {
      setError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    setMessage('Bạn đã đăng xuất.');
    setError('');
  };

  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Đăng ký / Đăng nhập">
      {session ? (
        <section className="card panel" style={{ marginBottom: 20 }} ref={currentSessionRef} tabIndex={-1}>
          <h2>Phiên đăng nhập hiện tại</h2>
          <p className="muted">Email: <strong>{session.user?.email || 'demo@yody.vn'}</strong> • Role: <strong>{session.user?.role || 'customer'}</strong></p>
          <button className="button button-ghost" type="button" onClick={handleLogout}>Đăng xuất</button>
        </section>
      ) : null}

      {message ? (
        <section className="notice" style={{ marginBottom: 20 }} role="status" aria-live="polite" aria-atomic="true" id="auth-feedback-message">
          <strong>{message}</strong>
        </section>
      ) : null}

      {error ? (
        <section className="empty-state" style={{ marginBottom: 20 }} role="alert" aria-live="assertive" aria-atomic="true" id="auth-feedback-error">
          {error}
        </section>
      ) : null}

      <section className="grid-2">
        <form className="card panel form-grid" onSubmit={handleLogin}>
          <h2>Đăng nhập</h2>
          <p className="muted">Form login, JWT access token, refresh token.</p>
          <input
            className="input"
            placeholder="Email hoặc số điện thoại"
            value={loginForm.email}
            onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
            aria-describedby={feedbackId}
            aria-invalid={hasAuthError || undefined}
            required
            autoComplete="username"
          />
          <input
            className="input"
            placeholder="Mật khẩu"
            type="password"
            value={loginForm.password}
            onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
            aria-describedby={feedbackId}
            aria-invalid={hasAuthError || undefined}
            required
            autoComplete="current-password"
          />
          <button className="button button-block" type="submit" disabled={loadingLogin}>
            {loadingLogin ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <form className="card panel form-grid" onSubmit={handleRegister}>
          <h2>Đăng ký</h2>
          <p className="muted">Form sign-up, xác thực email/phone, OAuth social login.</p>
          <input
            className="input"
            placeholder="Họ và tên"
            value={registerForm.fullName}
            onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))}
            aria-describedby={feedbackId}
            aria-invalid={hasAuthError || undefined}
            required
            autoComplete="name"
          />
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={registerForm.email}
            onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
            aria-describedby={feedbackId}
            aria-invalid={hasAuthError || undefined}
            required
            autoComplete="email"
          />
          <input
            className="input"
            placeholder="Mật khẩu"
            type="password"
            value={registerForm.password}
            onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
            aria-describedby={feedbackId}
            aria-invalid={hasAuthError || undefined}
            required
            autoComplete="new-password"
          />
          <button className="button button-block button-ghost" type="submit" disabled={loadingRegister}>
            {loadingRegister ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>
      </section>
    </Shell>
  );
}
