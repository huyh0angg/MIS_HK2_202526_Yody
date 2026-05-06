import React from 'react';
import { formatCurrency } from '../../lib/api';
import Shell from '../common/Shell';
import StatCard from '../UI/StatCard';

export default function CustomerDashboardPage({ cartCount, onQuickLogout, summary }) {
  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Dashboard khách hàng">
      <section className="mini-stats">
        <StatCard label="Đơn hàng" value={summary ? summary.orders : '—'} hint="Tổng đơn từ backend" />
        <StatCard label="Doanh thu" value={summary ? formatCurrency(summary.revenue_cents) : '—'} hint="Mẫu dữ liệu dashboard" />
        <StatCard label="Khách hàng" value={summary ? summary.customers : '—'} hint="Tài khoản đang hoạt động" />
      </section>
      <section className="grid-2">
        <div className="card panel">
          <h2>Đơn hàng gần đây</h2>
          <p>3 đơn hàng, 1 đơn đang xử lý.</p>
        </div>
        <div className="card panel">
          <h2>Đánh giá của bạn</h2>
          <p>Gửi nhận xét, chấm sao và theo dõi trạng thái.</p>
        </div>
      </section>
    </Shell>
  );
}
