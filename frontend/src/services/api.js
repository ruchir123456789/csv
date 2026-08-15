import axios from 'axios';

// In production or custom env, uses the deployed backend URL (e.g. https://your-backend.onrender.com)
// In local development, falls back to direct http://127.0.0.1:8000 if not proxying
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  // When running locally under static serve (like port 3000, 5000, etc.) without vite proxy
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port !== '8000' && window.location.port !== '5173') {
    return 'http://127.0.0.1:8000';
  }
  return '';
};

const SERVER_URL = getBaseUrl();
const API_BASE = `${SERVER_URL}/api`;

export const api = {
  // System Health & Database Status
  async getHealth() {
    try {
      const res = await axios.get(`${SERVER_URL}/health`);
      return res.data;
    } catch {
      const res = await axios.get('http://127.0.0.1:8000/health');
      return res.data;
    }
  },

  async getDbStatus() {
    try {
      const res = await axios.get(`${API_BASE}/db/status`);
      return res.data;
    } catch {
      const res = await axios.get('http://127.0.0.1:8000/api/db/status');
      return res.data;
    }
  },

  // Upload & Enrich CSV with Open Icecat + Web Scraping
  async enrichCSV(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    if (options.brandColumn) formData.append('brand_column', options.brandColumn);
    if (options.modelColumn) formData.append('model_column', options.modelColumn);
    if (options.descriptionColumn) formData.append('description_column', options.descriptionColumn);
    formData.append('include_web_scraping', options.includeWebScraping !== false ? 'true' : 'false');

    const res = await axios.post(`${API_BASE}/csv/enrich`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Web Verification against DuckDuckGo
  async verifyCSV(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post(`${API_BASE}/csv/verify`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Dataset Analytics & Summary
  async getSummary(fileId) {
    const res = await axios.get(`${API_BASE}/csv/${fileId}/summary`);
    return res.data;
  },

  // Dataset Preview
  async getPreview(fileId, page = 1, pageSize = 20) {
    const res = await axios.get(`${API_BASE}/csv/${fileId}/preview`, {
      params: { page, page_size: pageSize },
    });
    return res.data;
  },

  // MongoDB Uploaded Datasets History
  async getHistory(limit = 50) {
    const res = await axios.get(`${API_BASE}/csv/datasets`, {
      params: { limit },
    });
    return res.data;
  },

  // Delete Dataset
  async deleteDataset(fileId) {
    const res = await axios.delete(`${API_BASE}/csv/${fileId}`);
    return res.data;
  },

  // Download URLs
  getEnrichedDownloadUrl(fileId) {
    return `${API_BASE}/csv/${fileId}/download-enriched`;
  },

  getVerifiedDownloadUrl(fileId) {
    return `${API_BASE}/csv/${fileId}/download-verified`;
  }
};
