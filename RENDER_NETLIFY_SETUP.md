# EVIDEX - Complete Render & Netlify Deployment Guide

## 📋 Quick Summary

**Backend**: Django REST API deployed on **Render** with PostgreSQL database  
**Frontend**: React + Vite deployed on **Netlify**  
**Database**: PostgreSQL 15 on **Render**

---

## Part 1: Backend Deployment (Render)

### Step 1.1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   cd /home/rex/Projects/EVIDEX
   git init
   git add .
   git commit -m "Initial commit: EVIDEX backend and frontend"
   ```
vv
2. **Push to GitHub**:
   - Create a repository on GitHub: `https://github.com/yourusername/EVIDEX`
   - Push your code:
     ```bash
     git remote add origin https://github.com/yourusername/EVIDEX.git
     git branch -M main
     git push -u origin main
     ```

### Step 1.2: Create Render Web Service

1. **Log in to Render Dashboard**: https://dashboard.render.com/

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**:
   - Select "GitHub" as the provider
   - Authorize and select `EVIDEX` repository
   - Select the `main` branch

4. **Configure the Web Service**:
   
   | Setting | Value |
   |---------|-------|
   | **Name** | `evidex-backend` |
   | **Environment** | `Python 3` |
   | **Build Command** | `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput` |
   | **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 60` |
   | **Instance Type** | `Free` (development) or `Starter` (production) |
   | **Region** | Choose closest to your location |

5. **Click "Create Web Service"** and wait for deployment

### Step 1.3: Configure Environment Variables on Render

After the service is created, go to **Settings** → **Environment** and add these variables:

```
DEBUG=False
SECRET_KEY=your-super-secure-secret-key-here-minimum-50-chars
ALLOWED_HOSTS=evidex-backend.onrender.com,localhost,127.0.0.1

# Database Configuration (from your Render PostgreSQL)
POSTGRES_DB=evidex_db
POSTGRES_USER=evidex_admin
POSTGRES_PASSWORD=9obldncOifOV8OvYF7dSa3oY8kJVFWxX
POSTGRES_HOST=dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com
POSTGRES_PORT=5432
DATABASE_URL=postgresql://evidex_admin:9obldncOifOV8OvYF7dSa3oY8kJVFWxX@dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com/evidex_db

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://evidex.netlify.app

# Security (for production)
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Step 1.4: Run Database Migrations

1. Go to your service page
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

4. **Create a superuser** (optional, for admin access):
   ```bash
   python manage.py createsuperuser
   ```

### Step 1.5: Verify Backend Deployment

1. **Get your backend URL**: Check the service page, it should be like:
   ```
   https://evidex-backend.onrender.com
   ```

2. **Test the API**:
   - Visit: `https://evidex-backend.onrender.com/api/`
   - You should see the DRF API root page

3. **Check admin panel**:
   - Visit: `https://evidex-backend.onrender.com/admin/`

4. **View logs** if there are issues:
   - Click **"Logs"** tab in your service to debug

---

## Part 2: Frontend Deployment (Netlify)

### Step 2.1: Configure Frontend Environment

The frontend is already configured to use environment variables. The Netlify configuration is set up in `frontend/netlify.toml`.

**Current configuration**:
```toml
VITE_API_URL = "https://evidex-backend.onrender.com"
```

This means your frontend will connect to your Render backend automatically.

### Step 2.2: Deploy to Netlify

1. **Log in to Netlify**: https://app.netlify.com/

2. **Click "Add new site" → "Import an existing project"**

3. **Select GitHub** and authorize

4. **Choose your repository**:
   - Organization: Select your GitHub org
   - Repository: Select `EVIDEX`
   - Branch: Select `main`

5. **Configure build settings**:
   
   | Setting | Value |
   |---------|-------|
   | **Base directory** | `frontend` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `dist` |

6. **Click "Deploy site"** and wait for completion

### Step 2.3: Set Environment Variables on Netlify (Optional)

If you want to override the API URL:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add:
   ```
   VITE_API_URL=https://evidex-backend.onrender.com
   ```

### Step 2.4: Verify Frontend Deployment

1. **Get your frontend URL**: Netlify will assign a URL like:
   ```
   https://evidex.netlify.app
   ```

2. **Visit your site**: Open the URL in a browser

3. **Test API connection**:
   - Try logging in or making API calls
   - Open browser DevTools (F12) → Console
   - Check for any CORS or connection errors

---

## Part 3: Connecting Frontend & Backend

### Step 3.1: Update Backend CORS Settings

After getting your Netlify URL, update your backend environment variables on Render:

1. **Go to Render Dashboard** → Your `evidex-backend` service

2. **Settings** → **Environment**

3. **Update or add**:
   ```
   CORS_ALLOWED_ORIGINS=https://evidex.netlify.app
   ```

4. **Click "Save"** - Render will auto-redeploy with new settings

### Step 3.2: Test Communication

1. **Open your frontend**: `https://evidex.netlify.app`

2. **Try a protected endpoint**:
   - Go to login page
   - Enter test credentials
   - Open DevTools → Network tab
   - Check that API requests are successful (status 200-299)

3. **Debug CORS issues** (if any):
   - Check browser console for CORS errors
   - Verify backend `CORS_ALLOWED_ORIGINS` includes your frontend URL
   - Restart backend service if settings were changed

---

## Part 4: Post-Deployment Checklist

### Security Checklist
- [ ] Change `SECRET_KEY` to a random 50+ character string
- [ ] Set `DEBUG=False` in production
- [ ] Enable HTTPS (automatic on Render & Netlify)
- [ ] Configure proper CORS origins
- [ ] Set up firewall rules (if needed)

### Testing Checklist
- [ ] Test login/logout functionality
- [ ] Test API endpoints from frontend
- [ ] Verify database operations work
- [ ] Check static files load correctly
- [ ] Test PDF report generation
- [ ] Monitor performance

### Monitoring Checklist
- [ ] Set up error logging (e.g., Sentry)
- [ ] Monitor database performance
- [ ] Check Render service logs regularly
- [ ] Set up alerts for downtime

---

## Part 5: Troubleshooting

### Backend Issues

**Error: "ModuleNotFoundError: No module named..."**
- Solution: Check requirements.txt is up to date
- Run in backend Shell: `pip install -r requirements.txt`

**Error: "CORS policy: No 'Access-Control-Allow-Origin' header"**
- Solution: Update `CORS_ALLOWED_ORIGINS` in Render environment variables
- Include your full Netlify URL with https://
- Save and Render will auto-redeploy

**Error: "Database connection refused"**
- Solution: Verify DATABASE_URL in environment variables
- Check Render PostgreSQL service is running
- Test connection in Shell: `python manage.py dbshell`

**Error: "Static files not found (404)"**
- Solution: Run in Shell: `python manage.py collectstatic --noinput`
- Verify `STATIC_ROOT` is set correctly in settings.py

### Frontend Issues

**API calls return 404 or timeout**
- Check backend service is running on Render
- Verify `VITE_API_URL` in netlify.toml or environment variables
- Check browser console for actual error messages

**Build fails on Netlify**
- Check `npm run build` works locally
- Verify package.json has correct scripts
- Check Netlify build logs for specific errors
- Ensure Node version is compatible (14+)

**Styles or assets not loading**
- Clear browser cache (Ctrl+Shift+Del)
- Check Netlify deployment status
- Verify vite.config.js is correct

---

## Part 6: Environment Variables Reference

### Backend (.env.production)

```env
# Django Security
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=evidex-backend.onrender.com,localhost

# Database (Render PostgreSQL)
POSTGRES_DB=evidex_db
POSTGRES_USER=evidex_admin
POSTGRES_PASSWORD=9obldncOifOV8OvYF7dSa3oY8kJVFWxX
POSTGRES_HOST=dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com
POSTGRES_PORT=5432
DATABASE_URL=postgresql://evidex_admin:9obldncOifOV8OvYF7dSa3oY8kJVFWxX@dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com/evidex_db

# CORS & CSRF
CORS_ALLOWED_ORIGINS=https://evidex.netlify.app
FRONTEND_URL=https://evidex.netlify.app

# SSL/Security (for production)
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Frontend (netlify.toml)

```toml
[env.production]
  [env.production.context.environment]
    VITE_API_URL = "https://evidex-backend.onrender.com"

[env.development]
  [env.development.context.environment]
    VITE_API_URL = "http://localhost:8000"
```

---

## Part 7: Custom Domain Setup (Optional)

### For Backend (Render)

1. Go to your `evidex-backend` service
2. Click **Settings** → **Custom Domain**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow DNS configuration instructions
5. Update environment variables with new domain

### For Frontend (Netlify)

1. Go to your site settings
2. Click **Domain management**
3. Add custom domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions
5. Update backend CORS to include new domain

---

## Part 8: Useful Commands

### Render Shell Commands
```bash
# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# View database
python manage.py dbshell

# Seed data
python manage.py seed_roles
python manage.py seed_owasp
```

### Local Development
```bash
# Backend
cd backend
uv sync
python manage.py runserver

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

---

## Deployment URLs

After successful deployment:

- **Backend API**: `https://evidex-backend.onrender.com/api/`
- **Backend Admin**: `https://evidex-backend.onrender.com/admin/`
- **Frontend**: `https://evidex.netlify.app`
- **API Documentation**: `https://evidex-backend.onrender.com/api/schema/swagger/`

---

## Support & Resources

- [Render Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [Django Deployment Guide](https://docs.djangoproject.com/en/5.2/howto/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

**Deployment completed!** 🚀

Your EVIDEX application is now live and ready for use. Make sure to monitor logs and performance regularly.
