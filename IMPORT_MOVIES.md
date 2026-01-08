# Import Movies Script

## Current Status
- ✅ Database tables created (Movie and Rating)
- ✅ 10 sample movies seeded
- ⏳ Waiting for circuit breaker to reset before importing 1110 movies

## To Import All Movies

Once the circuit breaker resets (usually 5-15 minutes), run:

```bash
npx tsx scripts/import-movies.ts
```

This will import all 1110 movies from the `import-movies.ts` script.

**Note:** The import takes approximately 4-5 minutes minimum (with 250ms rate limiting between each movie, plus API calls to TMDB and OMDB).

## Connection String

Make sure your `.env` file has the correct connection string:

```bash
DATABASE_URL="postgresql://postgres.qvgagfllraetmfwhltss:Parrotlover101%28%2A%29@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
```

(Password `Parrotlover101(*)` is URL-encoded as `Parrotlover101%28%2A%29`)

## Alternative: Import in Batches

If you encounter issues, you can modify the script to import in smaller batches by editing `scripts/import-movies.ts` and changing the `moviesToImport` array to only include a subset (e.g., first 100 movies).

## Check Import Progress

After running the import, check your database:

```bash
npx prisma studio
```

Or check in Supabase Dashboard → Table Editor.
