# ⚡ CSV Intelligence & Catalog Enrichment Platform

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Python 3.11](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

**A high-performance, full-stack AI catalog enrichment, web intelligence scraper, and accuracy cross-verification platform.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start-local-development) • [API Docs](#-rest-api-reference) • [Render Deployment](#-cloud-deployment-on-render) • [Documentation](#-project-documentation)

</div>

---

## 📖 Overview

The **CSV Intelligence & Catalog Enrichment Platform** transforms raw, unstructured, or incomplete CSV product files into rich, structured product catalogs. 

The platform automatically identifies product brands and model codes, queries verified manufacturer datasheets via the **Open Icecat Live API**, scrapes real-time domestic appliance specifications (inverter technology, BEE 5-star energy ratings, estimated retail pricing), and performs an independent cross-verification audit against search engine indexes to produce a quantified **Closeness Score (0.0% – 100.0%)**.

---

## ✨ Key Features

* 🚀 **Smart Positional & Content Heuristics Parser**: Handles duplicated or irregular CSV column headers (e.g., `manufactu,manufactu,brand,description`) and automatically isolates brand names, model numbers, capacities, and variant descriptions.
* 📦 **Open Icecat Official Catalog Connector**: Fetches authentic manufacturer datasheets, official product codes, high-resolution media URLs, and standardized technical specifications.
* 🌐 **Real-Time Web Intelligence Scraper**: Extracts compressor/inverter hardware tech, power ratings (BEE 5-Star), and current market prices in regional currency for domestic appliances.
* 🛡️ **DuckDuckGo Accuracy & Closeness Engine**: Cross-verifies catalog items against real-time market data to compute data fidelity Closeness Scores and assign overall accuracy grades (`A+ Flawless`, `A High`, `B Moderate`).
* 🛢️ **MongoDB Atlas Cloud Database**: Asynchronously stores processed dataset summaries, match rates, record counts, and timestamps via Motor (`asyncio`).
* 📊 **Interactive Analytics & KPI Dashboard**: HTML5 canvas visualizations (Chart.js) showing category distributions, hardware technology footprints, price distributions, and row-by-row correctness audits.
* 📱 **100% Fully Responsive Modern Glassmorphic Dark UI**: Seamless layout adaptations across mobile devices, tablets, laptops, and ultra-wide desktops.
* ⚡ **Unified Single-Service Deployment**: FastAPI mounts and serves the production React SPA bundle alongside REST API endpoints for simplified 1-click cloud deployments.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 18/19 + Vite)"]
        UI["Glassmorphic Responsive Dark UI"]
        UploadHero["CSV Ingestion & Sample Loader"]
        DataTable["Enhanced Data Table & Search"]
        Analytics["Analytics Dashboard (Chart.js)"]
        History["MongoDB Atlas History Drawer"]
    end

    subgraph Backend ["Backend (FastAPI + Asynchronous Python)"]
        API["FastAPI REST Endpoints (/api/csv)"]
        Parser["Positional & Content Heuristics Parser"]
        Enricher["Hybrid Enrichment Engine"]
        Verifier["Web Closeness & Accuracy Verifier"]
        MongoMgr["MongoDB Atlas Async Connection Manager"]
    end

    subgraph External ["External Services & Databases"]
        Icecat["Open Icecat Live Catalog API"]
        WebIndex["DuckDuckGo Market Index & Scraping"]
        Atlas[("MongoDB Atlas Cloud Database (Cluster0)")]
    end

    UploadHero -->|1. Upload Raw CSV| API
    API --> Parser
    Parser --> Enricher
    Enricher -->|2. Check Catalog| Icecat
    Enricher -->|3. Fallback/Regional Specs| WebIndex
    Enricher --> Verifier
    Verifier -->|4. Cross-verify fidelity| WebIndex
    Verifier --> MongoMgr
    MongoMgr -->|5. Save Summary & Audit| Atlas
    API -->|6. Return Enriched JSON & Download URL| DataTable
    API -->|7. Return KPI & Charts Data| Analytics
    Atlas -->|8. Query Past Datasets| History
```

---

## 🛠️ Technology Stack

### Backend
| Library | Version | Purpose |
| :--- | :--- | :--- |
| **FastAPI** | `^0.115.0` | Asynchronous REST API framework and automatic OpenAPI generation |
| **Uvicorn** | `^0.32.0` | Lightning-fast ASGI web server hosting FastAPI |
| **Motor** | `^3.6.0` | Asynchronous, non-blocking MongoDB driver for Python |
| **PyMongo** | `^4.9.0` | MongoDB driver handling BSON serialization |
| **dnspython** | `^2.6.0` | DNS SRV record resolution for `mongodb+srv://` Atlas URLs |
| **Pandas** | `^2.2.0` | Tabular data processing, header deduplication, and CSV generation |
| **NumPy** | `^1.26.0` | Numerical backend for array and mathematical operations |
| **HTTPX** | `^0.28.0` | Async HTTP client for Open Icecat & search engine requests |
| **BeautifulSoup4** | `^4.12.0` | HTML parser extracting specifications and prices |
| **Pydantic** | `^2.9.0` | Request and response schema validation |
| **Pydantic-Settings** | `^2.15.0` | Environment variable management from `.env` |
| **python-dotenv** | `^1.0.1` | Loads local environment variables |
| **python-multipart** | `^0.0.12` | Handles multipart form-data streams for CSV file uploads |

### Frontend
| Library | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^19.0.0` | Reactive component-based UI framework |
| **Vite** | `^6.0.0` | Ultra-fast development server & Rollup production bundler |
| **Lucide React** | `^0.460.0` | Modern vector icon system |
| **Chart.js** | `^4.4.0` | Responsive HTML5 canvas charting engine |
| **react-chartjs-2** | `^5.2.0` | Official React wrapper components for Chart.js |
| **Axios** | `^1.7.0` | Promise-based HTTP client with dynamic baseURL resolution |
| **Vanilla CSS** | `Custom` | Glassmorphic dark design system with responsive breakpoints |

---

## 🚀 Quick Start (Local Development)

### Option 1: One Single Command (Starts Backend + Frontend together)

From the root project folder (`csv analyser/`), run any of the following:

```bash
# Using Python:
python start.py

# Or using npm:
npm start

# Or double-click on Windows:
start.bat
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173) (or `http://localhost:5174`)
- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Option 2: Running in Dedicated Terminals

#### Terminal 1 — Backend (FastAPI):
```bash
cd backend
python run.py
```

#### Terminal 2 — Frontend (Vite):
```bash
cd frontend
npm run dev
```

---

## 🌐 Cloud Deployment on Render

This repository is optimized for **1-Service Unified Deployment** on [Render](https://render.com).

### Step-by-Step Setup:

1. Create a **New Web Service** on Render and connect your GitHub repository (`ruchir123456789/csv`).
2. Configure Service Settings:
   - **Runtime**: `Python 3`
   - **Root Directory**: *(Leave blank / empty)*
   - **Build Command**:
     ```bash
     npm --prefix frontend install && npm --prefix frontend run build && pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     python backend/run.py
     ```
3. Set Environment Variables in the **Environment** tab:
   | Key | Value |
   | :--- | :--- |
   | `MONGODB_URL` | `mongodb+srv://1234:1234@cluster0.uxcxf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` |
   | `DATABASE_NAME` | `csv_analyser_db` |
   | `PYTHON_VERSION` | `3.11.0` |
4. Click **Deploy**. Both the React Frontend and FastAPI Backend will run under your single Render URL with full MongoDB Atlas connectivity.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Request Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Live system health & MongoDB Atlas status probe | None |
| `GET` | `/api/db/status` | Detailed MongoDB Atlas connection diagnostics | None |
| `POST` | `/api/csv/enrich` | Upload CSV and enrich with Icecat + Web specs | `file: UploadFile` (Multipart) |
| `POST` | `/api/csv/verify` | Cross-verify dataset products against live search | `file: UploadFile` (Multipart) |
| `POST` | `/api/csv/verify/single` | Single item verification probe | `{"brand": "...", "model_code": "..."}` |
| `GET` | `/api/csv/datasets` | Retrieve historical datasets from MongoDB Atlas | `limit: int` (default 30) |
| `GET` | `/api/csv/{file_id}/preview` | Fetch paginated rows for an active dataset | `page: int`, `page_size: int` |
| `GET` | `/api/csv/{file_id}/summary` | Retrieve summary statistics and metrics | `file_id: string` |
| `GET` | `/api/csv/{file_id}/download-enriched` | Download enriched CSV with all technical specs | `file_id: string` |
| `GET` | `/api/csv/{file_id}/download-verified` | Download verified CSV with closeness scores | `file_id: string` |
| `DELETE` | `/api/csv/{file_id}` | Delete dataset from disk and MongoDB Atlas | `file_id: string` |
| `GET` | `/docs` | Interactive Swagger UI documentation | None |
| `GET` | `/redoc` | Interactive ReDoc documentation | None |

---

## 🧪 Automated Testing

Run the end-to-end backend test suite to verify healthchecks, single product probes, CSV dataset verification, closeness scoring, and MongoDB Atlas persistence:

```bash
cd backend
python test_api.py
```

Expected output:
```text
============================================================
ALL DUCKDUCKGO WEB VERIFICATION & CLOSENESS TESTS PASSED 100%!
============================================================
```

---

## 📑 Project Documentation

* 📘 **Master Markdown Documentation**: [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md)
* 📄 **Microsoft Word Documentation**: [`PROJECT_DOCUMENTATION.docx`](./PROJECT_DOCUMENTATION.docx) *(downloadable)*

---

## 📄 License

This project is licensed under the **ISC License**.
