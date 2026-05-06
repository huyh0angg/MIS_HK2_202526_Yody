import React, { useEffect, useState } from 'react';
import Shell from '../common/Shell';
import {
  fetchAdminSummary, fetchAdminOrders, updateAdminOrderStatus,
  fetchAdminProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  fetchAdminCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  formatCurrency
} from '../../lib/api';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

const STATUS_LABELS = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy'
};

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  SHIPPING: '#8b5cf6',
  DELIVERED: '#10b981',
  CANCELLED: '#ef4444'
};

function StatusBadge({ status }) {
  return (
    <span style={{
      background: STATUS_COLORS[status] || '#6b7280',
      color: '#fff',
      padding: '2px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function SummaryTab({ summary }) {
  if (!summary) return <div className="empty-state">Đang tải...</div>;

  const revenue = summary.revenueCents ?? summary.revenue_cents ?? 0;
  const totalOrders = summary.totalOrders ?? summary.orders ?? 0;
  const customers = summary.customers ?? 0;
  const pendingOrders = summary.pendingOrders ?? 0;
  const shippingOrders = summary.shippingOrders ?? 0;

  // Biểu đồ doanh thu 7 ngày (mock data)
  const revenueData = [
    { day: 'T2', value: 45000 },
    { day: 'T3', value: 52000 },
    { day: 'T4', value: 38000 },
    { day: 'T5', value: 61000 },
    { day: 'T6', value: 55000 },
    { day: 'T7', value: 58000 },
    { day: 'CN', value: 50000 }
  ];
  const maxRevenue = Math.max(...revenueData.map(d => d.value));

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="card panel" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Doanh thu</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#e67e22' }}>{formatCurrency(revenue)}</div>
        </div>
        <div className="card panel" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Đơn hàng</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{totalOrders}</div>
        </div>
        <div className="card panel" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Khách hàng</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{customers}</div>
        </div>
        <div className="card panel" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Chờ xử lý</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{pendingOrders}</div>
        </div>
        <div className="card panel" style={{ textAlign: 'center', padding: '20px 16px' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚚</div>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Đang giao</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#8b5cf6' }}>{shippingOrders}</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {/* Revenue Chart */}
        <div className="card panel" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Doanh thu 7 ngày gần đây</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 150 }}>
            {revenueData.map((item, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div 
                  style={{
                    width: '100%',
                    height: (item.value / maxRevenue) * 120 + 'px',
                    background: '#ff8c00',
                    borderRadius: '4px 4px 0 0',
                    marginBottom: 8,
                    transition: 'all 0.3s'
                  }}
                  title={formatCurrency(item.value)}
                />
                <div style={{ fontSize: 11, color: '#666', fontWeight: 500 }}>{item.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card panel" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Phân bổ trạng thái</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>⏳</div>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Chờ xác nhận</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{pendingOrders}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>🚚</div>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Đang giao</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{shippingOrders}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</div>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Đã giao</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{totalOrders - pendingOrders - shippingOrders}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>ℹ</div>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Tổng cộng</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{totalOrders}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchAdminOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await updateAdminOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (e) {
      alert('Cập nhật thất bại: ' + e.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div className="empty-state">Đang tải...</div>;

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8f5f0', borderBottom: '2px solid #e8ddd0' }}>
              <th style={th}>Mã đơn</th>
              <th style={th}>Khách hàng</th>
              <th style={th}>Tổng tiền</th>
              <th style={th}>Thanh toán</th>
              <th style={th}>Trạng thái</th>
              <th style={th}>Ngày tạo</th>
              <th style={th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f0e8e0' }}>
                <td style={td}>#{order.id}</td>
                <td style={td}>{order.userFullName || order.shippingName || order.userEmail || '—'}</td>
                <td style={td}>{formatCurrency(order.totalCents)}</td>
                <td style={td}>{order.paymentMethod === 'COD' ? 'COD' : 'Chuyển khoản'}</td>
                <td style={td}><StatusBadge status={order.status} /></td>
                <td style={td}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}</td>
                <td style={td}>
                  <select
                    value={order.status}
                    disabled={updating === order.id}
                    onChange={e => handleStatusChange(order.id, e.target.value)}
                    style={{ fontSize: 13, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd' }}
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && <div className="empty-state">Chưa có đơn hàng nào.</div>}
      </div>
    </div>
  );
}

const EMPTY_PRODUCT = { name: '', categoryId: '', description: '', priceCents: '', discountPercent: 0, imageUrl: '', stock: 0 };

function ProductsTab({ categories }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminProducts().then(setProducts).finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(EMPTY_PRODUCT); setModal('add'); };
  const openEdit = (p) => {
    setForm({
      name: p.name || '',
      categoryId: p.category_id || p.categoryId || '',
      description: p.description || '',
      priceCents: p.price_cents || p.priceCents || '',
      discountPercent: p.discount_percent || p.discountPercent || 0,
      imageUrl: p.image_url || p.imageUrl || '',
      stock: p.stock ?? 0
    });
    setModal({ type: 'edit', id: p.id });
  };

  const handleSave = async () => {
    if (!form.name || !form.priceCents) return alert('Vui lòng nhập tên và giá sản phẩm.');
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        description: form.description,
        priceCents: parseInt(form.priceCents),
        discountPercent: parseInt(form.discountPercent) || 0,
        imageUrl: form.imageUrl || null,
        stock: parseInt(form.stock) || 0
      };
      if (modal === 'add') {
        const created = await adminCreateProduct(payload);
        setProducts(prev => [created, ...prev]);
      } else {
        const updated = await adminUpdateProduct(modal.id, payload);
        setProducts(prev => prev.map(p => p.id === modal.id ? updated : p));
      }
      setModal(null);
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await adminDeleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  if (loading) return <div className="empty-state">Đang tải...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="buy-now-btn" type="button" onClick={openAdd} style={{ padding: '8px 20px' }}>
          + Thêm sản phẩm
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8f5f0', borderBottom: '2px solid #e8ddd0' }}>
              <th style={th}>ID</th>
              <th style={th}>Tên sản phẩm</th>
              <th style={th}>Danh mục</th>
              <th style={th}>Giá</th>
              <th style={th}>Giảm %</th>
              <th style={th}>Tồn kho</th>
              <th style={th}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0e8e0' }}>
                <td style={td}>{p.id}</td>
                <td style={td}>{p.name}</td>
                <td style={td}>{p.category_name || p.categoryName || '—'}</td>
                <td style={td}>{formatCurrency(p.price_cents || p.priceCents || 0)}</td>
                <td style={td}>{p.discount_percent || p.discountPercent || 0}%</td>
                <td style={td}>
                  <span style={{ color: (p.stock ?? 0) === 0 ? '#ef4444' : (p.stock ?? 0) < 10 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                    {p.stock ?? 0}
                  </span>
                </td>
                <td style={td}>
                  <button onClick={() => openEdit(p)} style={btnEdit}>Sửa</button>
                  <button onClick={() => handleDelete(p.id)} style={btnDel}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <div className="empty-state">Chưa có sản phẩm.</div>}
      </div>

      {modal && (
        <div style={overlay}>
          <div style={modalBox}>
            <h3 style={{ marginBottom: 16 }}>{modal === 'add' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}</h3>
            <FormField label="Tên sản phẩm *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <FormField label="Giá (VND) *" type="number" value={form.priceCents} onChange={v => setForm(f => ({ ...f, priceCents: v }))} />
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Danh mục</label>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} style={inputStyle}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <FormField label="Mô tả" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
            <FormField label="Giảm giá %" type="number" value={form.discountPercent} onChange={v => setForm(f => ({ ...f, discountPercent: v }))} />
            <FormField label="Tồn kho" type="number" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} />
            <FormField label="URL hình ảnh" value={form.imageUrl} onChange={v => setForm(f => ({ ...f, imageUrl: v }))} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setModal(null)} style={btnCancel}>Hủy</button>
              <button onClick={handleSave} disabled={saving} style={btnSave}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY_CATEGORY = { name: '', description: '' };

function CategoriesTab() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_CATEGORY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminCategories()
      .then(setCats)
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setError(err.message);
        setCats([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setForm(EMPTY_CATEGORY); setModal('add'); };
  const openEdit = (c) => {
    setForm({ name: c.name || '', description: c.description || '' });
    setModal({ type: 'edit', id: c.id });
  };

  const handleSave = async () => {
    if (!form.name) return alert('Vui lòng nhập tên danh mục.');
    setSaving(true);
    try {
      if (modal === 'add') {
        const created = await adminCreateCategory(form);
        setCats(prev => [...prev, created]);
      } else {
        const updated = await adminUpdateCategory(modal.id, form);
        setCats(prev => prev.map(c => c.id === modal.id ? updated : c));
      }
      setModal(null);
    } catch (e) {
      alert('Lỗi: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa danh mục này? Các sản phẩm trong danh mục sẽ không bị xóa.')) return;
    try {
      await adminDeleteCategory(id);
      setCats(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  if (loading) return <div className="empty-state">Đang tải...</div>;
  if (error) return <div className="empty-state" style={{ color: '#ef4444' }}>Lỗi: {error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button className="buy-now-btn" type="button" onClick={openAdd} style={{ padding: '8px 20px' }}>
          + Thêm danh mục
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f8f5f0', borderBottom: '2px solid #e8ddd0' }}>
            <th style={th}>ID</th>
            <th style={th}>Tên</th>
            <th style={th}>Mô tả</th>
            <th style={th}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {cats.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #f0e8e0' }}>
              <td style={td}>{c.id}</td>
              <td style={td}>{c.name}</td>
              <td style={td}>{c.description || '—'}</td>
              <td style={td}>
                <button onClick={() => openEdit(c)} style={btnEdit}>Sửa</button>
                <button onClick={() => handleDelete(c.id)} style={btnDel}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!cats.length && <div className="empty-state">Chưa có danh mục.</div>}

      {modal && (
        <div style={overlay}>
          <div style={modalBox}>
            <h3 style={{ marginBottom: 16 }}>{modal === 'add' ? 'Thêm danh mục' : 'Sửa danh mục'}</h3>
            <FormField label="Tên danh mục *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <FormField label="Mô tả" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setModal(null)} style={btnCancel}>Hủy</button>
              <button onClick={handleSave} disabled={saving} style={btnSave}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  );
}

const TABS = [
  { key: 'summary', label: 'Tổng quan' },
  { key: 'orders', label: 'Đơn hàng' },
  { key: 'products', label: 'Sản phẩm' },
  { key: 'categories', label: 'Danh mục' }
];

export default function AdminPage({ cartCount, onQuickLogout }) {
  const [tab, setTab] = useState('summary');
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchAdminSummary().then(setSummary).catch(() => {});
    fetchAdminCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <Shell cartCount={cartCount} onQuickLogout={onQuickLogout} title="Admin Dashboard">
      <div className="container" style={{ paddingTop: 32 }}>
        <h2 style={{ marginBottom: 24, fontSize: 22, fontWeight: 700 }}>Quản lý cửa hàng</h2>

        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #e8ddd0', marginBottom: 28 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                padding: '10px 22px',
                border: 'none',
                borderBottom: tab === t.key ? '2px solid #e67e22' : '2px solid transparent',
                background: 'none',
                fontSize: 14,
                fontWeight: tab === t.key ? 700 : 400,
                color: tab === t.key ? '#e67e22' : '#555',
                cursor: 'pointer',
                marginBottom: -2,
                transition: 'color 0.15s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'summary' && <SummaryTab summary={summary} />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'products' && <ProductsTab categories={categories} />}
        {tab === 'categories' && <CategoriesTab />}
      </div>
    </Shell>
  );
}

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 13, color: '#555' };
const td = { padding: '10px 12px', verticalAlign: 'middle' };
const btnEdit = { marginRight: 6, padding: '4px 12px', borderRadius: 6, border: '1px solid #3b82f6', background: '#eff6ff', color: '#3b82f6', cursor: 'pointer', fontSize: 13 };
const btnDel = { padding: '4px 12px', borderRadius: 6, border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontSize: 13 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox = { background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' };
const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#555' };
const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' };
const btnCancel = { padding: '8px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer', fontSize: 14 };
const btnSave = { padding: '8px 20px', borderRadius: 8, border: 'none', background: '#e67e22', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 };
