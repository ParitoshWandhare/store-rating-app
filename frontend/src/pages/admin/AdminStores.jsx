import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Store, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { storesAPI, usersAPI } from '../../services/api';
import {
  PageLoading, SortTh, Pagination, SearchBar, Stars,
  Modal, Field, InlineError, Spinner, EmptyState,
} from '../../components/common';

function AddStoreModal({ onClose, onCreated }) {
  const [form, setForm]       = useState({ name: '', email: '', address: '', owner_id: '' });
  const [owners, setOwners]   = useState([]);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    usersAPI.list({ role: 'owner', limit: 100 })
      .then(({ data }) => setOwners(data.users))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 20) e.name = 'Min 20 characters required.';
    if (form.name.trim().length > 60)               e.name = 'Max 60 characters.';
    if (!form.email || !/^\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required.';
    if (form.address && form.address.length > 400)  e.address = 'Max 400 characters.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await storesAPI.create({ ...form, owner_id: form.owner_id || undefined });
      toast.success('Store created successfully.');
      onCreated(data.store);
    } catch (err) {
      const d = err.response?.data;
      if (d?.fields) setErrors(d.fields);
      else setApiError(d?.error || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Store"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <Spinner size={14} /> : <Store size={14} />}
            {loading ? 'Creating…' : 'Create Store'}
          </button>
        </>
      }
    >
      <InlineError message={apiError} />
      <Field label="Store name" error={errors.name} hint="20–60 characters" required>
        <input type="text" className={`form-input ${errors.name ? 'error' : ''}`} value={form.name} onChange={set('name')} placeholder="e.g. Green Valley Fresh Grocery Market" />
      </Field>
      <Field label="Store email" error={errors.email} required>
        <input type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} onChange={set('email')} placeholder="store@example.com" />
      </Field>
      <Field label="Address" error={errors.address} hint="Max 400 characters">
        <textarea className={`form-input ${errors.address ? 'error' : ''}`} value={form.address} onChange={set('address')} rows={2} placeholder="Store address" style={{ resize: 'vertical' }} />
      </Field>
      <Field label="Store Owner" hint="Optional — assign to an existing store owner">
        <select className="form-input form-select" value={form.owner_id} onChange={set('owner_id')}>
          <option value="">No owner assigned</option>
          {owners.map((o) => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
        </select>
      </Field>
    </Modal>
  );
}

export default function AdminStores() {
  const [stores, setStores]     = useState([]);
  const [pagination, setPag]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [sortBy, setSortBy]     = useState('name');
  const [sortDir, setSortDir]   = useState('asc');
  const [page, setPage]         = useState(1);
  const [showAdd, setShowAdd]   = useState(false);

  const fetchStores = useCallback(() => {
    setLoading(true);
    storesAPI.list({ search, sortBy, sortDir, page, limit: 15 })
      .then(({ data }) => { setStores(data.stores); setPag(data.pagination); })
      .finally(() => setLoading(false));
  }, [search, sortBy, sortDir, page]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleSort = (field) => {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
    setPage(1);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">All registered stores on the platform</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> Add Store
        </button>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="toolbar" style={{ margin: 0, flex: 1 }}>
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or address…" />
            </div>
          </div>

          {loading ? (
            <PageLoading />
          ) : stores.length === 0 ? (
            <EmptyState icon={Store} title="No stores found" description="Add a store to get started." />
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <SortTh label="Name"     field="name"       sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Email"    field="email"      sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Address"  field="address"    sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <SortTh label="Rating"   field="avg_rating" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                      <th>Reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 500 }}>{s.name}</td>
                        <td style={{ color: 'var(--t-secondary)' }}>{s.email}</td>
                        <td style={{ color: 'var(--t-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address || '—'}</td>
                        <td>
                          {s.avg_rating ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Stars value={parseFloat(s.avg_rating)} size={12} />
                              <span style={{ color: 'var(--c-accent)', fontWeight: 600, fontSize: 13 }}>
                                {parseFloat(s.avg_rating).toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--t-muted)', fontSize: 13 }}>No ratings</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--t-secondary)', fontSize: 13 }}>{s.rating_count ?? 0}</td>
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
        <AddStoreModal
          onClose={() => setShowAdd(false)}
          onCreated={(store) => { setShowAdd(false); setStores((prev) => [store, ...prev]); }}
        />
      )}
    </div>
  );
}
