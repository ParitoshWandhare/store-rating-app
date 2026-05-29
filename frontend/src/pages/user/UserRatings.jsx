import React, { useEffect, useState, useCallback } from 'react';
import { Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { storesAPI, ratingsAPI } from '../../services/api';
import { PageLoading, EmptyState, StarPicker, Modal, Spinner } from '../../components/common';

function EditModal({ store, onClose, onSaved }) {
  const [score, setScore]     = useState(store.user_rating ?? 1);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await ratingsAPI.update(store.id, { score });
      toast.success('Rating updated!');
      onSaved(store.id, score);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Update Rating"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>
            {loading ? <Spinner size={14} /> : <Star size={14} />}
            {loading ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{store.name}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <StarPicker value={score} onChange={setScore} />
        <div style={{ fontSize: 13, color: 'var(--c-accent)', fontWeight: 500 }}>
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][score]} ({score}/5)
        </div>
      </div>
    </Modal>
  );
}

export default function UserRatings() {
  const [stores, setStores]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);

  const fetchRated = useCallback(() => {
    setLoading(true);
    // Fetch all stores and filter those with user ratings
    storesAPI.list({ limit: 100 })
      .then(({ data }) => setStores(data.stores.filter((s) => s.user_rating != null)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRated(); }, [fetchRated]);

  const handleSaved = (storeId, score) => {
    setStores((prev) => prev.map((s) => s.id === storeId ? { ...s, user_rating: score } : s));
  };

  if (loading) return <PageLoading />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Ratings</h1>
          <p className="page-subtitle">Stores you've rated — {stores.length} total</p>
        </div>
      </div>

      <div className="page-body">
        {stores.length === 0 ? (
          <div className="card">
            <EmptyState icon={Star} title="No ratings yet" description="Browse stores and submit your first rating." />
          </div>
        ) : (
          <div className="stores-grid">
            {stores.map((s) => {
              const avg = s.avg_rating ? parseFloat(s.avg_rating).toFixed(1) : null;
              return (
                <div key={s.id} className="store-card">
                  <div>
                    <div className="store-card-name">{s.name}</div>
                    <div className="store-card-address">
                      <MapPin size={13} />
                      {s.address || 'No address'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--c-border)' }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--t-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 }}>Your rating</div>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map((n) => (
                          <span key={n} style={{ color: n <= s.user_rating ? 'var(--c-accent)' : 'var(--t-muted)', fontSize: 16 }}>★</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--t-muted)', marginBottom: 4 }}>Overall</div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: avg ? 'var(--c-accent)' : 'var(--t-muted)' }}>
                        {avg ? `${avg} / 5` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-secondary btn-sm" onClick={() => setEditing(s)} style={{ width: '100%' }}>
                    Edit Rating
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && <EditModal store={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />}
    </div>
  );
}
