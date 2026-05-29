import React, { useEffect, useState, useCallback } from 'react';
import { MapPin, Store, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { storesAPI, ratingsAPI } from '../../services/api';
import { PageLoading, SearchBar, StarPicker, Pagination, EmptyState, Spinner, Modal } from '../../components/common';

function RatingModal({ store, onClose, onRated }) {
  const [score, setScore]     = useState(store.user_rating ?? 0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!score) { toast.error('Please select a rating.'); return; }
    setLoading(true);
    try {
      if (store.user_rating) {
        await ratingsAPI.update(store.id, { score });
        toast.success('Rating updated!');
      } else {
        await ratingsAPI.submit({ store_id: store.id, score });
        toast.success('Rating submitted!');
      }
      onRated(store.id, score);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={store.user_rating ? 'Update Your Rating' : 'Rate This Store'}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading || !score}>
            {loading ? <Spinner size={14} /> : <Star size={14} />}
            {loading ? 'Submitting…' : store.user_rating ? 'Update Rating' : 'Submit Rating'}
          </button>
        </>
      }
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--t-primary)', marginBottom: 4 }}>
        {store.name}
      </div>
      <div style={{ fontSize: 13, color: 'var(--t-secondary)', marginBottom: 20 }}>
        How would you rate your experience?
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <StarPicker value={score} onChange={setScore} />
        {score > 0 && (
          <div style={{ fontSize: 13, color: 'var(--c-accent)', fontWeight: 500 }}>
            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][score]} ({score}/5)
          </div>
        )}
      </div>
    </Modal>
  );
}

function StoreCard({ store, onRate }) {
  const avg = store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : null;

  return (
    <div className="store-card">
      <div>
        <div className="store-card-name">{store.name}</div>
        <div className="store-card-address">
          <MapPin size={13} />
          {store.address || 'No address provided'}
        </div>
      </div>

      <div className="store-card-meta">
        <div className="store-rating-block">
          {avg ? (
            <>
              <span className="store-rating-value">{avg}</span>
              <div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map((n) => (
                    <span key={n} style={{ color: n <= Math.round(avg) ? 'var(--c-accent)' : 'var(--t-muted)', fontSize: 13 }}>★</span>
                  ))}
                </div>
                <div className="store-rating-count">{store.rating_count} review{store.rating_count !== 1 ? 's' : ''}</div>
              </div>
            </>
          ) : (
            <span style={{ fontSize: 13, color: 'var(--t-muted)' }}>No ratings yet</span>
          )}
        </div>
      </div>

      <div className="user-rating-section">
        <span className="user-rating-label">Your rating:</span>
        {store.user_rating ? (
          <div style={{ display: 'flex', gap: 2 }}>
            {[1,2,3,4,5].map((n) => (
              <span key={n} style={{ color: n <= store.user_rating ? 'var(--c-accent)' : 'var(--t-muted)', fontSize: 14 }}>★</span>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--t-muted)' }}>Not rated</span>
        )}
        <button
          className="btn btn-secondary btn-sm"
          style={{ marginLeft: 'auto' }}
          onClick={() => onRate(store)}
        >
          {store.user_rating ? 'Edit' : <><Star size={12} /> Rate</>}
        </button>
      </div>
    </div>
  );
}

export default function UserStores() {
  const [stores, setStores]     = useState([]);
  const [pagination, setPag]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const [ratingModal, setRatingModal] = useState(null);

  const fetchStores = useCallback(() => {
    setLoading(true);
    storesAPI.list({ search, page, limit: 12 })
      .then(({ data }) => { setStores(data.stores); setPag(data.pagination); })
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const handleRated = (storeId, score) => {
    setStores((prev) =>
      prev.map((s) => s.id === storeId ? { ...s, user_rating: score } : s)
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Discover Stores</h1>
          <p className="page-subtitle">Browse, search, and rate stores on the platform</p>
        </div>
      </div>

      <div className="page-body">
        <div className="toolbar">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search by name or address…"
          />
        </div>

        {loading ? (
          <PageLoading />
        ) : stores.length === 0 ? (
          <EmptyState icon={Store} title="No stores found" description="Try a different search term." />
        ) : (
          <>
            <div className="stores-grid">
              {stores.map((s) => (
                <StoreCard key={s.id} store={s} onRate={setRatingModal} />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="card" style={{ marginTop: 16 }}>
                <Pagination pagination={pagination} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {ratingModal && (
        <RatingModal
          store={ratingModal}
          onClose={() => setRatingModal(null)}
          onRated={handleRated}
        />
      )}
    </div>
  );
}
