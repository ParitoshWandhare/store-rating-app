import React, { useEffect, useState, useCallback } from 'react';
import { UserPlus, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI } from '../../services/api';
import {
  PageLoading, SortTh, RoleBadge, Pagination, SearchBar, Stars,
  Modal, Field, PasswordInput, InlineError, Spinner, EmptyState,
} from '../../components/common';

const PASS_RE_UPPER   = /[A-Z]/;
const PASS_RE_SPECIAL = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

function AddUserModal({ onClose, onCreated }) {
  const [form, setForm]   = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]  = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 20) e.name = 'Min 20 characters required.';
    if (form.name.trim().length > 60) e.name = 'Max 60 characters.';
    if (!form.email || !/^\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (!form.password || form.password.length < 8 || form.password.length > 16) e.password = 'Must be 8–16 characters.';
    else if (!PASS_RE_UPPER.test(form.password)) e.password = 'Needs one uppercase letter.';
    else if (!PASS_RE_SPECIAL.test(form.password)) e.password = 'Needs one special character.';
    if (form.address && form.address.length > 400) e.address = 'Max 400 characters.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await usersAPI.create(form);
      toast.success('User created successfully.');
      onCreated(data.user);
    } catch (err) {
      const d = err.response?.data;
      if (d?.fields) setErrors(d.fields);
      else setApiError(d?.error || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New User"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <Spinner size={14} /> : <UserPlus size={14} />}
            {loading ? 'Creating…' : 'Create User'}
          </button>
        </>
      }
    >
      <InlineError message={apiError} />
      <Field label="Full name" error={errors.name} hint="20–60 characters" required>
        <input type="text" className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={set('name')} placeholder="e.g. Alexandra Johnson Smith" />
      </Field>
      <Field label="Email" error={errors.email} required>
        <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={set('email')} placeholder="user@example.com" />
      </Field>
      <Field label="Password" error={errors.password} hint="8–16 chars, uppercase + special" required>
        <PasswordInput value={form.password} onChange={set('password')} placeholder="Strong password" error={errors.password} />
      </Field>
      <Field label="Address" error={errors.address} hint="Max 400 characters">
        <textarea className={`form-input ${errors.address ? 'error' : ''}`} value={form.address} onChange={set('address')} rows={2} placeholder="Street, City, Country" style={{ resize: 'vertical' }} />
      </Field>
      <Field label="Role" required>
        <select className="form-input form-select" value={form.role} onChange={set('role')}>
          <option value="user">Normal User</option>
          <option value="owner">Store Owner</option>
          <option value="admin">Administrator</option>
        </select>
      </Field>
    </Modal>
  );
}

function UserDetailModal({ user, onClose }) {
  return (
    <Modal title="User Details" onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--c-accent-dim)', border: '2px solid var(--c-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--c-accent)',
        }}>
          {user.name?.trim().split(' ').slice(0, 2).map((w) => w[0].toUpperCase()).join('')}
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--t-primary)' }}>{user.name}</div>
          <RoleBadge role={user.role} />
        </div>
      </div>
      <div className="divider" />
      <div className="detail-grid">
        <div className="detail-item"><span className="detail-label">Email</span><span className="detail-value">{user.email}</span></div>
        <div className="detail-item"><span className="detail-label">Role</span><span className="detail-value" style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
        <div className="detail-item" style={{ gridColumn: '1/-1' }}><span className="detail-label">Address</span><span className="detail-value">{user.address || '—'}</span></div>
        <div className="detail-item"><span className="detail-label">Member since</span><span className="detail-value">{new Date(user.created_at).toLocaleDateString()}</span></div>
        {user.role === 'owner' && (
          <div className="detail-item">
            <span className="detail-label">Store Rating</span>
            <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {user.store_rating ? (
                <>
                  <Stars value={parseFloat(user.store_rating)} />
                  <span style={{ color: 'var(--c-accent)', fontWeight: 600 }}>{parseFloat(user.store_rating).toFixed(1)}</span>
                </>
              ) : '—'}
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [pagination, setPag]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy]     = useState('created_at');
  const [sortDir, setSortDir]   = useState('desc');
  const [page, setPage]         = useState(1);
  const [showAdd, setShowAdd]   = useState(false);
  const [detail, setDetail]     = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    usersAPI.list({ search, role: roleFilter, sortBy, sortDir, page, limit: 15 })
      .then(({ data }) => { setUsers(data.users); setPag(data.pagination); })
      .finally(() => setLoading(false));
  }, [search, roleFilter, sortBy, sortDir, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage all registered users across the platform</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <UserPlus size={15} /> Add User
        </button>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="toolbar" style={{ margin: 0, flex: 1 }}>
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search name, email, address…" />
              <select
                className="form-input form-select"
                style={{ width: 160 }}
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              >
                <option value="">All roles</option>
                <option value="user">Normal User</option>
                <option value="owner">Store Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {loading ? (
            <PageLoading />
          ) : users.length === 0 ? (
            <EmptyState icon={X} title="No users found" description="Try adjusting your search or filters." />
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <SortTh label="Name"    field="name"    sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Email"   field="email"   sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Address" field="address" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Role"    field="role"    sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <th>Store Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td style={{ color: 'var(--t-secondary)' }}>{u.email}</td>
                        <td style={{ color: 'var(--t-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                        <td><RoleBadge role={u.role} /></td>
                        <td>
                          {u.role === 'owner' && u.store_rating ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Stars value={parseFloat(u.store_rating)} size={12} />
                              <span style={{ color: 'var(--c-accent)', fontSize: 13, fontWeight: 600 }}>{parseFloat(u.store_rating).toFixed(1)}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDetail(u)}>
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination pagination={pagination} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {showAdd && (
        <AddUserModal
          onClose={() => setShowAdd(false)}
          onCreated={(u) => { setShowAdd(false); setUsers((prev) => [u, ...prev]); }}
        />
      )}

      {detail && <UserDetailModal user={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
