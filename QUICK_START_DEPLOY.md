# 🎯 EVIDEX Quick Start - Render & Netlify Deployment

> **TL;DR** - Deploy EVIDEX in 30 minutes!

---

## What You Have

✅ **Backend**: Django REST API ready for Render  
✅ **Frontend**: React + Vite ready for Netlify  
✅ **Database**: PostgreSQL 15 connection ready  
✅ **Configuration**: All environment files created  

---

## 📋 5-Step Deployment Process

### STEP 1️⃣ - Generate Secret Key (2 min)

```bash
cd backend
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output. You'll need this for Render.

### STEP 2️⃣ - Push to GitHub (3 min)

```bash
cd /home/rex/Projects/EVIDEX

# Make sure git is initialized
git init

# Add all files
git add .

# Commit
git commit -m "Setup: EVIDEX Render & Netlify deployment"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/EVIDEX.git
git branch -M main
git push -u origin main
```

### STEP 3️⃣ - Deploy Backend to Render (10 min)

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub `EVIDEX` repository
4. Fill in:
   - Name: `evidex-backend`
   - Build: `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
   - Start: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 60`
5. Click **"Create Web Service"**
6. While it builds, go to **Settings** → **Environment** and add these variables:

```
DEBUG=False
SECRET_KEY=<paste-the-key-you-generated>
ALLOWED_HOSTS=evidex-backend.onrender.com,localhost,127.0.0.1
DATABASE_URL=postgresql://evidex_admin:9obldncOifOV8OvYF7dSa3oY8kJVFWxX@dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com/evidex_db
CORS_ALLOWED_ORIGINS=https://evidex.netlify.app
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

7. Click **"Shell"** and run:
```bash
python manage.py migrate
python manage.py seed_roles
python manage.py seed_owasp
python manage.py seed_owasp_variants
python manage.py seed_owasp_vulnerabilities
python manage.py seed_owasp_cve_vulnerabilities
python manage.py seed_cve_vulnerabilities
```

### STEP 4️⃣ - Deploy Frontend to Netlify (10 min)

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize
4. Select your `EVIDEX` repository
5. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **"Deploy site"** and wait

### STEP 5️⃣ - Connect Them (2 min)

1. Get your Netlify URL (shown after deployment)
2. Go back to Render backend service
3. Settings → Environment
4. Update `CORS_ALLOWED_ORIGINS` with your Netlify URL (with https://)
5. Save (Render auto-redeploys)

---

## ✅ Verify It Works

### Test Backend
- Visit: https://evidex-backend.onrender.com/api/
- You should see the API root page ✓

### Test Frontend
- Visit: https://evidex.netlify.app
- Try logging in ✓
- Check browser console - no CORS errors ✓

### Test Connection
- From frontend, make an API call
- Network tab should show 200 response ✓

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `backend/config/settings.py` | Production Django settings |
| `backend/.env.production` | Environment variables template |
| `backend/requirements.txt` | Updated with `dj-database-url` |
| `backend/render.yaml` | Render infrastructure config |
| `backend/Procfile` | Deployment script |
| `backend/setup_render.sh` | Automated setup script |
| `frontend/netlify.toml` | Netlify configuration |
| `RENDER_NETLIFY_SETUP.md` | Full deployment guide |
| `RENDER_BACKEND_SETUP.md` | Backend-specific guide |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |
| `BACKEND_SETUP_SUMMARY.md` | Changes summary |

---

## 🔗 Your Live URLs (After Deployment)

```
Backend:   https://evidex-backend.onrender.com
Admin:     https://evidex-backend.onrender.com/admin/
Docs:      https://evidex-backend.onrender.com/api/schema/swagger/
Frontend:  https://evidex.netlify.app
```

---

## 🆘 Troubleshooting

### "CORS error"
→ Update `CORS_ALLOWED_ORIGINS` on Render with your Netlify URL

### "Can't connect to database"
→ Verify `DATABASE_URL` in Render environment variables

### "Static files 404"
→ In Render Shell: `python manage.py collectstatic --noinput`

### "API returns 404"
→ Verify frontend `VITE_API_URL` is set correctly in netlify.toml

---

## 📚 Full Documentation

For detailed information, see:

- **[RENDER_NETLIFY_SETUP.md](./RENDER_NETLIFY_SETUP.md)** - Complete guide with screenshots steps
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Detailed checklist
- **[BACKEND_SETUP_SUMMARY.md](./BACKEND_SETUP_SUMMARY.md)** - What changed and why
- **[backend/RENDER_BACKEND_SETUP.md](./backend/RENDER_BACKEND_SETUP.md)** - Backend specifics

---

## 🔐 Important Security Notes

⚠️ **Before deploying:**
- [ ] Change `SECRET_KEY` to a unique 50+ character string
- [ ] Use strong database password (already set)
- [ ] Set `DEBUG=False` (already set)
- [ ] Use `https://` in all URLs
- [ ] Don't commit `.env` or secrets to GitHub

---

## 📊 Database Info (Your Render PostgreSQL)

```
Host:     dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com
Port:     5432
Database: evidex_db
User:     evidex_admin
Password: 9obldncOifOV8OvYF7dSa3oY8kJVFWxX
```

This is already configured in `.env.production` and environment variables.

---

## ⏱️ Estimated Time

| Step | Time |
|------|------|
| Generate SECRET_KEY | 2 min |
| Push to GitHub | 3 min |
| Deploy Backend | 10 min |
| Deploy Frontend | 10 min |
| Connect & Test | 5 min |
| **TOTAL** | **~30 min** |

---

## 🎉 You're Done!

After these 5 steps, your EVIDEX application will be:

✅ Live on Render (backend)  
✅ Live on Netlify (frontend)  
✅ Database configured  
✅ API working  
✅ Frontend connected  
✅ HTTPS enabled  
✅ Ready for users  

---

## 📞 Need Help?

1. Check browser console (F12) for errors
2. Check Render Logs for backend errors
3. Check Netlify Logs for frontend errors
4. See [RENDER_NETLIFY_SETUP.md](./RENDER_NETLIFY_SETUP.md) for detailed troubleshooting
5. Verify environment variables on Render

---

**Status**: ✅ Ready to Deploy!

Start with STEP 1️⃣ and you'll be live in 30 minutes! 🚀
