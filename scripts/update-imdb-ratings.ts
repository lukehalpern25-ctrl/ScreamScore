/**
 * Script to update IMDB ratings from official IMDB datasets
 * Downloads title.ratings.tsv.gz from https://datasets.imdbws.com/
 * and updates our database with the ratings
 */

import { PrismaClient } from "@prisma/client";
import { createReadStream, createWriteStream, unlinkSync, existsSync } from "fs";
import { createGunzip } from "zlib";
import { get } from "https";
import { createInterface } from "readline";
import { pipeline } from "stream/promises";

const prisma = new PrismaClient();

const IMDB_RATINGS_URL = "https://datasets.imdbws.com/title.ratings.tsv.gz";
const DOWNLOAD_PATH = "./title.ratings.tsv.gz";
const EXTRACTED_PATH = "./title.ratings.tsv";

async function downloadFile(url: string, dest: string): Promise<void> {
  console.log(`📥 Downloading IMDB ratings dataset...`);
  console.log(`   URL: ${url}`);
  
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    
    get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          unlinkSync(dest);
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      const totalSize = parseInt(response.headers['content-length'] || '0', 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize > 0) {
          const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r   Progress: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(2)} MB)`);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n   ✅ Download complete');
        resolve();
      });
    }).on('error', (err) => {
      unlinkSync(dest);
      reject(err);
    });
  });
}

async function extractGzip(src: string, dest: string): Promise<void> {
  console.log(`📦 Extracting gzip file...`);
  
  const source = createReadStream(src);
  const destination = createWriteStream(dest);
  const gunzip = createGunzip();
  
  await pipeline(source, gunzip, destination);
  console.log(`   ✅ Extraction complete`);
}

async function parseAndUpdateRatings(): Promise<{ updated: number; skipped: number; notFound: number }> {
  console.log(`\n🔍 Fetching movies from database that need ratings...`);
  
  // Get all movies with IMDB IDs
  const movies = await prisma.movie.findMany({
    where: {
      imdbId: { not: null },
    },
    select: {
      id: true,
      title: true,
      imdbId: true,
      imdbRating: true,
    },
  });
  
  console.log(`   Found ${movies.length} movies with IMDB IDs`);
  
  // Create a map of imdbId -> movie for quick lookup
  const movieMap = new Map<string, { id: string; title: string; imdbRating: number | null }>();
  for (const movie of movies) {
    if (movie.imdbId) {
      movieMap.set(movie.imdbId, {
        id: movie.id,
        title: movie.title,
        imdbRating: movie.imdbRating,
      });
    }
  }
  
  console.log(`\n📊 Parsing IMDB ratings file...`);
  
  const fileStream = createReadStream(EXTRACTED_PATH);
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  
  let lineCount = 0;
  let updated = 0;
  let skipped = 0;
  let notFound = 0;
  const updates: { id: string; title: string; rating: number; votes: number }[] = [];
  
  for await (const line of rl) {
    lineCount++;
    
    // Skip header line
    if (lineCount === 1) continue;
    
    // Parse TSV: tconst, averageRating, numVotes
    const [imdbId, ratingStr, votesStr] = line.split('\t');
    
    const movie = movieMap.get(imdbId);
    if (movie) {
      const rating = parseFloat(ratingStr);
      const votes = parseInt(votesStr, 10);
      
      if (!isNaN(rating) && rating > 0) {
        // Only update if rating is missing or different
        if (movie.imdbRating === null || Math.abs(movie.imdbRating - rating) > 0.01) {
          updates.push({ id: movie.id, title: movie.title, rating, votes });
        } else {
          skipped++;
        }
      }
      
      // Remove from map so we can track what wasn't found
      movieMap.delete(imdbId);
    }
    
    // Progress indicator every 500k lines
    if (lineCount % 500000 === 0) {
      process.stdout.write(`\r   Processed ${(lineCount / 1000000).toFixed(1)}M lines...`);
    }
  }
  
  console.log(`\r   ✅ Processed ${lineCount.toLocaleString()} lines`);
  
  // Count movies that weren't in the IMDB dataset
  notFound = movieMap.size;
  
  // Apply updates in batches
  if (updates.length > 0) {
    console.log(`\n💾 Updating ${updates.length} movies with new ratings...`);
    
    for (let i = 0; i < updates.length; i++) {
      const { id, title, rating, votes } = updates[i];
      
      await prisma.movie.update({
        where: { id },
        data: {
          imdbRating: rating,
          imdbVotes: votes,
        },
      });
      
      updated++;
      
      if ((i + 1) % 50 === 0 || i === updates.length - 1) {
        process.stdout.write(`\r   Updated ${i + 1}/${updates.length} movies`);
      }
    }
    
    console.log('\n');
  }
  
  return { updated, skipped, notFound };
}

async function cleanup(): Promise<void> {
  console.log(`🧹 Cleaning up temporary files...`);
  
  if (existsSync(DOWNLOAD_PATH)) {
    unlinkSync(DOWNLOAD_PATH);
  }
  if (existsSync(EXTRACTED_PATH)) {
    unlinkSync(EXTRACTED_PATH);
  }
  
  console.log(`   ✅ Cleanup complete`);
}

async function main(): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  IMDB Ratings Updater`);
  console.log(`  Using official IMDB datasets`);
  console.log(`${"=".repeat(60)}\n`);
  
  try {
    // Step 1: Download the ratings file
    await downloadFile(IMDB_RATINGS_URL, DOWNLOAD_PATH);
    
    // Step 2: Extract the gzip file
    await extractGzip(DOWNLOAD_PATH, EXTRACTED_PATH);
    
    // Step 3: Parse and update ratings
    const results = await parseAndUpdateRatings();
    
    // Step 4: Cleanup
    await cleanup();
    
    // Summary
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  ✅ Update Complete!`);
    console.log(`${"=".repeat(60)}`);
    console.log(`  📊 Results:`);
    console.log(`     - Updated: ${results.updated} movies`);
    console.log(`     - Already up-to-date: ${results.skipped} movies`);
    console.log(`     - Not in IMDB dataset: ${results.notFound} movies`);
    console.log(`${"=".repeat(60)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Error:`, error);
    await cleanup();
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
