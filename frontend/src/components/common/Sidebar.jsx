import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Store, Users, Star, KeyRound, LogOut, ShieldCheck, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ADMIN_NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Stores',    icon: Store,           path: '/admin/stores' },
  { label: 'Users',     icon: Users,           path: '/admin/users' },
];

const USER_NAV = [
  { label: 'Browse Stores', icon: Store,  path: '/user/stores' },
  { label: 'My Ratings',    icon: Star,   path: '/user/ratings' },
];

const OWNER_NAV = [
  { label: 'My Dashboard', icon: BarChart3, path: '/owner/dashboard' },
];

const COMMON_NAV = [
  { label: 'Change Password', icon: KeyRound, path: '/password' },
];

const roleLabel = { admin: 'System Admin', user: 'Normal User', owner: 'Store Owner' };
const roleIcon  = { admin: ShieldCheck, user: Users, owner: Store };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const { pathname } = useLocation();

  if (!user) return null;

  const navLinks =
    user.role === 'admin' ? ADMIN_NAV :
    user.role === 'user'  ? USER_NAV  : OWNER_NAV;

  const initials = user.name
    ? user.name.trim().split(' ').slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : '?';

  const RoleIcon = roleIcon[user.role] || Users;

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <Star size={18} />
        </div>
        <div>
          <div className="sidebar-logo-text">RateStore</div>
          <div className="sidebar-logo-sub">Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>

        {navLinks.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            className={`nav-link ${pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 12 }}>Account</div>

        {COMMON_NAV.map(({ label, icon: Icon, path }) => (
          <button
            key={path}
            className={`nav-link ${pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}

        <button className="nav-link" onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>

      {/* User info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name" title={user.name}>{user.name}</div>
            <div className="sidebar-user-role">
              <RoleIcon size={10} style={{ display: 'inline', marginRight: 3 }} />
              {roleLabel[user.role] || user.role}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
