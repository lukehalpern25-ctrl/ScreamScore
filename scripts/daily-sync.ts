/**
 * Weekly Sync Script
 * Combines:
 * 1. Syncing new horror movies from TMDB
 * 2. Updating IMDB ratings from official dataset
 * 
 * Run manually: npx tsx scripts/daily-sync.ts
 * 
 * Schedule with cron (weekly on Sundays at 3am):
 * 0 3 * * 0 cd /path/to/project && npx tsx scripts/daily-sync.ts >> logs/sync.log 2>&1
 * 
 * Or monthly on the 1st at 3am:
 * 0 3 1 * * cd /path/to/project && npx tsx scripts/daily-sync.ts >> logs/sync.log 2>&1
 */

import { execSync } from "child_process";
import { existsSync, appendFileSync, mkdirSync } from "fs";
import { join } from "path";

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "sync.log");

function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Also write to log file
  try {
    if (!existsSync(LOG_DIR)) {
      mkdirSync(LOG_DIR, { recursive: true });
    }
    appendFileSync(LOG_FILE, logMessage + "\n");
  } catch (e) {
    // Ignore log file errors
  }
}

function runScript(name: string, script: string): boolean {
  log(`Starting: ${name}`);
  const startTime = Date.now();
  
  try {
    execSync(`npx tsx ${script}`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`✅ Completed: ${name} (${duration}s)`);
    return true;
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`❌ Failed: ${name} (${duration}s) - ${error}`);
    return false;
  }
}

async function main(): Promise<void> {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  🎬 ScreamScore Weekly Sync`);
  console.log(`  ${new Date().toLocaleString()}`);
  console.log(`${"═".repeat(60)}\n`);
  
  log("Starting weekly sync...");
  
  const results = {
    movieSync: false,
    ratingsUpdate: false,
  };
  
  // Step 1: Sync new movies from TMDB
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  Step 1: Sync New Movies from TMDB`);
  console.log(`${"─".repeat(60)}\n`);
  
  results.movieSync = runScript("Movie Sync", "scripts/sync-new-movies.ts");
  
  // Step 2: Update IMDB ratings
  console.log(`\n${"─".repeat(60)}`);
  console.log(`  Step 2: Update IMDB Ratings`);
  console.log(`${"─".repeat(60)}\n`);
  
  results.ratingsUpdate = runScript("IMDB Ratings Update", "scripts/update-imdb-ratings.ts");
  
  // Summary
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  📊 Weekly Sync Summary`);
  console.log(`${"═".repeat(60)}`);
  console.log(`  Movie Sync:     ${results.movieSync ? "✅ Success" : "❌ Failed"}`);
  console.log(`  Ratings Update: ${results.ratingsUpdate ? "✅ Success" : "❌ Failed"}`);
  console.log(`${"═".repeat(60)}\n`);
  
  const allSuccess = results.movieSync && results.ratingsUpdate;
  log(`Weekly sync ${allSuccess ? "completed successfully" : "completed with errors"}`);
  
  if (!allSuccess) {
    process.exit(1);
  }
}

main();
