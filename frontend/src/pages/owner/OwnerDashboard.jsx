import React, { useEffect, useState } from 'react';
import { Star, Users, TrendingUp, MapPin } from 'lucide-react';
import { storesAPI } from '../../services/api';
import { PageLoading, Stars } from '../../components/common';
import { useAuth } from '../../context/AuthContext';

export default function OwnerDashboard() {
  const { user }                  = useAuth();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [sortDir, setSortDir]     = useState('desc');

  useEffect(() => {
    storesAPI.ownerDashboard()
      .then(({ data: d }) => setData(d))
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  if (error) return (
    <div className="page-body">
      <div className="inline-error">{error}</div>
    </div>
  );

  const { store, ratings } = data;
  const avg = store.avg_rating ? parseFloat(store.avg_rating) : null;

  const sorted = [...ratings].sort((a, b) => {
    const da = new Date(a.updated_at), db = new Date(b.updated_at);
    return sortDir === 'desc' ? db - da : da - db;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Dashboard</h1>
          <p className="page-subtitle">Performance overview for your store</p>
        </div>
      </div>

      <div className="page-body">
        {/* Store info card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 'var(--r-lg)',
                background: 'var(--c-accent-dim)', border: '1.5px solid var(--c-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--c-accent)', flexShrink: 0,
              }}>
                <Star size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--t-primary)', marginBottom: 4 }}>
                  {store.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--t-secondary)', marginBottom: 8 }}>
                  <MapPin size={13} />
                  {store.address || 'No address on file'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--t-muted)' }}>{store.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card" style={{ '--stat-color': 'var(--c-accent)', '--stat-bg': 'var(--c-accent-dim)' }}>
            <div className="stat-icon"><Star size={18} /></div>
            <div>
              <div className="stat-value">{avg ? avg.toFixed(1) : '—'}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--c-teal)', '--stat-bg': 'var(--c-teal-dim)' }}>
            <div className="stat-icon"><Users size={18} /></div>
            <div>
              <div className="stat-value">{store.rating_count ?? 0}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
          <div className="stat-card" style={{ '--stat-color': 'var(--c-rose)', '--stat-bg': 'var(--c-rose-dim)' }}>
            <div className="stat-icon"><TrendingUp size={18} /></div>
            <div>
              <div className="stat-value">{avg ? Math.round(avg * 20) : 0}%</div>
              <div className="stat-label">Satisfaction Score</div>
            </div>
          </div>
        </div>

        {/* Rating distribution */}
        {avg && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <span className="card-title">Rating Distribution</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, color: 'var(--c-accent)', lineHeight: 1 }}>
                    {avg.toFixed(1)}
                  </div>
                  <Stars value={avg} size={18} />
                  <div style={{ fontSize: 12, color: 'var(--t-muted)' }}>{store.rating_count} reviews</div>
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  {[5,4,3,2,1].map((star) => {
                    const count = ratings.filter((r) => r.score === star).length;
                    const pct = ratings.length ? Math.round((count / ratings.length) * 100) : 0;
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: 'var(--t-secondary)', width: 12 }}>{star}</span>
                        <span style={{ color: 'var(--c-accent)', fontSize: 12 }}>★</span>
                        <div style={{ flex: 1, height: 8, background: 'var(--c-bg-3)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--c-accent)', borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--t-muted)', width: 30, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Customer Reviews</span>
            <select
              className="form-input form-select"
              style={{ width: 160, padding: '6px 32px 6px 10px', fontSize: 12 }}
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>

          {sorted.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--t-muted)', fontSize: 14 }}>
              No reviews yet. Keep providing great service!
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>{r.name}</td>
                      <td style={{ color: 'var(--t-secondary)' }}>{r.email}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Stars value={r.score} size={12} />
                          <span style={{ color: 'var(--c-accent)', fontWeight: 600, fontSize: 13 }}>{r.score}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--t-secondary)', fontSize: 13 }}>
                        {new Date(r.updated_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
