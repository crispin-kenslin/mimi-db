# Start backend (FastAPI with uvicorn)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
cd D:\kenslin\mimi-db\backend;
.\venv\Scripts\Activate.ps1;
python run.py
"

# Start frontend (React/Vite/etc.)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
cd D:\kenslin\mimi-db\frontend;
npm install;
npm run dev
"