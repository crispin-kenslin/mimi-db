# Deploy MIMI DB on XAMPP (Windows 10)

This setup serves the React frontend from Apache at:
- http://localhost/mimi-db
- http://localhost/mimi-db/browse

The Python FastAPI backend runs separately on 127.0.0.1:8000 and Apache proxies:
- /api -> FastAPI root
- /jbrowse -> FastAPI static mount
- /data -> FastAPI static mount

## 1) Build and publish frontend into XAMPP

1. Open PowerShell.
2. Build the React app:
   - cd D:\kenslin\mimi-db\frontend
   - npm install
   - npm run build
3. Copy built files to XAMPP htdocs:
   - robocopy D:\kenslin\mimi-db\frontend\dist C:\xampp\htdocs\mimi-db /MIR

Note: .htaccess is included from frontend/public/.htaccess.

## 2) Enable Apache modules in XAMPP

In C:\xampp\apache\conf\httpd.conf, ensure these lines are enabled (not commented):
- LoadModule rewrite_module modules/mod_rewrite.so
- LoadModule proxy_module modules/mod_proxy.so
- LoadModule proxy_http_module modules/mod_proxy_http.so
- LoadModule headers_module modules/mod_headers.so

Also ensure:
- Include conf/extra/httpd-vhosts.conf

## 3) Add VirtualHost for localhost

Edit C:\xampp\apache\conf\extra\httpd-vhosts.conf and add:

<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "C:/xampp/htdocs"

    ProxyPreserveHost On

    ProxyPass /api/ http://127.0.0.1:8000/
    ProxyPassReverse /api/ http://127.0.0.1:8000/

    ProxyPass /jbrowse/ http://127.0.0.1:8000/jbrowse/
    ProxyPassReverse /jbrowse/ http://127.0.0.1:8000/jbrowse/

    ProxyPass /data/ http://127.0.0.1:8000/data/
    ProxyPassReverse /data/ http://127.0.0.1:8000/data/

    Alias /mimi-db "C:/xampp/htdocs/mimi-db"
    <Directory "C:/xampp/htdocs/mimi-db">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

Save and restart Apache from XAMPP Control Panel.

## 4) Prepare backend Python environment

In PowerShell:
- cd D:\kenslin\mimi-db\backend
- python -m venv venv
- .\venv\Scripts\Activate.ps1
- pip install -r requirements.txt

Test backend:
- python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
- Open http://127.0.0.1:8000/health

## 5) Auto-start backend with Task Scheduler

Use Administrator PowerShell and run:

- cd D:\kenslin\mimi-db\backend
- .\install-backend-startup-task.ps1 -RunNow

This creates or replaces the task "MIMI-DB-FastAPI" with:
- Trigger: At system startup (30s delay)
- RunAs: SYSTEM with highest privileges
- Action: powershell.exe -NoProfile -ExecutionPolicy Bypass -File D:\kenslin\mimi-db\backend\start-backend.ps1
- Restart on failure: enabled

Verify task health:
- schtasks /Query /TN "MIMI-DB-FastAPI" /V /FO LIST
- Get-Content D:\kenslin\mimi-db\backend\logs\backend-startup.log -Tail 50

Optional manual start/stop commands:
- schtasks /Run /TN "MIMI-DB-FastAPI"
- schtasks /End /TN "MIMI-DB-FastAPI"

## 6) Access URLs

- Main app: http://localhost/mimi-db
- Browse page: http://localhost/mimi-db/browse
- API health through Apache proxy: http://localhost/api/health

## 7) Update workflow after frontend changes

After updating frontend code:
1. cd D:\kenslin\mimi-db\frontend
2. npm run build
3. robocopy D:\kenslin\mimi-db\frontend\dist C:\xampp\htdocs\mimi-db /MIR

No Apache config changes are needed for regular UI updates.
