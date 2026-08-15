import React from 'react';
import { 
  X, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, 
  Tag, Zap, Cpu, Layers, Image as ImageIcon
} from 'lucide-react';

const FALLBACK_CATEGORY_IMAGES = {
  'Inverter Split Air Conditioner': 'https://images.unsplash.com/photo-1625948515291-696130d93be9?w=500&auto=format&fit=crop&q=80',
  'Split Air Conditioner': 'https://images.unsplash.com/photo-1625948515291-696130d93be9?w=500&auto=format&fit=crop&q=80',
  'Air Conditioner': 'https://images.unsplash.com/photo-1625948515291-696130d93be9?w=500&auto=format&fit=crop&q=80',
  '4K OLED Smart TV': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&auto=format&fit=crop&q=80',
  'OLED Smart TV': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&auto=format&fit=crop&q=80',
  'Smart Television': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&auto=format&fit=crop&q=80',
  'Smart Air Purifier': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=80',
  'Air Purifier': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&auto=format&fit=crop&q=80',
  'Frost Free Refrigerator': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&auto=format&fit=crop&q=80',
  'Refrigerator': 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&auto=format&fit=crop&q=80',
  'Solo Microwave Oven': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500&auto=format&fit=crop&q=80',
  'Microwave Oven': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500&auto=format&fit=crop&q=80',
  'Storage Water Heater (Geyser)': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&auto=format&fit=crop&q=80',
  'Smart BLDC Ceiling Fan': 'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?w=500&auto=format&fit=crop&q=80',
  'Ceiling Fan': 'https://images.unsplash.com/photo-1591824438708-ce405f36ba3d?w=500&auto=format&fit=crop&q=80',
  'Wireless Bluetooth Speaker': 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop&q=80',
  'Front Load Washing Machine': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=80',
  'Washing Machine': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=80',
};

const resolveProductImage = (product) => {
  const url = product.product_image_url;
  if (url && url !== 'N/A' && !url.includes('source.unsplash.com')) {
    return url;
  }
  const cat = product.icecat_category || product.category || '';
  return FALLBACK_CATEGORY_IMAGES[cat] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80';
};

export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  const brandName = product.brand || product.manufactu || 'Brand';
  const modelCode = product.manufactu_1 || product.model || product.model_code || '';
  const title = product.icecat_title || product.verified_market_title || product.description || `${brandName} ${modelCode}`;
  const category = product.icecat_category || product.category || 'Consumer Appliance';
  const price = product.estimated_price || 'Check Live';
  const tech = product.hardware_technology || 'Inverter Control';
  const power = product.power_spec || 'Standard AC Powered';
  const specs = product.technical_specs || '';
  const shortDesc = product.short_description || '';
  const longDesc = product.long_description || '';
  const bullets = product.bullet_features ? product.bullet_features.split('|') : [];
  const closeness = product.web_closeness_score || '100%';
  const status = product.icecat_status || product.verification_status || 'VERIFIED';
  const webRef = product.live_web_reference || '';
  const imgSrc = resolveProductImage(product);

  // Parse specs into list of key-values
  const specPairs = specs.split('|').map(s => {
    const parts = s.split(':');
    return {
      key: parts[0]?.trim(),
      value: parts.slice(1).join(':')?.trim() || ''
    };
  }).filter(p => p.key && p.value);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        className="glass-panel responsive-modal" 
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px',
          position: 'relative',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          <X size={18} />
        </button>

        {/* Top Product Header */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '24px' }}>
          {/* Image */}
          <div style={{
            width: '110px',
            height: '110px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
          }}>
            <img 
              src={imgSrc} 
              alt={title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80';
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          {/* Title & Badges */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="badge badge-indigo">{category}</span>
              <span className="badge badge-emerald">{brandName}</span>
              {closeness && <span className="badge badge-cyan">Closeness: {closeness}</span>}
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '6px' }}>
              {title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem' }}>
              {modelCode && <span style={{ color: 'var(--text-dim)' }}>Model: <strong style={{ color: 'var(--text-main)' }}>{modelCode}</strong></span>}
              <span style={{ color: '#34d399', fontWeight: '700', fontSize: '1.1rem' }}>{price}</span>
            </div>
          </div>
        </div>

        {/* Highlight Bullets */}
        {bullets.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
            {bullets.map((b, i) => (
              <div key={i} style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.8rem', color: '#34d399', fontWeight: '500' }}>
                ✓ {b.trim()}
              </div>
            ))}
          </div>
        )}

        {/* Descriptions Section */}
        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--secondary)', marginBottom: '6px' }}>Product Overview</h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: shortDesc ? '10px' : '0' }}>
            {longDesc || shortDesc}
          </p>
        </div>

        {/* Technical Specifications Grid */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#818cf8', marginBottom: '12px' }}>Detailed Specification Matrix</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {/* Tech */}
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Hardware / Compressor Tech</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{tech}</div>
            </div>

            {/* Power */}
            <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Energy & Power Rating</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{power}</div>
            </div>

            {/* Key Value Pairs */}
            {specPairs.map((sp, idx) => (
              <div key={idx} style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>{sp.key}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{sp.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Audit Note */}
        {webRef && (
          <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', color: '#818cf8', fontWeight: '600' }}>
              <ShieldCheck size={16} />
              <span>Live Web Verification Source</span>
            </div>
            <div>{webRef}</div>
          </div>
        )}
      </div>
    </div>
  );
}
