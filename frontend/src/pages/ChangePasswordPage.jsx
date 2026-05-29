import React, { useState } from 'react';
import { KeyRound, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Field, PasswordInput, InlineError, Spinner } from '../components/common';

const PASS_RE_UPPER   = /[A-Z]/;
const PASS_RE_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export default function ChangePasswordPage() {
  const { updatePassword } = useAuth();
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required.';
    if (!form.newPassword || form.newPassword.length < 8 || form.newPassword.length > 16)
      e.newPassword = 'New password must be 8–16 characters.';
    else if (!PASS_RE_UPPER.test(form.newPassword))
      e.newPassword = 'Must contain at least one uppercase letter.';
    else if (!PASS_RE_SPECIAL.test(form.newPassword))
      e.newPassword = 'Must contain at least one special character.';
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await updatePassword(form.currentPassword, form.newPassword);
      toast.success('Password updated successfully.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account password</p>
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-md)',
                background: 'var(--c-accent-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--c-accent)',
              }}>
                <KeyRound size={16} />
              </div>
              <span className="card-title">Security Settings</span>
            </div>
          </div>

          <div className="card-body">
            <InlineError message={apiError} />

            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Current password" error={errors.currentPassword} required>
                <PasswordInput
                  value={form.currentPassword}
                  onChange={set('currentPassword')}
                  placeholder="Enter your current password"
                  error={errors.currentPassword}
                />
              </Field>

              <Field label="New password" error={errors.newPassword} hint="8–16 chars, one uppercase, one special char" required>
                <PasswordInput
                  value={form.newPassword}
                  onChange={set('newPassword')}
                  placeholder="Choose a strong new password"
                  error={errors.newPassword}
                />
              </Field>

              <Field label="Confirm new password" error={errors.confirmPassword} required>
                <PasswordInput
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Re-enter your new password"
                  error={errors.confirmPassword}
                />
              </Field>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 4 }}>
                {loading ? <Spinner size={15} /> : <Check size={15} />}
                {loading ? 'Updating…' : 'Update password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
