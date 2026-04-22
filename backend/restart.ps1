# Stop any existing uvicorn processes
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue

# Start the backend
Write-Host "Starting PhishGuard Backend..." -ForegroundColor Cyan
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
