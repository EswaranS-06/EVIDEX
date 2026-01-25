# Deployment Guide: Netlify (Frontend) + Render (Backend + DB)

## Overview
- **Frontend**: Hosted on Netlify (Free)
- **Backend & Database**: Hosted on Render (Free tier)
- **Total Cost**: FREE (both have free tiers)

---

## Part 1: Setup Render (Backend + PostgreSQL)

### Step 1: Prepare Backend Code

1. Update `backend/requirements.txt` - add production dependencies:
```bash
cd backend
# Add gunicorn for production server
uv add gunicorn
uv sync
```

2. The `Procfile` is already created in your root backend folder.

### Step 2: Create Render Account & Deploy Backend

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `evidex-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn config.wsgi`
   - **Plan**: `Free`

5. Click **"Create Web Service"** (Render will provide a URL like `evidex-backend.onrender.com`)

### Step 3: Create PostgreSQL Database on Render

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `evidex-db`
   - **Database**: `evidex_db`
   - **User**: `postgres`
   - **Plan**: `Free`
3. Click **"Create Database"**
4. Note the connection details (will appear after creation)

### Step 4: Add Environment Variables to Render Backend Service

1. Go to your backend service in Render
2. Click **"Environment"** tab
3. Add these environment variables:

```
DEBUG=False
SECRET_KEY=your-secure-random-key-here
ALLOWED_HOSTS=evidex-backend.onrender.com
POSTGRES_DB=evidex_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<from-your-db-details>
POSTGRES_HOST=<from-your-db-details>
POSTGRES_PORT=5432
CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
```

5. Save and redeploy

### Step 5: Run Database Migrations

1. In Render, go to your backend service
2. Click **"Shell"** tab
3. Run these commands:
```bash
python manage.py migrate
python manage.py seed_roles
python manage.py seed_owasp
python manage.py seed_owasp_variants
python manage.py seed_owasp_vulnerabilities
python manage.py seed_owasp_cve_vulnerabilities
python manage.py seed_cve_vulnerabilities
```

✅ Backend is now live at: `https://evidex-backend.onrender.com`

---

## Part 2: Setup Netlify (Frontend)

### Step 1: Prepare Frontend Code

1. Create `.env.production` in frontend folder:
```
VITE_API_URL=https://evidex-backend.onrender.com
```

### Step 2: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign up (free)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy site"**

### Step 3: Add Environment Variables (if needed)

1. In Netlify Dashboard, go to **Site settings** → **Build & deploy** → **Environment**
2. Add:
```
VITE_API_URL=https://evidex-backend.onrender.com
```

✅ Frontend is now live at: `https://your-site-name.netlify.app`

---

## Part 3: Configure Frontend API Calls

Update your frontend `src/api/axios.js` to use the environment variable:

```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});
```

Already configured in your code! Just ensure the `.env` variables are set correctly.

---

## Part 4: Update Django Settings

Your `backend/config/settings.py` needs to be updated for production. Key changes:

1. **ALLOWED_HOSTS**: Add your Render backend URL
2. **CORS_ALLOWED_ORIGINS**: Add your Netlify URL
3. **DEBUG**: Set to `False` in production
4. **SECRET_KEY**: Use environment variable

---

## Troubleshooting

### "502 Bad Gateway" on Render Backend
- Check environment variables are set correctly
- Ensure database is running
- Check logs in Render dashboard

### Frontend can't reach backend
- Verify `VITE_API_URL` is correctly set in Netlify
- Check CORS configuration in Django
- Ensure backend URL in axios.js doesn't have trailing slash

### Database migrations failed
- Use Render's shell to run migrations manually
- Check database connection variables

---

## Monitoring

### View Backend Logs
- Render Dashboard → Backend Service → Logs tab

### View Frontend Logs
- Netlify Dashboard → Site → Deploys → View log

---

## Next Steps

1. ✅ Push your code to GitHub
2. ✅ Deploy backend to Render (with DB)
3. ✅ Deploy frontend to Netlify
4. ✅ Test the full application

**Cost**: FREE (as long as you stay within free tier limits)
