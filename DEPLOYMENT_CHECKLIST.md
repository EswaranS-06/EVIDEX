# 🚀 EVIDEX Deployment Checklist

## Pre-Deployment (Local)

### Backend Setup
- [ ] Python 3.10+ installed
- [ ] All requirements installed: `pip install -r requirements.txt`
- [ ] `.env.production` file created with database credentials
- [ ] `python manage.py migrate` runs successfully
- [ ] `python manage.py seed_*` commands complete successfully
- [ ] `python manage.py collectstatic --noinput` works
- [ ] Local server runs: `python manage.py runserver`
- [ ] No console errors or warnings

### Frontend Setup
- [ ] Node 14+ installed
- [ ] Dependencies installed: `npm install`
- [ ] Build works: `npm run build`
- [ ] Frontend runs: `npm run dev`
- [ ] API URL is set to backend URL
- [ ] No console errors

### Git Setup
- [ ] Repository created on GitHub
- [ ] All files committed: `git add .`
- [ ] Commit message: `git commit -m "Setup: Render and Netlify deployment"`
- [ ] Code pushed to GitHub: `git push origin main`

---

## Backend Deployment (Render)

### 1. Create Web Service
- [ ] Log in to https://dashboard.render.com/
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select `EVIDEX` repository and `main` branch
- [ ] Name: `evidex-backend`
- [ ] Environment: `Python 3`
- [ ] Build Command:
  ```bash
  pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
  ```
- [ ] Start Command:
  ```bash
  gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 60
  ```
- [ ] Plan: `Free` or `Starter`
- [ ] Click "Create Web Service"

### 2. Configure Environment Variables
In Render dashboard → Settings → Environment, add:
- [ ] `DEBUG=False`
- [ ] `SECRET_KEY=<secure-50-char-key>`
- [ ] `ALLOWED_HOSTS=evidex-backend.onrender.com,localhost,127.0.0.1`
- [ ] `POSTGRES_DB=evidex_db`
- [ ] `POSTGRES_USER=evidex_admin`
- [ ] `POSTGRES_PASSWORD=9obldncOifOV8OvYF7dSa3oY8kJVFWxX`
- [ ] `POSTGRES_HOST=dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com`
- [ ] `POSTGRES_PORT=5432`
- [ ] `DATABASE_URL=postgresql://evidex_admin:9obldncOifOV8OvYF7dSa3oY8kJVFWxX@dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com/evidex_db`
- [ ] `CORS_ALLOWED_ORIGINS=https://evidex.netlify.app`
- [ ] `SECURE_SSL_REDIRECT=True`
- [ ] `SESSION_COOKIE_SECURE=True`
- [ ] `CSRF_COOKIE_SECURE=True`

### 3. Initial Setup
In Render Shell, run:
- [ ] `python manage.py migrate`
- [ ] `python manage.py seed_roles`
- [ ] `python manage.py seed_owasp`
- [ ] `python manage.py seed_owasp_variants`
- [ ] `python manage.py seed_owasp_vulnerabilities`
- [ ] `python manage.py seed_owasp_cve_vulnerabilities`
- [ ] `python manage.py seed_cve_vulnerabilities`
- [ ] (Optional) `python manage.py createsuperuser`

### 4. Verify Backend
- [ ] Get backend URL from Render dashboard (e.g., `https://evidex-backend.onrender.com`)
- [ ] Visit `https://evidex-backend.onrender.com/api/` - see API root
- [ ] Visit `https://evidex-backend.onrender.com/admin/` - see login
- [ ] Check Logs tab for any errors
- [ ] Database connection test in Shell: `python manage.py dbshell`

---

## Frontend Deployment (Netlify)

### 1. Deploy to Netlify
- [ ] Log in to https://app.netlify.com/
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Select GitHub and authorize
- [ ] Choose `EVIDEX` repository
- [ ] Select `main` branch
- [ ] Configure:
  - [ ] Base directory: `frontend`
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `dist`
- [ ] Click "Deploy site"
- [ ] Wait for deployment to complete

### 2. Verify Frontend
- [ ] Get Netlify URL (e.g., `https://evidex.netlify.app`)
- [ ] Visit the URL in browser
- [ ] Check console (F12) for any errors
- [ ] Verify API connection works
- [ ] Test login/logout functionality

---

## Connect Frontend & Backend

### 1. Update Backend CORS
- [ ] Go to Render `evidex-backend` service
- [ ] Settings → Environment
- [ ] Update `CORS_ALLOWED_ORIGINS` with your Netlify URL
- [ ] Save (Render will auto-redeploy)

### 2. Verify Communication
- [ ] Open frontend URL in browser
- [ ] Open DevTools → Network tab
- [ ] Try making an API call (login, fetch data, etc.)
- [ ] Verify response status is 200, not CORS error
- [ ] Check console for any warnings

---

## Post-Deployment Verification

### Security ✅
- [ ] `SECRET_KEY` changed to secure value
- [ ] `DEBUG=False` in production
- [ ] `ALLOWED_HOSTS` includes your domain
- [ ] CORS restricted to your domain
- [ ] HTTPS enabled (automatic)
- [ ] No credentials in GitHub

### Functionality ✅
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] Static files load (CSS, JS, images)
- [ ] Login/authentication works
- [ ] Forms submit successfully
- [ ] PDF reports generate
- [ ] File uploads work
- [ ] No 404 errors

### Performance ✅
- [ ] Page load time acceptable
- [ ] No console errors
- [ ] API responses fast
- [ ] Database queries efficient
- [ ] Static files cached properly

### Monitoring ✅
- [ ] Set up error logging (optional: Sentry)
- [ ] Check Render Logs regularly
- [ ] Monitor database performance
- [ ] Set up alerts (optional)

---

## Troubleshooting

### Backend Won't Deploy
```bash
# In Render Shell:
python manage.py migrate
pip install -r requirements.txt
python manage.py collectstatic --noinput
```

### CORS Errors
- [ ] Verify `CORS_ALLOWED_ORIGINS` includes frontend URL
- [ ] Use full URL with https:// and www (if applicable)
- [ ] Restart backend service

### Database Errors
- [ ] Check `DATABASE_URL` environment variable
- [ ] Verify Render PostgreSQL service is running
- [ ] Test in Shell: `python manage.py dbshell`

### Static Files 404
```bash
# In Render Shell:
python manage.py collectstatic --noinput
```

### Module Not Found
- [ ] Update requirements.txt
- [ ] Commit and push
- [ ] Render will rebuild automatically

---

## Useful Links

| Link | Purpose |
|------|---------|
| [https://evidex-backend.onrender.com](https://evidex-backend.onrender.com) | Backend root |
| [https://evidex-backend.onrender.com/admin/](https://evidex-backend.onrender.com/admin/) | Admin panel |
| [https://evidex-backend.onrender.com/api/](https://evidex-backend.onrender.com/api/) | API root |
| [https://evidex.netlify.app](https://evidex.netlify.app) | Frontend |
| [https://dashboard.render.com/](https://dashboard.render.com/) | Render dashboard |
| [https://app.netlify.com/](https://app.netlify.com/) | Netlify dashboard |
| [https://github.com/yourusername/EVIDEX](https://github.com/yourusername/EVIDEX) | GitHub repository |

---

## Final Commands

Before you start, make sure you have:

```bash
# Generate SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Test locally
cd backend
python manage.py runserver

# In another terminal
cd frontend
npm run dev

# Push to GitHub
git add .
git commit -m "Deploy: EVIDEX to Render and Netlify"
git push origin main
```

---

## Success! 🎉

When all checks are complete, your EVIDEX application is live!

- Backend: https://evidex-backend.onrender.com
- Frontend: https://evidex.netlify.app

Monitor logs and performance regularly to ensure smooth operation.

---

**Last Updated**: January 26, 2026
