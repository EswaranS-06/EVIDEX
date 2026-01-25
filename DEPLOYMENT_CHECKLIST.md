# Netlify + Render Deployment Checklist

## 🔧 Code Preparation (DONE ✅)

- [x] Created `Procfile` for Render backend
- [x] Created `.env.example` files for both backend and frontend
- [x] Created `netlify.toml` for frontend build configuration
- [x] Updated `settings.py` for production (SECRET_KEY, DEBUG, ALLOWED_HOSTS from env variables)
- [x] Updated `axios.js` to use `VITE_API_URL` environment variable
- [x] Added gunicorn to requirements.txt

## 📋 Before Deployment

### Backend Preparation
- [ ] Push code to GitHub (create a new repo or update existing)
- [ ] Create `.env` file locally with actual database credentials for Render
  ```
  DEBUG=False
  SECRET_KEY=generate-a-secure-key-here
  ALLOWED_HOSTS=your-backend.onrender.com
  POSTGRES_DB=evidex_db
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=secure-password
  POSTGRES_HOST=dpg-xxxxx.onrender.com
  POSTGRES_PORT=5432
  CORS_ALLOWED_ORIGINS=https://your-site.netlify.app
  ```

### Frontend Preparation
- [ ] Push code to GitHub
- [ ] Create `.env.production` locally (optional, can be set in Netlify dashboard)
  ```
  VITE_API_URL=https://your-backend.onrender.com
  ```

## 🚀 Deployment Steps

### Step 1: Deploy Backend + Database to Render (15-20 minutes)

1. [ ] Go to [render.com](https://render.com)
2. [ ] Sign up with GitHub account
3. [ ] Click "New +" → "Web Service"
4. [ ] Select your GitHub repository
5. [ ] Configure:
   - Name: `evidex-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn config.wsgi`
   - Plan: `Free`
6. [ ] Click "Create Web Service"
7. [ ] Wait for deployment to complete (green checkmark)
8. [ ] Note your backend URL: `https://evidex-backend.onrender.com`

### Step 2: Create PostgreSQL Database on Render

1. [ ] In Render Dashboard, click "New +" → "PostgreSQL"
2. [ ] Configure:
   - Name: `evidex-db`
   - Database: `evidex_db`
   - User: `postgres`
   - Region: Same as backend
   - Plan: `Free`
3. [ ] Click "Create Database"
4. [ ] Copy the connection string/credentials
5. [ ] Update your backend's environment variables with DB details

### Step 3: Set Environment Variables on Render Backend

1. [ ] Go to your backend service on Render
2. [ ] Click "Environment" tab
3. [ ] Add all variables from your `.env` file:
   - `DEBUG=False`
   - `SECRET_KEY=your-generated-key`
   - `ALLOWED_HOSTS=your-backend.onrender.com`
   - `POSTGRES_DB=evidex_db`
   - `POSTGRES_USER=postgres`
   - `POSTGRES_PASSWORD=<from-db>`
   - `POSTGRES_HOST=<from-db>`
   - `POSTGRES_PORT=5432`
   - `CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app`
4. [ ] Click "Save"
5. [ ] Service will auto-redeploy

### Step 4: Run Database Migrations

1. [ ] Go to backend service → "Shell" tab
2. [ ] Run these commands:
   ```bash
   python manage.py migrate
   python manage.py seed_roles
   python manage.py seed_owasp
   python manage.py seed_owasp_variants
   python manage.py seed_owasp_vulnerabilities
   python manage.py seed_owasp_cve_vulnerabilities
   python manage.py seed_cve_vulnerabilities
   ```
3. [ ] Verify no errors

### Step 5: Test Backend

1. [ ] Visit `https://evidex-backend.onrender.com/api/` in browser
2. [ ] Should see Django REST Framework interface or JSON response
3. [ ] Verify no 500 errors

### Step 6: Deploy Frontend to Netlify (5-10 minutes)

1. [ ] Go to [netlify.com](https://netlify.com)
2. [ ] Sign up with GitHub account
3. [ ] Click "Add new site" → "Import an existing project"
4. [ ] Select your GitHub repository
5. [ ] Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. [ ] Go to "Site settings" → "Build & deploy" → "Environment"
7. [ ] Add environment variable:
   - `VITE_API_URL=https://evidex-backend.onrender.com`
8. [ ] Trigger a deploy or wait for auto-deploy
9. [ ] Note your site URL: `https://your-site.netlify.app`

### Step 7: Update Backend CORS Settings

1. [ ] Go back to Render backend service
2. [ ] Update `CORS_ALLOWED_ORIGINS` environment variable with your actual Netlify URL
3. [ ] Save and redeploy

## ✅ Final Verification

- [ ] Frontend loads at `https://your-site.netlify.app`
- [ ] Login page works
- [ ] Can sign up / login successfully
- [ ] Backend API calls work without CORS errors
- [ ] Database persists data correctly
- [ ] No console errors in browser DevTools

## 🔍 Troubleshooting URLs

- **Render Dashboard**: https://dashboard.render.com
- **Netlify Dashboard**: https://app.netlify.com
- **Check Backend Logs**: Render Dashboard → Service → Logs
- **Check Frontend Logs**: Netlify Dashboard → Site → Deploys

## 💡 Tips

- Both services send **wake-up requests** to inactive free apps (they sleep after 15 mins)
- First request after sleep takes ~30 seconds
- Monitor your deployments regularly
- Keep your `.env` file with actual secrets locally (don't commit to GitHub)

---

**Status**: Ready for deployment! 🚀
