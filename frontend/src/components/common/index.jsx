import React, { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Search, Eye, EyeOff } from 'lucide-react';

/* ── Spinner ──────────────────────────────────────────────── */
export const Spinner = ({ size = 20 }) => (
  <div className="spinner" style={{ width: size, height: size }} />
);

/* ── Page loading ─────────────────────────────────────────── */
export const PageLoading = ({ text = 'Loading...' }) => (
  <div className="page-loading">
    <Spinner size={24} />
    <span style={{ color: 'var(--t-secondary)', fontSize: 14 }}>{text}</span>
  </div>
);

/* ── Stars display ────────────────────────────────────────── */
export const Stars = ({ value, max = 5, size = 14 }) => (
  <span className="stars" style={{ fontSize: size }}>
    {Array.from({ length: max }, (_, i) => (
      <span key={i} className={`star ${i < Math.round(value) ? 'filled' : 'empty'}`}>★</span>
    ))}
  </span>
);

/* ── Star picker (interactive) ─────────────────────────────── */
export const StarPicker = ({ value, onChange, disabled }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-picker" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star-picker-star ${n <= (hovered || value) ? 'filled' : 'empty'}`}
          onClick={() => !disabled && onChange(n)}
          onMouseEnter={() => !disabled && setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${n} star`}
          disabled={disabled}
        >★</button>
      ))}
    </div>
  );
};

/* ── Role badge ───────────────────────────────────────────── */
export const RoleBadge = ({ role }) => (
  <span className={`badge badge-${role}`}>{role}</span>
);

/* ── Sortable table header ────────────────────────────────── */
export const SortTh = ({ label, field, sortBy, sortDir, onSort }) => {
  const active = sortBy === field;
  return (
    <th
      className={`sortable ${active ? 'sorted' : ''}`}
      onClick={() => onSort(field)}
      style={{ userSelect: 'none' }}
    >
      {label}
      <span className="sort-icon">
        {active ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : <ChevronDown size={11} />}
      </span>
    </th>
  );
};

/* ── Pagination ───────────────────────────────────────────── */
export const Pagination = ({ pagination, onChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  const pages = [];
  let lo = Math.max(1, page - 2), hi = Math.min(totalPages, page + 2);
  if (hi - lo < 4) { lo = Math.max(1, hi - 4); hi = Math.min(totalPages, lo + 4); }
  for (let p = lo; p <= hi; p++) pages.push(p);

  return (
    <div className="pagination">
      <span>Showing {start}–{end} of {total}</span>
      <div className="pagination-btns">
        <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={14} />
        </button>
        {lo > 1 && <><button className="page-btn" onClick={() => onChange(1)}>1</button>{lo > 2 && <span style={{ color: 'var(--t-muted)', padding: '0 4px' }}>…</span>}</>}
        {pages.map((p) => (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
        ))}
        {hi < totalPages && <>{hi < totalPages - 1 && <span style={{ color: 'var(--t-muted)', padding: '0 4px' }}>…</span>}<button className="page-btn" onClick={() => onChange(totalPages)}>{totalPages}</button></>}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

/* ── Modal ────────────────────────────────────────────────── */
export const Modal = ({ title, onClose, children, footer, maxWidth = 500 }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" style={{ maxWidth }}>
      <div className="modal-header">
        <h2 className="modal-title">{title}</h2>
        <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '6px' }}>
          <X size={16} />
        </button>
      </div>
      <div className="modal-body">{children}</div>
      {footer && <div className="modal-footer">{footer}</div>}
    </div>
  </div>
);

/* ── Search bar ───────────────────────────────────────────── */
export const SearchBar = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="search-input-wrap">
    <Search size={15} />
    <input
      className="form-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

/* ── Password input ───────────────────────────────────────── */
export const PasswordInput = ({ id, value, onChange, placeholder, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        className={`form-input ${error ? 'error' : ''}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ paddingRight: 42 }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-muted)',
          display: 'flex', alignItems: 'center',
        }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
};

/* ── Empty state ──────────────────────────────────────────── */
export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="empty-state">
    {Icon && <Icon />}
    <h3>{title}</h3>
    {description && <p>{description}</p>}
  </div>
);

/* ── Inline error ─────────────────────────────────────────── */
export const InlineError = ({ message }) =>
  message ? <div className="inline-error">{message}</div> : null;

/* ── Form field with label + error ───────────────────────── */
export const Field = ({ label, error, hint, children, required }) => (
  <div className="form-group">
    {label && (
      <label className="form-label">
        {label}{required && <span style={{ color: 'var(--c-accent)', marginLeft: 2 }}>*</span>}
      </label>
    )}
    {children}
    {error && <div className="form-error">{error}</div>}
    {hint && !error && <div className="form-hint">{hint}</div>}
  </div>
);
