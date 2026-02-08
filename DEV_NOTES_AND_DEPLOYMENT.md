## Claims AI Dashboard – Dev Notes and Deployment

### What the new app does now
- **File-based processing** (no DB yet). Backend reads/writes CSV.
- **Upload Excel** → standardize/clean → run AI → save annotated CSV.
- **Analytics endpoints** compute from latest processed CSV.
- **UI pages**: Dashboard (AI + KPIs), Analytics (charts), Upload.

### Where data is saved
- Uploads: `backend/data/uploads/{timestamp}_{filename}`
- Processed CSV: `backend/data/processed/{timestamp}_processed.csv`

### How AI/analytics fetch data
- Endpoints load the newest `*_processed.csv` using
  `FileProcessor.get_latest_processed_data()`.
- AI is re-run on the loaded DataFrame per request to compute summary/cases.

### Endpoints (current)
- POST `/api/upload` → processes Excel and writes processed CSV.
- GET `/api/fraud/ai-overview` → AI metrics from latest processed data.
- GET `/api/fraud/ai-cases` → AI cases with reasons and actions.
- GET `/api/dashboard/overview` → totals, avg, period, top specialty.
- GET `/api/dashboard/specialties?limit=20` → claims/amounts by specialty.
- GET `/api/dashboard/diagnoses?limit=20` → cases/cost by diagnosis.

Note: No export endpoints yet. Latest processed CSV can be downloaded
directly from the server path as a workaround.

### Frontend charts (Analytics page)
- Patient Volume by Specialty (Bar)
- Most Common Diagnoses (Pie)
- Cost Distribution by Specialty (Bar)
- Top Diagnoses by Cost (Bar)

### What is not in this version
- Database persistence of uploads/runs (optional future step).
- CSV export API routes for analytics (can be added later).

### Next steps (optional)
- Add CSV exports for specialties/diagnoses.
- Add Postgres and persist upload runs and AI results.
- Read analytics/AI from DB with filters.

---

## PM2 Deployment on Linux (backend + frontend)

Prereqs: Node.js 18+, Python 3.10+, git, build tools. Run as non-root.

1) Clone repo
```
git clone <repo_url> claims-ai-dashboard
cd claims-ai-dashboard
```

2) Backend setup
```
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

3) Frontend build
```
cd frontend
npm ci || npm install
npm run build
cd ..
```

4) PM2 config (repo root)
Create `ecosystem.config.js`:
```
module.exports = {
  apps: [
    {
      name: 'claims-backend',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      cwd: './backend',
      interpreter: './.venv/bin/python',
      env: { PYTHONUNBUFFERED: '1' }
    },
    {
      name: 'claims-frontend',
      script: 'npx',
      args: 'serve -s build -l 3000',
      cwd: './frontend'
    }
  ]
}
```

5) Start with PM2
```
sudo npm i -g pm2 serve
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

6) Autostart on reboot
```
pm2 startup systemd
# follow the command PM2 prints
pm2 save
```

7) Optional: Nginx reverse proxy
```
sudo apt-get update && sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/claims <<'NGINX'
server {
  listen 80;
  server_name _;

  location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
NGINX
sudo ln -sf /etc/nginx/sites-available/claims /etc/nginx/sites-enabled/claims
sudo nginx -t && sudo systemctl reload nginx
```

Notes
- Backend reads/writes under `backend/data/uploads` and `backend/data/processed`.
- For HTTPS, add certificates to the Nginx server block (e.g., certbot).


