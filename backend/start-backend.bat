@echo off
setlocal

cd /d D:\kenslin\mimi-db\backend
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
