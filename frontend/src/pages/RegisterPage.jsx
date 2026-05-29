import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Field, PasswordInput, InlineError, Spinner } from '../components/common';

const PASS_RE_UPPER   = /[A-Z]/;
const PASS_RE_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]     = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 20) e.name = 'Name must be at least 20 characters.';
    if (form.name.trim().length > 60)              e.name = 'Name must be at most 60 characters.';
    if (!form.email || !/^\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email is required.';
    if (!form.password || form.password.length < 8 || form.password.length > 16)
      e.password = 'Password must be 8–16 characters.';
    else if (!PASS_RE_UPPER.test(form.password))
      e.password = 'Must contain at least one uppercase letter.';
    else if (!PASS_RE_SPECIAL.test(form.password))
      e.password = 'Must contain at least one special character.';
    if (form.address && form.address.length > 400) e.address = 'Address must not exceed 400 characters.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome aboard.');
      navigate('/user/stores');
    } catch (err) {
      const data = err.response?.data;
      if (data?.fields) setErrors(data.fields);
      else setApiError(data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card fade-in" style={{ maxWidth: 480 }}>
        <div className="auth-brand">
          <div className="auth-brand-mark"><Star size={22} /></div>
          <span className="auth-brand-name">RateStore</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join the platform to discover and rate stores.</p>

        <InlineError message={apiError} />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Field label="Full name" error={errors.name} hint="20–60 characters" required>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Alexandra Johnson Williams"
            />
          </Field>

          <Field label="Email address" error={errors.email} required>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Password" error={errors.password} hint="8–16 chars, one uppercase, one special char" required>
            <PasswordInput
              value={form.password}
              onChange={set('password')}
              placeholder="Create a strong password"
              error={errors.password}
            />
          </Field>

          <Field label="Address" error={errors.address} hint="Optional — max 400 characters">
            <textarea
              className={`form-input ${errors.address ? 'error' : ''}`}
              value={form.address}
              onChange={set('address')}
              placeholder="123 Main Street, City, Country"
              rows={2}
              style={{ resize: 'vertical' }}
            />
          </Field>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4 }}>
            {loading ? <Spinner size={16} /> : <UserPlus size={16} />}
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="auth-divider">
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--c-accent)', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
