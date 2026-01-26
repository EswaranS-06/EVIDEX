# EVIDEX Deployment Documentation Index

> 📚 Complete guide for deploying EVIDEX to Render (backend) and Netlify (frontend)

---

## 🚀 Start Here

### Choose Your Path:

#### ⚡ **I'm in a hurry!** (30 minutes)
👉 Read: [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)
- 5-step deployment process
- Quick reference only
- Get live in 30 minutes

#### 📖 **I want all the details** (1-2 hours)
👉 Read: [RENDER_NETLIFY_SETUP.md](./RENDER_NETLIFY_SETUP.md)
- Complete step-by-step guide
- Troubleshooting section
- Security checklist
- Environment variables reference

#### ☑️ **I need a checklist** (as I go)
👉 Use: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- Pre-deployment checks
- During deployment steps
- Post-deployment verification
- Troubleshooting reference

---

## 📚 Documentation Files

### Root Level (Project)

| File | Best For | Time |
|------|----------|------|
| **[QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)** | Fast deployment | 5 min read |
| **[RENDER_NETLIFY_SETUP.md](./RENDER_NETLIFY_SETUP.md)** | Complete guide | 30 min read |
| **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** | During deployment | Reference |
| **[BACKEND_SETUP_SUMMARY.md](./BACKEND_SETUP_SUMMARY.md)** | What changed | 10 min read |

### Backend Folder

| File | Content |
|------|---------|
| **[backend/RENDER_BACKEND_SETUP.md](./backend/RENDER_BACKEND_SETUP.md)** | Backend-specific setup & troubleshooting |
| **[backend/.env.production](./backend/.env.production)** | Production environment template |
| **[backend/render.yaml](./backend/render.yaml)** | Render infrastructure config |
| **[backend/setup_render.sh](./backend/setup_render.sh)** | Automated setup script |

---

## 🎯 Quick Navigation

### I want to...

**Deploy the backend**
→ [RENDER_NETLIFY_SETUP.md - Part 1](./RENDER_NETLIFY_SETUP.md#part-1-backend-deployment-render)

**Deploy the frontend**
→ [RENDER_NETLIFY_SETUP.md - Part 2](./RENDER_NETLIFY_SETUP.md#part-2-frontend-deployment-netlify)

**Configure environment variables**
→ [RENDER_NETLIFY_SETUP.md - Part 6](./RENDER_NETLIFY_SETUP.md#part-6-environment-variables-reference)

**Fix CORS errors**
→ [RENDER_NETLIFY_SETUP.md - Troubleshooting](./RENDER_NETLIFY_SETUP.md#troubleshooting)

**Set up a custom domain**
→ [RENDER_NETLIFY_SETUP.md - Part 7](./RENDER_NETLIFY_SETUP.md#part-7-custom-domain-setup-optional)

**Understand what changed**
→ [BACKEND_SETUP_SUMMARY.md](./BACKEND_SETUP_SUMMARY.md)

**Follow a checklist**
→ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────┐
│         Your Application                │
└─────────────┬───────────────────────────┘
              │
       ┌──────┴──────┐
       │             │
   FRONTEND      BACKEND
       │             │
  Netlify        Render
       │             │
  React+Vite   Django REST
       │             │
  https://      https://
  evidex.      evidex-backend.
  netlify.app  onrender.com
       │             │
       └──────┬──────┘
              │
         PostgreSQL
         (Render)
```

---

## 🔑 Key Information

### Database (Your Render PostgreSQL)
```
Host: dpg-d5r4jb95pdvs739hdsvg-a.ohio-postgres.render.com
Port: 5432
Database: evidex_db
User: evidex_admin
Password: 9obldncOifOV8OvYF7dSa3oY8kJVFWxX
```

### Frontend URL (Netlify)
```
https://evidex.netlify.app
```

### Backend URL (Render)
```
https://evidex-backend.onrender.com
API: https://evidex-backend.onrender.com/api/
Admin: https://evidex-backend.onrender.com/admin/
Docs: https://evidex-backend.onrender.com/api/schema/swagger/
```

---

## 📋 Pre-Deployment Checklist

- [ ] GitHub account with EVIDEX repository
- [ ] Render account (free tier OK)
- [ ] Netlify account (free tier OK)
- [ ] `SECRET_KEY` generated (50+ chars)
- [ ] Database credentials noted (provided above)
- [ ] All files pushed to GitHub

---

## 🔐 Security Reminders

Before going live:

- [ ] Change `SECRET_KEY` to unique random value
- [ ] Set `DEBUG=False` (already configured)
- [ ] Use `https://` everywhere (automatic)
- [ ] Restrict CORS to your domain (configured)
- [ ] Use strong database password (already set)
- [ ] Don't commit credentials to GitHub
- [ ] Enable HTTPS (automatic on Render & Netlify)

---

## ⏱️ Timeline

| Task | Estimated Time |
|------|----------------|
| Read this index | 2 min |
| Read QUICK_START_DEPLOY.md | 5 min |
| Generate SECRET_KEY | 2 min |
| Push to GitHub | 3 min |
| Deploy backend to Render | 10 min |
| Deploy frontend to Netlify | 10 min |
| Verify & test | 5 min |
| **TOTAL** | **~37 minutes** |

---

## 🆘 Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| CORS Error | [Troubleshooting](./RENDER_NETLIFY_SETUP.md#troubleshooting) |
| Database Error | [Database Issues](./RENDER_NETLIFY_SETUP.md#database-issues) |
| Build Fails | [Build Issues](./RENDER_NETLIFY_SETUP.md#troubleshooting) |
| Static Files 404 | [Backend Issues](./RENDER_NETLIFY_SETUP.md#backend-issues) |

---

## 📞 Support Resources

- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Django Documentation](https://docs.djangoproject.com/en/5.2/)
- [Vite Documentation](https://vitejs.dev/)

---

## 📝 Files Modified

### Backend
- `backend/config/settings.py` - ✅ Production ready
- `backend/requirements.txt` - ✅ Added dj-database-url
- `backend/Procfile` - ✅ Updated for Render
- `backend/.env.production` - ✅ Created
- `backend/render.yaml` - ✅ Created
- `backend/setup_render.sh` - ✅ Created

### Frontend
- `frontend/netlify.toml` - ✅ Updated with API URL

---

## 🎬 Getting Started

### Option 1: Fast Track (30 min)
1. Read [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)
2. Follow the 5 steps
3. Your app is live!

### Option 2: Thorough Track (1-2 hours)
1. Read [RENDER_NETLIFY_SETUP.md](./RENDER_NETLIFY_SETUP.md)
2. Follow Part 1 (Backend)
3. Follow Part 2 (Frontend)
4. Follow Part 3 (Connection)
5. Complete Part 4-8 (Verification & Setup)

### Option 3: Step-by-Step (As you go)
1. Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
2. Check off each step
3. Troubleshoot as needed

---

## ✨ What's Ready for Deployment

| Component | Status | Details |
|-----------|--------|---------|
| Django Backend | ✅ | Production settings configured |
| Database | ✅ | PostgreSQL 15 ready to use |
| Environment | ✅ | All variables configured |
| CORS | ✅ | Netlify URL pre-configured |
| Security | ✅ | HTTPS, HSTS, SSL redirect enabled |
| Static Files | ✅ | WhiteNoise configured |
| Frontend | ✅ | API URL configured |
| Git | ⚠️ | Push your changes to GitHub |

---

## 🎯 Next Step

👉 **Choose your path above and get started!**

---

## 📞 Questions?

Refer to the appropriate documentation file for your question:

- **Quick overview** → [QUICK_START_DEPLOY.md](./QUICK_START_DEPLOY.md)
- **Detailed steps** → [RENDER_NETLIFY_SETUP.md](./RENDER_NETLIFY_SETUP.md)
- **Specific issues** → [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Backend details** → [backend/RENDER_BACKEND_SETUP.md](./backend/RENDER_BACKEND_SETUP.md)
- **What changed** → [BACKEND_SETUP_SUMMARY.md](./BACKEND_SETUP_SUMMARY.md)

---

**Status**: 🟢 Ready for Deployment

**Created**: January 26, 2026
