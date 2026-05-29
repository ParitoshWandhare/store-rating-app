import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Field, PasswordInput, InlineError, Spinner } from '../components/common';

const REDIRECT = { admin: '/admin/dashboard', user: '/user/stores', owner: '/owner/dashboard' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required.';
    if (!form.password) e.password = 'Password is required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(REDIRECT[user.role] || '/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card fade-in">
        <div className="auth-brand">
          <div className="auth-brand-mark"><Star size={22} /></div>
          <span className="auth-brand-name">RateStore</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue.</p>

        <InlineError message={apiError} />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field label="Email address" error={errors.email} required>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>

          <Field label="Password" error={errors.password} required>
            <PasswordInput
              id="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Your password"
              error={errors.password}
            />
          </Field>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <Spinner size={16} /> : <LogIn size={16} />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-divider">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--c-accent)', fontWeight: 500 }}>
            Create one
          </Link>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: 24, padding: '14px 16px',
          background: 'var(--c-bg-2)', borderRadius: 'var(--r-md)',
          border: '1px solid var(--c-border)',
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--t-muted)', marginBottom: 10 }}>
            Demo Credentials
          </div>
          {[
            { role: 'Admin',  email: 'admin@storerating.com',  pass: 'Admin@123'  },
            { role: 'Owner',  email: 'owner1@example.com', pass: 'Owner@123'  },
            { role: 'User',   email: 'alice@example.com',      pass: 'User@1234'  },
          ].map(({ role, email, pass }) => (
            <div
              key={role}
              style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--t-secondary)', marginBottom: 5, gap: 8, alignItems: 'center' }}
            >
              <span style={{
                color: '#fff', background: 'var(--c-accent)',
                fontWeight: 700, fontSize: 10, textTransform: 'uppercase',
                letterSpacing: '0.5px', padding: '1px 7px', borderRadius: 20,
                minWidth: 46, textAlign: 'center', flexShrink: 0,
              }}>{role}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
              <span style={{ color: 'var(--c-accent)', fontFamily: 'monospace', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{pass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
