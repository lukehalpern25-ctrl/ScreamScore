# Deploy ScreamScore to Railway

Quick guide to deploy your app to Railway (keeps SQLite, no migration needed!)

## 🚀 Quick Steps

### 1. Prepare Your Code

Make sure your code is on GitHub:
```bash
git init
git add .
git commit -m "Ready for Railway deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign up (free tier available)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your ScreamScore repository
5. Railway will auto-detect Next.js and start deploying

### 3. Add Environment Variables

In your Railway project dashboard:

1. Go to your service → **Variables** tab
2. Add these environment variables:

```
TMDB_API_KEY=your_tmdb_api_key_here
OMDB_API_KEY=your_omdb_api_key_here
```

**To get API keys:**
- **TMDB**: Go to [TMDB Settings](https://www.themoviedb.org/settings/api) and create an API key
- **OMDB**: Go to [OMDB API](http://www.omdbapi.com/apikey.aspx) and get a free API key

### 4. Configure Build Settings

Railway should auto-detect, but verify:

**Build Command:**
```bash
npm install && npx prisma generate
```

**Start Command:**
```bash
npm start
```

### 5. Run Database Setup

After first deployment, you need to set up your database:

1. Go to your Railway service
2. Click **"Deployments"** → **"View Logs"**
3. Click the **"Shell"** button (or use Railway CLI)

Run these commands:
```bash
# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npm run db:seed
```

### 6. Get Your URL

Railway will give you a URL like: `https://screamscore-production.up.railway.app`

You can also add a custom domain in the **Settings** tab.

---

## 🔄 Setting Up Sync Scripts (Optional)

Your weekly sync scripts need to run periodically. Options:

### Option A: Railway Cron Jobs

1. In Railway, go to your project
2. Add a new service → **"Cron Job"**
3. Set schedule: `0 3 * * 0` (every Sunday at 3am)
4. Command: `npx tsx scripts/daily-sync.ts`

### Option B: External Cron Service

Use [cron-job.org](https://cron-job.org) to call your sync endpoint:
- Create a webhook endpoint in your app
- Set cron to call it weekly

### Option C: Manual (Simplest for now)

Just run the sync scripts manually when needed:
```bash
npx tsx scripts/sync-new-movies.ts
npx tsx scripts/update-imdb-ratings.ts
```

---

## 📝 Important Notes

1. **Database Persistence**: Railway provides persistent storage, so your SQLite database will persist between deployments.

2. **Environment Variables**: Never commit your `.env` file. Railway handles this automatically.

3. **Logs**: Check Railway logs if something goes wrong - they're very helpful!

4. **Free Tier Limits**: 
   - 500 hours/month free
   - $5 credit monthly
   - Should be plenty for personal use!

---

## 🐛 Troubleshooting

**Build fails:**
- Check that all dependencies are in `package.json`
- Verify Node.js version (Railway uses 18+ by default)

**Database errors:**
- Make sure you ran `npx prisma migrate deploy` after first deployment
- Check that `DATABASE_URL` isn't set (Railway handles SQLite automatically)

**API errors:**
- Verify your API keys are set correctly in Railway variables
- Check Railway logs for specific error messages

---

## ✅ You're Done!

Your app should now be live! Share the Railway URL with your friends.

Need help? Check [Railway Docs](https://docs.railway.app) or their Discord community.
