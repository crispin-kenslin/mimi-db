# MIMI DB v2.0 — Minor Millets Multi-Omics Database

An upgraded full-stack bioinformatics web application for the **Minor Millets Database (MIMI DB)**, originally developed at the Bioinformatics Centre, Tamil Nadu Agricultural University ([TNAU MIMI DB](http://bioinfo.tnau.ac.in/mimidb/homepage.html#)).

This version features a professional, institutional-grade UI with comprehensive genomic, transcriptomic, and metabolomic data visualization for six minor millet species.

---

## How to Run the Application

### Prerequisites
- **Python 3.11+** installed on Windows 11
- **Node.js 18+** and **npm** installed
- **PostgreSQL** installed and running

---

### Step 1: Set Up the PostgreSQL Database

1. Open **pgAdmin** or the `psql` command-line tool.
2. Create a new database:
   ```sql
   CREATE DATABASE mimidb;
   ```
3. Load the schema and sample data into the database:
   ```powershell
   psql -U postgres -d mimidb -f "d:\Crispin Joe Kenslin A\STIFDB3\APP\bioinformatics-millets\database\schema.sql"
   ```
   *(When prompted, enter your PostgreSQL password.)*

4. **Important:** If your PostgreSQL password is not `123`, update the connection string in:
   ```
   backend/app/database.py
   ```
   Change the line:
   ```python
   SQLALCHEMY_DATABASE_URL = "postgresql://postgres:123@localhost:5432/mimidb"
   ```
   Replace `123` with your actual password.

---

### Step 2: Start the Backend (FastAPI)

Open a **PowerShell** terminal:

```powershell
cd "d:\Crispin Joe Kenslin A\STIFDB3\APP\bioinformatics-millets\backend"

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the server
python run.py
```

✅ Backend is now running at **http://localhost:8000**
- API docs available at **http://localhost:8000/docs**
- Health check at **http://localhost:8000/health**

---

### Step 3: Start the Frontend (React + Vite)

Open a **second** PowerShell terminal (keep the backend running):

```powershell
cd "d:\Crispin Joe Kenslin A\STIFDB3\APP\bioinformatics-millets\frontend"

# Install npm packages (first time only)
npm install

# Start the development server
npm run dev
```

✅ Frontend is now running at **http://localhost:5173**

---

## Application Features

### Home Page
- Professional institutional-style dashboard
- Browse all 6 minor millets at a glance with chromosome count, genome size, ploidy, and drought tolerance
- Quick statistics banner

### Crop Detail Page
When you click on any millet, you get 5 tabs:

| Tab | Content |
|-----|---------|
| **Overview** | Full botanical profile, genetic classification, nutritional composition with interactive bar chart |
| **Genomics** | Assembly info with download links, genome stats cards, gene summary chart, repeat element pie chart, gene family bar chart, ortholog comparison |
| **Transcriptomics** | DEG summary across experiments, per-experiment details with top differentially expressed genes table |
| **Metabolomics** | Metabolite class distribution pie chart, key metabolites table with bioactivity info |
| **Analyses** | GWAS, phylogeny, comparative genomics, and other analysis reports |

### Search
- Filter crops by name, scientific name, or common names
- Gene and metabolite search (coming soon)

---

## Species Included

| # | Common Name | Scientific Name | Genome Size |
|---|-------------|-----------------|-------------|
| 1 | Finger Millet | *Eleusine coracana* | 1196 Mb |
| 2 | Foxtail Millet | *Setaria italica* | 490 Mb |
| 3 | Proso Millet | *Panicum miliaceum* | 923 Mb |
| 4 | Pearl Millet | *Pennisetum glaucum* | 1760 Mb |
| 5 | Little Millet | *Panicum sumatrense* | 510 Mb |
| 6 | Barnyard Millet | *Echinochloa esculenta* | 1340 Mb |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/crops/` | List all crops |
| GET | `/crops/{id}` | Get crop details with all omics data |
| GET | `/crops/{id}/genomics` | Get genomics data for a crop |
| GET | `/crops/{id}/transcriptomics` | Get transcriptomics data |
| GET | `/crops/{id}/metabolomics` | Get metabolomics data |
| GET | `/crops/{id}/analyses` | Get analysis reports |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, Uvicorn |
| Database | PostgreSQL |
| Frontend | React 18, Vite 5, Recharts, Lucide Icons |
| Styling | Vanilla CSS (institutional green palette) |

---

## Future Deployment (Linux + Apache)

1. **Backend**: Use Gunicorn with Uvicorn workers behind a systemd service.
2. **Frontend**: Run `npm run build` and serve the `dist/` folder via Apache `DocumentRoot`.
3. **Proxy**: Configure Apache `ProxyPass /api http://127.0.0.1:8000/` for API routing.
4. **Database**: Migrate using `pg_dump` / `pg_restore`.
