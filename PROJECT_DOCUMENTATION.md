# CSV Analyser & Product Intelligence Platform — Master Technical Documentation

A comprehensive, production-grade, full-stack AI catalog enrichment, web verification, and data analytics platform built with **FastAPI**, **React (Vite)**, **MongoDB Atlas**, **Open Icecat Live API**, and **DuckDuckGo Web Intelligence**.

---

## 1. System Architecture & High-Level Flow

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 18 + Vite)"]
        UI["Modern Glassmorphic Dark UI"]
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

## 2. Technology Stack & Complete Library Reference

### Backend Technologies (Python 3.10+)

| Library / Tool | Version | Purpose & Usage in Project |
| :--- | :--- | :--- |
| **FastAPI** | `^0.115.0` | High-performance asynchronous REST API framework for defining endpoints, request validation, and OpenAPI generation. |
| **Uvicorn** | `^0.32.0` | Lightning-fast ASGI web server hosting the FastAPI application locally and in production. |
| **Motor** | `^3.6.0` | Asynchronous, non-blocking MongoDB driver for Python built on top of `asyncio`. |
| **PyMongo** | `^4.9.0` | Core MongoDB Python driver handling BSON serialization and command execution. |
| **dnspython** | `^2.6.0` | Required for DNS SRV record resolution used by MongoDB Atlas `mongodb+srv://` connection strings. |
| **Pandas** | `^2.2.0` | High-throughput tabular data processing, column deduplication, DataFrame concatenation, and CSV generation. |
| **NumPy** | `^1.26.0` | Numerical backend for Pandas operations and statistical array calculations. |
| **HTTPX** | `^0.28.0` | Async HTTP client used to query Open Icecat APIs and fetch DuckDuckGo search responses. |
| **BeautifulSoup4** | `^4.12.0` | HTML parser used to extract titles, snippets, specs, and price tags from search result pages. |
| **Pydantic** | `^2.9.0` | Schema validation and data modeling for API request/response payloads. |
| **Pydantic-Settings** | `^2.15.0` | Structured environment variable management reading from `.env` and system variables. |
| **python-dotenv** | `^1.0.1` | Loads local environment variables from `.env` into `os.environ`. |
| **python-multipart** | `^0.0.12` | Handles multipart form-data streams for CSV file uploads in FastAPI. |

---

### Frontend Technologies (React 18 + Vite)

| Library / Tool | Version | Purpose & Usage in Project |
| :--- | :--- | :--- |
| **React & React-DOM** | `^19.0.0` / `^18.3.0` | Component-based reactive UI library managing application state and rendering. |
| **Vite** | `^6.0.0` | Next-generation build tool with instant Hot Module Replacement (HMR) and optimized Rollup bundling. |
| **Lucide React** | `^0.460.0` | Premium, lightweight vector iconography for the entire user interface. |
| **Chart.js** | `^4.4.0` | HTML5 canvas-based charting engine for visual analytics. |
| **react-chartjs-2** | `^5.2.0` | Official React wrapper components for Chart.js (`Doughnut`, `Bar`, `Line`). |
| **Axios** | `^1.7.0` | Promise-based HTTP client for calling backend endpoints with fallback routing. |
| **Vanilla CSS** | `Custom` | Bespoke glassmorphic dark design system with CSS custom properties, micro-animations, and responsive grids. |

---

### Cloud Database & Hosting

| Service | Configuration | Purpose |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Cluster: `Cluster0`<br>Database: `csv_analyser_db`<br>Driver: `Motor (async)` | Cloud document database storing uploaded dataset metadata, match stats, and audit history. |
| **Render** | All-in-One Web Service (Python + Node Build) | Cloud hosting platform executing FastAPI and serving the built React frontend. |

---

## 3. Detailed File & Codebase Architecture

```text
csv analyser/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── csv_analysis.py       # Additional analysis routes & summary stats
│   │   ├── core/
│   │   │   └── config.py                 # Pydantic Settings, environment loader, constants
│   │   ├── db/
│   │   │   ├── mongodb.py                # MongoDB Atlas connection manager & ping healthcheck
│   │   │   └── repositories/
│   │   │       └── dataset_repository.py # MongoDB CRUD operations for dataset history
│   │   ├── routes/
│   │   │   └── csv.py                    # Core CSV upload, enrich, verify, & download routes
│   │   ├── schemas/
│   │   │   ├── enrichment_schema.py      # Pydantic schemas for enrichment responses
│   │   │   ├── verification_schema.py    # Pydantic schemas for verification audits
│   │   │   └── icecat.py                 # Schema for Icecat data structures
│   │   ├── services/
│   │   │   ├── enricher.py               # Hybrid Icecat + Web Scraper enrichment engine
│   │   │   ├── verifier.py               # DuckDuckGo market verification & closeness scoring
│   │   │   ├── icecat.py                 # Open Icecat Live API client
│   │   │   └── csv_service.py            # DataFrame in-memory caching & JSON sanitizer
│   │   ├── config.py                     # Convenience re-export for settings
│   │   └── database.py                   # Helper functions for collections
│   ├── uploads/                          # Local storage for raw and enriched CSV files
│   ├── .env                              # Active environment variables & Atlas URI
│   ├── .env.example                      # Template environment variables
│   ├── main.py                           # FastAPI application entrypoint with lifespan & SPA serving
│   ├── run.py                            # Multi-environment launcher respecting $PORT
│   ├── test_api.py                       # Automated test suite for all endpoints
│   ├── generate_swagger.py               # Utility to export openapi.json
│   └── requirements.txt                  # Python dependencies list
│
├── frontend/
│   ├── public/                           # Static assets and favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx                # Sticky header with navigation & live Atlas status badge
│   │   │   ├── UploadHero.jsx            # Drag-and-drop CSV uploader & 10-item demo sample
│   │   │   ├── EnrichedDataView.jsx      # Interactive data table with search, filters & export
│   │   │   ├── AnalyticsDashboard.jsx    # Chart.js charts & row correctness verification cards
│   │   │   ├── ProductModal.jsx          # Detailed product datasheet & image modal
│   │   │   └── HistoryDrawer.jsx         # Sidebar history drawer for MongoDB Atlas records
│   │   ├── services/
│   │   │   └── api.js                    # Axios service with dynamic backend URL resolution
│   │   ├── App.jsx                       # Root React state container & periodic DB health polling
│   │   ├── main.jsx                      # React 18 DOM mount entrypoint
│   │   └── index.css                     # Design tokens, typography, glassmorphism, animations
│   ├── index.html                        # HTML template loading Inter & Outfit fonts
│   ├── vite.config.js                    # Vite configuration with proxy to FastAPI
│   └── package.json                      # Frontend dependencies and npm scripts
│
├── .gitignore                            # Root gitignore for clean commits
├── package.json                          # Root scripts (npm start, npm run dev, etc.)
├── render.yaml                           # Render Cloud Infrastructure as Code (Blueprint)
├── start.bat                             # Windows double-click launcher
├── start.ps1                             # PowerShell launcher
├── start.py                              # Cross-platform full-stack launcher
└── PROJECT_DOCUMENTATION.md              # This master documentation file
```

---

## 4. Key Engines & How They Work

### 1. Positional & Content-Aware Parser (`enricher.py`)
- Standard CSVs often have messy or duplicate column names (e.g. `manufactu,manufactu,brand,description`).
- The parser evaluates each column by name and content:
  - Detects known brand names (`Samsung`, `LG`, `Philips`, `Whirlpool`, `Panasonic`, etc.).
  - Distinguishes model numbers (`AR18CY5A`, `OLED55C3`, `AC1711/30`) by checking alphanumeric patterns and hyphens/slashes.
  - Isolates feature descriptions (`1.5 Ton`, `5 Star`, `Frost Free`, `Inverter`).

### 2. Open Icecat Live API Connector (`icecat.py`)
- Calls `https://live.icecat.biz/api/` with `shopname=openicecat-live`.
- Retrieves verified manufacturer datasheets, official product codes, high-resolution media URLs, and standardized technical specifications.

### 3. Web Intelligence & Scraping Fallback (`enricher.py`)
- When regional consumer appliances are not present in global Icecat catalogs, the engine:
  - Queries live search engine indices.
  - Extracts hardware technology (e.g., `WindFree Cooling`, `Dual Inverter`, `BLDC Motor`, `NanoProtect HEPA`).
  - Extracts energy ratings (e.g., `5 Star Energy Rating BEE`).
  - Estimates current live market pricing in regional currency.
  - Categorizes the product (Air Conditioner, Refrigerator, Smart TV, Geyser, etc.).

### 4. Live Verification & Closeness Scoring Engine (`verifier.py`)
- Performs an independent cross-verification audit for every item in the dataset.
- Computes a **Closeness Score (0.0% – 100.0%)** evaluating:
  - **Brand Match**: Verifies manufacturer identity against live market listings.
  - **Model Code Match**: Confirms alphanumeric model codes with real listings.
  - **Specification Fidelity**: Validates key features (capacity, energy rating, inverter type).
- Assigns an **Overall Accuracy Grade** (`A+ Flawless`, `A High`, `B Moderate`, etc.) and generates downloadable verified CSVs.

### 5. MongoDB Atlas Async Persistence (`dataset_repository.py`)
- Automatically saves every processed dataset into the `datasets` collection in MongoDB Atlas.
- Stores dataset summaries, match rates, record counts, and timestamps.
- Powers the **History Drawer** in the UI, allowing users to review and re-inspect previous runs.

---

## 5. REST API Reference

| Method | Route | Description | Request / Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | System health check and live MongoDB Atlas connection status. | None |
| `GET` | `/api/db/status` | Detailed MongoDB Atlas connection ping and cluster diagnostics. | None |
| `POST` | `/api/csv/enrich` | Ingests a CSV file, executes enrichment pipeline, and returns enriched JSON. | `file: UploadFile` (Multipart) |
| `POST` | `/api/csv/verify` | Audits dataset products against live search listings and calculates closeness scores. | `file: UploadFile` (Multipart) |
| `POST` | `/api/csv/verify/single` | Instant single-item verification probe. | `{"brand": "...", "model_code": "...", "description": "..."}` |
| `GET` | `/api/csv/datasets` | Retrieves historical enriched datasets stored in MongoDB Atlas. | `limit: int` (default 30) |
| `GET` | `/api/csv/{file_id}/preview` | Returns paginated rows for an enriched dataset. | `page: int`, `page_size: int` |
| `GET` | `/api/csv/{file_id}/summary` | Fetches aggregated statistics and chart metrics for a dataset. | `file_id: string` |
| `GET` | `/api/csv/{file_id}/download-enriched` | Downloads the enriched CSV with all added technical specifications. | `file_id: string` |
| `GET` | `/api/csv/{file_id}/download-verified` | Downloads the verified CSV with closeness scores and audit notes. | `file_id: string` |
| `DELETE` | `/api/csv/{file_id}` | Removes a dataset from local disk and MongoDB Atlas. | `file_id: string` |
| `GET` | `/docs` | Interactive Swagger UI API documentation. | None |
| `GET` | `/redoc` | Interactive ReDoc API documentation. | None |

---

## 6. How to Run Locally

### 1. One Single Command (Starts Backend + Frontend together):
```powershell
python start.py
```
*(or run `npm start` or double-click `start.bat`)*

- **Frontend UI**: [http://localhost:5173](http://localhost:5173) (or `http://localhost:5174`)
- **Backend API**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Running in Separate Terminals:
- **Terminal 1 (Backend)**:
  ```powershell
  cd backend
  python run.py
  ```
- **Terminal 2 (Frontend)**:
  ```powershell
  cd frontend
  npm run dev
  ```

---

## 7. Cloud Deployment on Render (All-in-One Service)

1. Connect your GitHub repository (`ruchir123456789/csv`) to Render.
2. In the **Render Dashboard**, create or update your **Web Service**:
   - **Environment**: `Python 3`
   - **Root Directory**: *(Leave empty)*
   - **Build Command**:
     ```bash
     npm --prefix frontend install && npm --prefix frontend run build && pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     python backend/run.py
     ```
3. Add these **Environment Variables**:
   | Key | Value |
   | :--- | :--- |
   | `MONGODB_URL` | `mongodb+srv://1234:1234@cluster0.uxcxf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0` |
   | `DATABASE_NAME` | `csv_analyser_db` |
   | `PYTHON_VERSION` | `3.11.0` |

---

## 8. Summary of All Completed Work

1. **MongoDB Atlas Integration**: Connected and verified live with `Cluster0` cloud database.
2. **Pipelines & Bug Fixes**: Resolved all unhandled variable references (`icecat_data`) and added robust fallback error handling.
3. **Unified Full-Stack Serving**: Configured FastAPI to serve both API endpoints and the React single-page application under a single port/domain.
4. **Resilient Status Indicator**: Live glowing badge (`MongoDB: Connected 🟢` / `MongoDB: Offline 🔴`) with automatic background polling every 15 seconds.
5. **Production Deployment Ready**: Committed and pushed to GitHub with clean `.gitignore` and `render.yaml` configuration.
