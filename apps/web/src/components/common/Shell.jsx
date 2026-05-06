import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function Shell({ title, subtitle, cartCount = 0, onQuickLogout, children }) {
  return (
    <div className="app-shell">
      <Header cartCount={cartCount} onQuickLogout={onQuickLogout} />
      <main className="page">
        {children}
        <Footer />
      </main>
    </div>
  );
}
