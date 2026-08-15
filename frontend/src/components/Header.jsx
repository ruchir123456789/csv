import React from 'react';
import { Database, Activity, Sparkles, UploadCloud, Table, BarChart3, History } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, hasData, dbConnected, onOpenHistory }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 10, 18, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div className="responsive-header" style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)',
            flexShrink: 0
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                CSV Intelligence
              </span>
              <span className="badge badge-emerald">v1.0</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Open Icecat & Web Intelligence Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="responsive-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('upload')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              border: 'none',
              transition: 'all 0.2s ease',
              background: activeTab === 'upload' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'upload' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <UploadCloud size={16} />
            Upload
          </button>

          <button
            onClick={() => setActiveTab('data')}
            disabled={!hasData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: hasData ? 'pointer' : 'not-allowed',
              opacity: hasData ? 1 : 0.45,
              border: 'none',
              transition: 'all 0.2s ease',
              background: activeTab === 'data' ? 'var(--secondary)' : 'transparent',
              color: activeTab === 'data' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Table size={16} />
            Enhanced Data
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            disabled={!hasData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: hasData ? 'pointer' : 'not-allowed',
              opacity: hasData ? 1 : 0.45,
              border: 'none',
              transition: 'all 0.2s ease',
              background: activeTab === 'dashboard' ? 'var(--accent-indigo)' : 'transparent',
              color: activeTab === 'dashboard' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <BarChart3 size={16} />
            Analytics Dashboard
          </button>
        </nav>

        {/* Right Status & History Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenHistory}
            className="btn btn-outline"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            <History size={15} />
            History
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            background: dbConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${dbConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            fontSize: '0.75rem',
            transition: 'all 0.3s ease'
          }}>
            <Database size={13} color={dbConnected ? '#10b981' : '#ef4444'} />
            <span style={{
              color: dbConnected ? '#34d399' : '#f87171',
              fontWeight: '600',
              letterSpacing: '0.02em'
            }}>
              MongoDB: {dbConnected ? 'Connected' : 'Offline'}
            </span>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: dbConnected ? '#10b981' : '#ef4444',
              boxShadow: dbConnected ? '0 0 10px rgba(16, 185, 129, 0.8)' : '0 0 8px rgba(239, 68, 68, 0.6)',
              animation: dbConnected ? 'pulse 2s infinite' : 'none'
            }} />
          </div>
        </div>
      </div>
    </header>
  );
}
