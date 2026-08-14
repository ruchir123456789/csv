import React, { useState, useRef } from 'react';
import { 
  UploadCloud, FileText, Sparkles, CheckCircle2, ShieldCheck, 
  Search, ArrowRight, Loader2, PlayCircle, Layers, Cpu, Zap
} from 'lucide-react';

const SAMPLE_CSV = `manufactu,manufactu,brand,description
Samsung,AR18CY5A,Samsung,1.5 Ton Smart Inverter AC
LG,OLED55C3,LG,55 inch Smart OLED TV
Philips,AC1711/30,Philips,Smart Air Purifier Series 1000i
Whirlpool,IF INV CNV,Whirlpool,265 L Frost Free Refrigerator
Panasonic,NN-ST34H,Panasonic,25 L Solo Microwave Oven
Racold,ECO 15L,Racold,15 L Smart Geyser Water Heater
Godrej,Eon Vogue,Godrej,236 L Frost Free Refrigerator
Havells,Stealth Air,Havells,Smart Ceiling Fan
Sony,SRS-XB100,Sony,Portable Wireless Bluetooth Speaker
Bosch,WAK24264,Bosch,7 kg Fully Automatic Front Load Washing Machine`;

export default function UploadHero({ onUpload, isLoading, uploadProgress }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [includeWebScraping, setIncludeWebScraping] = useState(true);
  const [runVerification, setRunVerification] = useState(true);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        setSelectedFile(file);
      } else {
        alert('Please upload a valid .csv file.');
      }
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleLoadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const file = new File([blob], 'consumer_electronics_sample.csv', { type: 'text/csv' });
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    onUpload(selectedFile, {
      includeWebScraping,
      runVerification
    });
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#34d399',
          fontSize: '0.85rem',
          fontWeight: '600',
          marginBottom: '16px'
        }}>
          <Sparkles size={16} />
          <span>Next-Gen CSV Intelligence & Catalog Enrichment</span>
        </div>

        <h1 style={{
          fontSize: '2.75rem',
          fontWeight: '900',
          lineHeight: '1.2',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Upload, Enrich & Verify Your Product Datasets
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-muted)',
          maxWidth: '720px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Transform raw brand & model lists into enriched catalogs with official Open Icecat specs, 
          AI web intelligence, and live DuckDuckGo accuracy cross-verification.
        </p>
      </div>

      {/* Upload Box Card */}
      <div className="glass-panel" style={{ padding: '36px', position: 'relative', overflow: 'hidden' }}>
        {/* Glowing Decorative Backdrop */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--secondary)' : selectedFile ? 'var(--primary)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragActive ? 'rgba(6, 182, 212, 0.08)' : selectedFile ? 'rgba(16, 185, 129, 0.05)' : 'rgba(15, 23, 42, 0.4)',
            transition: 'all 0.25s ease'
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={handleChange}
            style={{ display: 'none' }}
          />

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: selectedFile ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${selectedFile ? 'var(--primary)' : 'var(--border-subtle)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            color: selectedFile ? 'var(--primary)' : 'var(--text-muted)'
          }}>
            {selectedFile ? <FileText size={32} /> : <UploadCloud size={32} />}
          </div>

          {selectedFile ? (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', fontSize: '1.1rem', marginBottom: '6px' }}>
                <CheckCircle2 size={20} />
                <span>{selectedFile.name}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Processing
              </p>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                style={{ marginTop: '12px', background: 'transparent', border: 'none', color: '#f43f5e', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Choose another file
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>
                Drop your CSV file here, or <span style={{ color: 'var(--secondary)' }}>browse computer</span>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Supports standard CSV files with Brand, Model Code, MPN, or descriptions
              </p>
            </div>
          )}
        </div>

        {/* Options & Action Bar */}
        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {/* Options Toggles */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeWebScraping}
                onChange={(e) => setIncludeWebScraping(e.target.checked)}
                style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
              />
              <span>Deep Web Scraping Fallback</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={runVerification}
                onChange={(e) => setRunVerification(e.target.checked)}
                style={{ accentColor: 'var(--secondary)', width: '16px', height: '16px' }}
              />
              <span>DuckDuckGo Accuracy Audit</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={handleLoadSample}
              className="btn btn-outline"
              title="Load 10 Consumer Appliances Sample Dataset"
            >
              <PlayCircle size={17} color="#22d3ee" />
              <span>Load 10 Items Sample</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedFile || isLoading}
              className="btn btn-primary"
              style={{
                opacity: (!selectedFile || isLoading) ? 0.5 : 1,
                cursor: (!selectedFile || isLoading) ? 'not-allowed' : 'pointer',
                minWidth: '200px'
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing Catalog...</span>
                </>
              ) : (
                <>
                  <span>Enrich & Analyze CSV</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Progress State */}
        {isLoading && (
          <div style={{ marginTop: '28px', padding: '20px', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
              <span style={{ color: '#34d399', fontWeight: '600' }}>
                {uploadProgress || 'Extracting specifications & verifying market data...'}
              </span>
              <span style={{ color: 'var(--text-dim)' }}>Please wait a moment</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #06b6d4, #6366f1)',
                animation: 'pulseGlow 1.5s infinite ease-in-out'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '36px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#34d399' }}>
            <Layers size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Open Icecat Live Engine</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Queries official manufacturer datasheets for categories, titles, high-resolution media, and structured technical specs.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#22d3ee' }}>
            <Cpu size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Web Intelligence Scraper</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Extracts dynamic pricing estimates, inverter/compressor technologies, and power star ratings for domestic appliances.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: '#818cf8' }}>
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Live Web Accuracy Audit</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Cross-verifies model codes and capacities against Google/DuckDuckGo live market indexes to score data closeness (0-100%).
          </p>
        </div>
      </div>
    </div>
  );
}
