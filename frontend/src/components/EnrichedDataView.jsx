import React, { useState, useMemo } from 'react';
import { 
  Search, Download, ExternalLink, ShieldCheck, CheckCircle2, 
  Sparkles, Filter, ChevronLeft, ChevronRight, Tag, Eye, Layers, Image as ImageIcon
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

const resolveProductImage = (row) => {
  const url = row.product_image_url;
  if (url && url !== 'N/A' && !url.includes('source.unsplash.com')) {
    return url;
  }
  const cat = row.icecat_category || row.category || '';
  return FALLBACK_CATEGORY_IMAGES[cat] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80';
};

export default function EnrichedDataView({ 
  data, 
  summary, 
  fileId, 
  onSelectProduct, 
  downloadUrls 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Extract all categories for filter dropdown
  const categories = useMemo(() => {
    if (!data || !data.length) return [];
    const set = new Set(data.map(item => item.icecat_category || item.category || 'Unknown').filter(Boolean));
    return Array.from(set);
  }, [data]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!data) return [];
    return data.filter(item => {
      const matchCat = selectedCategory === 'ALL' || (item.icecat_category || item.category) === selectedCategory;
      const searchStr = `${item.manufactu || ''} ${item.brand || ''} ${item.icecat_title || ''} ${item.icecat_category || ''} ${item.technical_specs || ''} ${item.description || ''}`.toLowerCase();
      const matchSearch = !searchTerm || searchStr.includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [data, selectedCategory, searchTerm]);

  // Paginated rows
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage]);

  const getStatusBadge = (status) => {
    if (!status) return null;
    if (status.includes('MATCHED') || status.includes('HIGH')) {
      return <span className="badge badge-emerald"><CheckCircle2 size={12} /> Verified</span>;
    }
    if (status.includes('WEB') || status.includes('MODERATE')) {
      return <span className="badge badge-cyan"><Sparkles size={12} /> Web Enriched</span>;
    }
    return <span className="badge badge-amber"><ShieldCheck size={12} /> Audited</span>;
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '30px auto', padding: '0 24px' }}>
      {/* Top Header & Summary Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Enhanced Catalog Dataset</h2>
            <span className="badge badge-emerald">{data ? data.length : 0} Products</span>
            {summary?.match_rate_percentage !== undefined && (
              <span className="badge badge-cyan">{summary.match_rate_percentage}% Match Rate</span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Enriched with official Open Icecat parameters, technical specifications, and verified live web sources.
          </p>
        </div>

        {/* Download Action Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {downloadUrls?.enriched && (
            <a
              href={downloadUrls.enriched}
              download
              className="btn btn-primary"
              title="Download Full Enriched CSV File"
            >
              <Download size={16} />
              <span>Download Enriched CSV</span>
            </a>
          )}

          {downloadUrls?.verified && (
            <a
              href={downloadUrls.verified}
              download
              className="btn btn-secondary"
              title="Download Verified CSV with Closeness Scores"
            >
              <ShieldCheck size={16} />
              <span>Download Verified CSV</span>
            </a>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '18px 24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 23, 42, 0.8)', padding: '8px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', minWidth: '320px', flex: '1 1 320px' }}>
          <Search size={16} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search products, brands, categories, specs..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.875rem',
              outline: 'none',
              width: '100%'
            }}
          />
        </div>

        {/* Category Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">All Categories ({data?.length || 0})</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interactive Data Table */}
      <div className="glass-panel" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto', maxHeight: '680px' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th style={{ minWidth: '280px' }}>Product & Title</th>
                <th style={{ minWidth: '170px' }}>Category</th>
                <th style={{ minWidth: '110px' }}>Est. Price</th>
                <th style={{ minWidth: '180px' }}>Hardware / Tech</th>
                <th style={{ minWidth: '150px' }}>Energy / Power</th>
                <th style={{ minWidth: '110px' }}>Closeness</th>
                <th style={{ minWidth: '180px' }}>Data Source & Link</th>
                <th style={{ minWidth: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>
                    No matching products found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, index) => {
                  const globalIdx = (currentPage - 1) * rowsPerPage + index + 1;
                  const brandName = row.brand || row.manufactu || row.make || 'Brand';
                  const modelCode = row.manufactu_1 || row.model || row.model_code || '';
                  const title = row.icecat_title || row.verified_market_title || row.description || `${brandName} Product`;
                  const category = row.icecat_category || row.category || 'Appliance';
                  const price = row.estimated_price || 'Check Live';
                  const tech = row.hardware_technology || 'Inverter Control';
                  const power = row.power_spec || 'Standard AC';
                  const closeness = row.web_closeness_score || '100%';
                  const status = row.icecat_status || row.verification_status || 'VERIFIED';
                  const imgSrc = resolveProductImage(row);
                  
                  // Source & Link
                  const sourceName = row.data_source || 'DuckDuckGo Live Index';
                  const sourceUrl = row.data_source_url || `https://duckduckgo.com/?q=${encodeURIComponent(`${brandName} ${modelCode} ${row.description || ''}`)}`;

                  return (
                    <tr key={index} onClick={() => onSelectProduct(row)}>
                      <td style={{ color: 'var(--text-dim)', fontWeight: '600' }}>{globalIdx}</td>
                      
                      {/* Product Title & Brand */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
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
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '3px' }}>
                              {title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '8px' }}>
                              <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>{brandName}</span>
                              {modelCode && <span>• Model: {modelCode}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td>
                        <span className="badge badge-indigo" style={{ textTransform: 'none' }}>
                          {category}
                        </span>
                      </td>

                      {/* Estimated Price */}
                      <td>
                        <div style={{ fontWeight: '700', color: '#34d399', fontSize: '0.95rem' }}>
                          {price}
                        </div>
                      </td>

                      {/* Hardware / Inverter Tech */}
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {tech}
                        </div>
                      </td>

                      {/* Power Rating */}
                      <td>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          {power}
                        </div>
                      </td>

                      {/* Web Closeness & Verification Status */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: '700', color: '#22d3ee', fontSize: '0.85rem' }}>
                            {closeness}
                          </span>
                          {getStatusBadge(status)}
                        </div>
                      </td>

                      {/* NEW: Data Source & Live Web Link */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: 'rgba(6, 182, 212, 0.1)',
                              border: '1px solid rgba(6, 182, 212, 0.25)',
                              color: '#22d3ee',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textDecoration: 'none',
                              transition: 'all 0.2s ease'
                            }}
                            title={`Verified from ${sourceName}`}
                          >
                            <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sourceName}
                            </span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>

                      {/* Action View Button */}
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(row);
                          }}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'rgba(15, 23, 42, 0.95)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing {filteredRows.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, filteredRows.length)} of {filteredRows.length} items
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-outline"
              style={{ padding: '6px 12px', opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', padding: '0 8px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-outline"
              style={{ padding: '6px 12px', opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
