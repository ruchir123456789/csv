import React from 'react';
import { X, Database, Clock, FileText, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history, onLoadDataset, onDeleteDataset }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 90
    }} onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          borderRadius: '0',
          borderLeft: '1px solid var(--border-subtle)',
          padding: '28px',
          background: 'rgba(15, 23, 42, 0.98)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Saved Datasets History</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Datasets List */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!history || history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)' }}>
              No previous datasets found in MongoDB.
            </div>
          ) : (
            history.map((ds, idx) => {
              const fileId = ds.file_id || ds.id || ds._id;
              const filename = ds.original_filename || ds.filename || `Dataset_${fileId.slice(0, 8)}`;
              const rowsCount = ds.summary?.total_rows || ds.row_count || 0;
              const dateStr = ds.created_at ? new Date(ds.created_at).toLocaleString() : 'Recently';

              return (
                <div
                  key={idx}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '3px' }}>
                        {filename}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteDataset(fileId)}
                      style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px', opacity: 0.8 }}
                      title="Delete from MongoDB"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{rowsCount} Rows</span>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>Enriched</span>
                    </div>

                    <button
                      onClick={() => onLoadDataset(fileId, filename)}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <span>Load Analysis</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
