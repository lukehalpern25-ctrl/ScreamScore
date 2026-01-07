/**
 * Script to backfill release dates for existing movies
 * Fetches release dates from TMDB for all movies that have tmdbId but no releaseDate
 */

import { PrismaClient } from "@prisma/client";
import { getMovieDetails } from "../lib/tmdb";

const prisma = new PrismaClient();

async function backfillReleaseDates(): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Release Date Backfill`);
  console.log(`  Updating movies with release dates from TMDB`);
  console.log(`${"=".repeat(60)}\n`);

  // Get all movies with TMDB IDs but no release date
  const movies = await prisma.movie.findMany({
    where: {
      tmdbId: { not: null },
      releaseDate: null,
    },
    select: {
      id: true,
      title: true,
      tmdbId: true,
      year: true,
    },
  });

  console.log(`📊 Found ${movies.length} movies to update\n`);

  if (movies.length === 0) {
    console.log("✅ All movies already have release dates!");
    return;
  }

  const stats = {
    updated: 0,
    failed: 0,
    skipped: 0,
  };

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const progress = `[${i + 1}/${movies.length}]`;

    if (!movie.tmdbId) {
      stats.skipped++;
      continue;
    }

    try {
      // Fetch movie details from TMDB
      const details = await getMovieDetails(movie.tmdbId);

      if (details.release_date) {
        const releaseDate = new Date(details.release_date);
        
        // Also update year if it's missing or different
        const year = parseInt(details.release_date.split('-')[0]);
        const updateData: { releaseDate: Date; year?: number } = {
          releaseDate,
        };

        if (!movie.year || movie.year !== year) {
          updateData.year = year;
        }

        await prisma.movie.update({
          where: { id: movie.id },
          data: updateData,
        });

        stats.updated++;
        console.log(`✅ ${progress} ${movie.title} → ${details.release_date}`);
      } else {
        stats.skipped++;
        console.log(`⏭️  ${progress} ${movie.title} - No release date in TMDB`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      stats.failed++;
      console.log(`❌ ${progress} ${movie.title} - Error: ${error}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ✅ Backfill Complete!`);
  console.log(`${"=".repeat(60)}`);
  console.log(`  📊 Results:`);
  console.log(`     - Updated: ${stats.updated} movies`);
  console.log(`     - Skipped: ${stats.skipped} movies`);
  console.log(`     - Failed: ${stats.failed} movies`);
  console.log(`${"=".repeat(60)}\n`);
}

async function main() {
  try {
    await backfillReleaseDates();
  } catch (error) {
    console.error(`\n❌ Error:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
