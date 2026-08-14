# CSV Analyser Backend (FastAPI)

Modern, fast, and extensible backend API built with FastAPI and Pandas to analyze, query, summarize, and visualize CSV files.

## Features

- **CSV Upload & Ingestion**: Fast parsing and dataset caching.
- **Dataset Metadata**: Total rows, columns, memory footprint, missing cells count, duplicate count.
- **Deep Column Analytics**: Data types, unique counts, sample values, quantiles (q25, q75), skewness, mean, median, min, max, and categorical mode/distribution.
- **Correlation Matrix**: Automatic Pearson correlation computation for numeric fields.
- **Paginated Data Preview**: Fast slice/pagination support for large tabular datasets.
- **Dynamic Query & Filtering**: Filter rows with operators (`equals`, `contains`, `startswith`, `endswith`, `gt`, `gte`, `lt`, `lte`, `is_null`, etc.) and sorting.
- **Visualization Data Engine**: Ready-to-use chart aggregation endpoints (bar, line, scatter, pie, histogram, box).
- **Interactive Swagger Docs**: Interactive testing at `http://127.0.0.1:8000/docs`.

---

## Setup & Running

### 1. Configure Environment Variables

Create or update `.env` in the `backend/` directory:

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=csv_analyser_db
```
*(For MongoDB Atlas, use your cluster connection URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`)*

### 2. Create and Activate Virtual Environment (Recommended)

```bash
# In the backend/ folder:
python -m venv venv

# On Windows:
.\venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Development Server

```bash
python run.py
```
*or directly with uvicorn:*
```bash
uvicorn main:app --reload --port 8000
```

### 5. Access API Documentation

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health & DB Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
- **DB Status Probe**: [http://127.0.0.1:8000/api/db/status](http://127.0.0.1:8000/api/db/status)

---

## API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API status and links |
| `GET` | `/health` | Healthcheck and MongoDB connectivity probe |
| `GET` | `/api/db/status` | Detailed MongoDB ping status |
| `POST` | `/api/csv/upload` | Upload CSV, calculate stats, and persist in MongoDB |
| `GET` | `/api/csv/datasets` | List uploaded datasets history stored in MongoDB |
| `GET` | `/api/csv/{file_id}/metadata` | Fetch row count, memory size, duplicate stats |
| `GET` | `/api/csv/{file_id}/summary` | Column statistics, distributions, and correlation |
| `GET` | `/api/csv/{file_id}/preview` | Paginated preview of rows |
| `POST` | `/api/csv/filter` | Apply conditional filters, sort, and paginate |
| `POST` | `/api/csv/chart` | Aggregated data for charting |
| `GET` | `/api/csv/{file_id}/download` | Download the CSV dataset |
| `DELETE` | `/api/csv/{file_id}` | Delete dataset record from MongoDB and disk |
