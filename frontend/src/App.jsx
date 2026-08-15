import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadHero from './components/UploadHero';
import EnrichedDataView from './components/EnrichedDataView';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ProductModal from './components/ProductModal';
import HistoryDrawer from './components/HistoryDrawer';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [fileData, setFileData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [verificationInsights, setVerificationInsights] = useState(null);
  const [activeFileId, setActiveFileId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [dbConnected, setDbConnected] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Check health and load MongoDB history on mount
  useEffect(() => {
    async function checkDb() {
      try {
        const dbStatus = await api.getDbStatus();
        if (dbStatus?.status === 'connected') {
          setDbConnected(true);
        } else {
          const health = await api.getHealth();
          setDbConnected(health?.database?.status === 'connected');
        }
      } catch {
        setDbConnected(false);
      }
    }

    async function initSystem() {
      await checkDb();
      loadHistory();
    }

    initSystem();
    const interval = setInterval(checkDb, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = async () => {
    try {
      const history = await api.getHistory(30);
      setHistoryList(history || []);
    } catch (e) {
      console.warn('Failed to load dataset history from MongoDB:', e);
    }
  };

  // Main Upload & Enrichment Handler
  const handleUpload = async (file, options) => {
    setIsLoading(true);
    setUploadProgress('Ingesting CSV & Parsing Brand Identifiers...');

    try {
      // 1. Enrich with Open Icecat + Web Scraper
      setUploadProgress('Querying Open Icecat Live API & Compiling Tech Matrix...');
      const enrichRes = await api.enrichCSV(file, options);
      
      const fileId = enrichRes.file_id;
      setActiveFileId(fileId);
      setSummary(enrichRes);

      // 2. Cross-Verify with DuckDuckGo if enabled
      let verifyInsights = null;
      if (options.runVerification) {
        setUploadProgress('Cross-Verifying Model Specs against DuckDuckGo Live Index...');
        try {
          const verifyRes = await api.verifyCSV(file);
          verifyInsights = verifyRes.dataset_insights;
          setVerificationInsights(verifyInsights);
        } catch (err) {
          console.warn('Verification step warning:', err);
        }
      }

      // 3. Fetch Preview Rows
      setUploadProgress('Rendering Enhanced Product Intelligence...');
      const previewRes = await api.getPreview(fileId, 1, 100);
      setFileData(previewRes.rows || enrichRes.preview_rows || []);

      // Refresh history
      loadHistory();

      // Switch to Enhanced Data tab
      setActiveTab('data');
    } catch (err) {
      console.error('Processing error:', err);
      alert(`Processing Error: ${err?.response?.data?.detail || err.message || 'Failed to process CSV file'}`);
    } finally {
      setIsLoading(false);
      setUploadProgress('');
    }
  };

  // Load Past Dataset from History Drawer
  const handleLoadDataset = async (fileId, filename) => {
    setIsLoading(true);
    try {
      setActiveFileId(fileId);
      const previewRes = await api.getPreview(fileId, 1, 100);
      setFileData(previewRes.rows || []);
      
      // Try to load summary
      try {
        const sum = await api.getSummary(fileId);
        setSummary(sum);
      } catch {}

      setIsHistoryOpen(false);
      setActiveTab('data');
    } catch (err) {
      alert(`Failed to load dataset: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Dataset from History
  const handleDeleteDataset = async (fileId) => {
    try {
      await api.deleteDataset(fileId);
      setHistoryList(prev => prev.filter(item => (item.file_id || item.id) !== fileId));
      if (activeFileId === fileId) {
        setFileData(null);
        setSummary(null);
        setActiveFileId(null);
        setActiveTab('upload');
      }
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const downloadUrls = activeFileId ? {
    enriched: api.getEnrichedDownloadUrl(activeFileId),
    verified: api.getVerifiedDownloadUrl(activeFileId)
  } : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasData={Boolean(fileData && fileData.length > 0)}
        dbConnected={dbConnected}
        onOpenHistory={() => {
          loadHistory();
          setIsHistoryOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'upload' && (
          <UploadHero
            onUpload={handleUpload}
            isLoading={isLoading}
            uploadProgress={uploadProgress}
          />
        )}

        {activeTab === 'data' && (
          <div className="animate-fade-in">
            <EnrichedDataView
              data={fileData}
              summary={summary}
              fileId={activeFileId}
              onSelectProduct={setSelectedProduct}
              downloadUrls={downloadUrls}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <AnalyticsDashboard
              data={fileData}
              summary={summary}
              verificationInsights={verificationInsights}
            />
          </div>
        )}
      </main>

      {/* Product Detail Slideover Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* MongoDB History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyList}
        onLoadDataset={handleLoadDataset}
        onDeleteDataset={handleDeleteDataset}
      />
    </div>
  );
}
