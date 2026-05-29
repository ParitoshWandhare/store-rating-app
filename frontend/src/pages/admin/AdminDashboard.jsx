import React, { useEffect, useState } from 'react';
import { Users, Store, Star, TrendingUp } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { PageLoading } from '../../components/common';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.stats()
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoading />;

  const cards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'var(--c-teal)',
      bg: 'var(--c-teal-dim)',
    },
    {
      label: 'Total Stores',
      value: stats?.totalStores ?? 0,
      icon: Store,
      color: 'var(--c-accent)',
      bg: 'var(--c-accent-dim)',
    },
    {
      label: 'Ratings Submitted',
      value: stats?.totalRatings ?? 0,
      icon: Star,
      color: 'var(--c-rose)',
      bg: 'var(--c-rose-dim)',
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform-wide overview at a glance</p>
        </div>
      </div>

      <div className="page-body">
        {/* Stat cards */}
        <div className="stat-grid" style={{ marginBottom: 28 }}>
          {cards.map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="stat-card"
              style={{ '--stat-color': color, '--stat-bg': bg }}
            >
              <div className="stat-icon"><Icon size={18} /></div>
              <div>
                <div className="stat-value">{value.toLocaleString()}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Navigation</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {[
                { label: 'Manage Users',  desc: 'View, search & add users',    href: '/admin/users',  color: 'var(--c-teal)',   Icon: Users  },
                { label: 'Manage Stores', desc: 'Browse & register new stores', href: '/admin/stores', color: 'var(--c-accent)', Icon: Store  },
                { label: 'All Ratings',   desc: `${stats?.totalRatings ?? 0} ratings across all stores`, href: '/admin/stores', color: 'var(--c-rose)', Icon: TrendingUp },
              ].map(({ label, desc, href, color, Icon }) => (
                <a
                  key={label}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '16px 18px', borderRadius: 'var(--r-lg)',
                    background: 'var(--c-bg-2)', border: '1px solid var(--c-border)',
                    textDecoration: 'none', transition: 'border-color 0.2s, background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--c-border-h)'; e.currentTarget.style.background = 'var(--c-bg-3)'; }}
                  onMouseOut={(e)  => { e.currentTarget.style.borderColor = 'var(--c-border)';   e.currentTarget.style.background = 'var(--c-bg-2)'; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--r-md)',
                    background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color, flexShrink: 0,
                  }}>
                    <Icon size={17} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--t-primary)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--t-secondary)' }}>{desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
