# Hosting Guide for ScreamScore

This guide covers deploying ScreamScore to production. The app currently uses SQLite, which needs to be migrated to PostgreSQL for production hosting.

## 🚀 Recommended Hosting Options

### Option 1: Vercel (Recommended - Easiest for Next.js)

**Pros:**
- Zero-config deployment for Next.js
- Free tier available
- Automatic HTTPS
- Built-in CI/CD
- Edge functions support

**Steps:**

1. **Prepare your database:**
   - Sign up for a free PostgreSQL database at [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
   - Get your database connection string (e.g., `postgresql://user:password@host:5432/dbname`)

2. **Update Prisma schema for PostgreSQL:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

4. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Configure environment variables:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `TMDB_API_KEY` - Your TMDB API key (get from [TMDB](https://www.themoviedb.org/settings/api))
     - `OMDB_API_KEY` - Your OMDB API key (get from [OMDB](http://www.omdbapi.com/apikey.aspx))
   - Click "Deploy"

5. **Run migrations:**
   - After deployment, run migrations via Vercel CLI or add a build script:
   ```json
   "build": "npx prisma generate && npx prisma migrate deploy && next build"
   ```

6. **Seed your database:**
   - Use Vercel's CLI or add a post-deploy script to run your seed

---

### Option 2: Railway

**Pros:**
- Includes PostgreSQL database
- Simple deployment
- Good for full-stack apps

**Steps:**

1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL database service
4. Add Node.js service and connect your GitHub repo
5. Set environment variables:
   - `DATABASE_URL` (auto-provided by Railway)
   - `TMDB_API_KEY`
   - `OMDB_API_KEY`
6. Railway will auto-detect Next.js and deploy

---

### Option 3: Render

**Pros:**
- Free tier available
- PostgreSQL included
- Simple setup

**Steps:**

1. Sign up at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repo
4. Add PostgreSQL database
5. Set environment variables
6. Deploy

---

## 📋 Pre-Deployment Checklist

### 1. Migrate Database Schema

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then create a migration:
```bash
npx prisma migrate dev --name migrate_to_postgresql
```

### 2. Update Environment Variables

Create a `.env.example` file:
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
TMDB_API_KEY="your_tmdb_api_key"
OMDB_API_KEY="your_omdb_api_key"
```

**Important:** Remove hardcoded API keys from your code and use environment variables only.

### 3. Update Build Scripts

Update `package.json`:
```json
{
  "scripts": {
    "build": "npx prisma generate && npx prisma migrate deploy && next build",
    "postinstall": "npx prisma generate"
  }
}
```

### 4. Handle Sync Scripts

Your sync scripts (`sync-new-movies.ts`, `update-imdb-ratings.ts`) need to run periodically. Options:

**Option A: Vercel Cron Jobs** (if using Vercel)
- Add `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/sync",
    "schedule": "0 3 * * 0"
  }]
}
```

**Option B: External Cron Service**
- Use [cron-job.org](https://cron-job.org) or [EasyCron](https://www.easycron.com)
- Set up webhooks to call your sync endpoints

**Option C: GitHub Actions**
- Create `.github/workflows/sync.yml` to run scripts weekly

### 5. Security Considerations

- ✅ Never commit `.env` files
- ✅ Use environment variables for all API keys
- ✅ Enable CORS if needed
- ✅ Set up rate limiting for API routes
- ✅ Use HTTPS (automatic on most platforms)

---

## 🔧 Post-Deployment Steps

1. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

2. **Seed initial data:**
   ```bash
   npm run db:seed
   ```

3. **Set up sync scripts:**
   - Configure cron jobs or webhooks
   - Test sync scripts manually first

4. **Monitor:**
   - Check application logs
   - Monitor database connections
   - Set up error tracking (Sentry, etc.)

---

## 📝 Environment Variables Reference

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DATABASE_URL` | PostgreSQL connection string | Your database provider |
| `TMDB_API_KEY` | TMDB API key | [TMDB Settings](https://www.themoviedb.org/settings/api) |
| `OMDB_API_KEY` | OMDB API key | [OMDB API](http://www.omdbapi.com/apikey.aspx) |

---

## 🐛 Troubleshooting

**Database connection issues:**
- Verify `DATABASE_URL` format
- Check database is accessible from your hosting provider
- Ensure SSL is enabled if required

**Build failures:**
- Check Prisma client generation runs before build
- Verify all environment variables are set
- Check Node.js version compatibility (18+)

**API errors:**
- Verify API keys are correct
- Check API rate limits
- Review API route error logs

---

## 💡 Additional Tips

1. **Database backups:** Set up automatic backups with your database provider
2. **CDN:** Consider using a CDN for static assets (Vercel includes this)
3. **Monitoring:** Set up monitoring with services like Sentry or LogRocket
4. **Analytics:** Add analytics (Google Analytics, Plausible, etc.)
5. **Domain:** Connect a custom domain through your hosting provider

---

## 🚀 Quick Start (Vercel)

```bash
# 1. Update schema
# Edit prisma/schema.prisma to use postgresql

# 2. Push to GitHub
git add .
git commit -m "Prepare for deployment"
git push

# 3. Deploy on Vercel
# - Import from GitHub
# - Add environment variables
# - Deploy!

# 4. Run migrations
npx prisma migrate deploy

# 5. Seed database
npm run db:seed
```

---

Need help? Check the [Next.js deployment docs](https://nextjs.org/docs/deployment) or your hosting provider's documentation.
