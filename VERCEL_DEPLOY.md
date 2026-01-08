# Deploy ScreamScore to Vercel

Super simple deployment guide for Vercel!

## 🚀 Quick Steps

### 1. Get Free PostgreSQL Database

Choose one (both are free):

**Option A: Neon (Recommended)**
1. Go to [neon.tech](https://neon.tech)
2. Sign up (free)
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@host/dbname`)

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com)
2. Sign up (free)
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click **"Add New Project"**
4. Import your ScreamScore repository
5. Vercel auto-detects Next.js - click **"Deploy"**

### 3. Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

```
DATABASE_URL=postgresql://user:pass@host/dbname
TMDB_API_KEY=your_tmdb_api_key
OMDB_API_KEY=your_omdb_api_key
```

**Get API Keys:**
- **TMDB**: [TMDB Settings](https://www.themoviedb.org/settings/api)
- **OMDB**: [OMDB API](http://www.omdbapi.com/apikey.aspx)

### 4. Run Database Migrations

After first deployment:

1. Go to your Vercel project
2. Click **"Deployments"** tab
3. Click the three dots on latest deployment → **"Redeploy"**
4. Or use Vercel CLI:
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   npx prisma migrate deploy
   ```

**Or use Vercel's Post-Deploy Hook:**

Add to `package.json`:
```json
"scripts": {
  "vercel-build": "npx prisma generate && npx prisma migrate deploy && next build"
}
```

### 5. Seed Database (Optional)

Run locally with your DATABASE_URL:
```bash
DATABASE_URL="your_postgres_url" npm run db:seed
```

Or use Vercel CLI:
```bash
vercel env pull .env.local
npx prisma migrate deploy
npm run db:seed
```

---

## ✅ That's It!

Your app will be live at: `https://your-app.vercel.app`

Vercel automatically:
- ✅ Deploys on every git push
- ✅ Provides HTTPS
- ✅ Handles scaling
- ✅ Free tier is generous!

---

## 🔧 Troubleshooting

**Build fails:**
- Make sure all env variables are set
- Check that DATABASE_URL is correct

**Database connection errors:**
- Verify DATABASE_URL format
- Check database allows connections (some require IP whitelist)
- Neon/Supabase usually work out of the box

**Need help?** Check [Vercel Docs](https://vercel.com/docs)
