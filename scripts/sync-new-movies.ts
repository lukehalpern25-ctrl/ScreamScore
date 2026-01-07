/**
 * Script to sync new/upcoming horror movies from TMDB
 * Fetches movies from multiple categories:
 * - Upcoming horror releases
 * - Recently released horror
 * - Popular horror movies
 * - Top rated horror
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NmY5NWZhZTE0OTA2MjkxODM5NTE0YzMxNjhiY2NhOSIsIm5iZiI6MTc2NzY3MzgzNi4yMTksInN1YiI6IjY5NWM4ZmVjNDRhODYyMTE2N2RkMDViZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c-1uL5xmQPMvlM3CA8XLdgo8HiNqMtjdB5V4h7awBuA';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const HORROR_GENRE_ID = 27;

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
}

interface TMDBMovieDetails {
  id: number;
  imdb_id: string | null;
  title: string;
  release_date: string;
  runtime: number | null;
  genres: { id: number; name: string }[];
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
}

interface TMDBCredits {
  cast: { name: string; character: string; profile_path: string | null }[];
  crew: { name: string; job: string }[];
}

interface TMDBVideos {
  results: { key: string; site: string; type: string }[];
}

async function fetchTMDB<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${TMDB_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

async function discoverHorrorMovies(params: Record<string, string>): Promise<TMDBMovie[]> {
  const queryString = new URLSearchParams({
    with_genres: HORROR_GENRE_ID.toString(),
    language: 'en-US',
    ...params,
  }).toString();
  
  const data = await fetchTMDB<{ results: TMDBMovie[] }>(`/discover/movie?${queryString}`);
  return data.results || [];
}

async function getUpcomingHorror(): Promise<TMDBMovie[]> {
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  return discoverHorrorMovies({
    'primary_release_date.gte': today,
    'primary_release_date.lte': futureDate,
    sort_by: 'primary_release_date.asc',
  });
}

async function getRecentHorror(): Promise<TMDBMovie[]> {
  const today = new Date().toISOString().split('T')[0];
  const pastDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 6 months
  
  return discoverHorrorMovies({
    'primary_release_date.gte': pastDate,
    'primary_release_date.lte': today,
    sort_by: 'primary_release_date.desc',
  });
}

async function getPopularHorror(): Promise<TMDBMovie[]> {
  return discoverHorrorMovies({
    sort_by: 'popularity.desc',
  });
}

async function getTopRatedHorror(): Promise<TMDBMovie[]> {
  return discoverHorrorMovies({
    sort_by: 'vote_average.desc',
    'vote_count.gte': '100',
  });
}

async function getMovieDetails(tmdbId: number): Promise<TMDBMovieDetails> {
  return fetchTMDB<TMDBMovieDetails>(`/movie/${tmdbId}`);
}

async function getMovieCredits(tmdbId: number): Promise<TMDBCredits> {
  return fetchTMDB<TMDBCredits>(`/movie/${tmdbId}/credits`);
}

async function getMovieVideos(tmdbId: number): Promise<TMDBVideos> {
  return fetchTMDB<TMDBVideos>(`/movie/${tmdbId}/videos`);
}

async function importMovie(tmdbId: number): Promise<{ success: boolean; title: string; reason?: string }> {
  try {
    // Check if already exists
    const existing = await prisma.movie.findFirst({
      where: { tmdbId },
    });
    
    if (existing) {
      return { success: false, title: existing.title, reason: 'already exists' };
    }
    
    // Fetch full movie details
    const [details, credits, videos] = await Promise.all([
      getMovieDetails(tmdbId),
      getMovieCredits(tmdbId),
      getMovieVideos(tmdbId),
    ]);
    
    // Find trailer
    const trailer = videos.results?.find(
      v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    );
    
    // Get director and cast
    const director = credits.crew?.find(c => c.job === 'Director')?.name || null;
    const topCast = credits.cast?.slice(0, 3).map(c => ({
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    })) || [];
    
    // Extract year and full release date
    const year = details.release_date ? parseInt(details.release_date.split('-')[0]) : null;
    const releaseDate = details.release_date ? new Date(details.release_date) : null;
    
    // Create the movie
    await prisma.movie.create({
      data: {
        title: details.title,
        year,
        releaseDate,
        description: details.overview || null,
        tmdbId: details.id,
        imdbId: details.imdb_id || null,
        posterPath: details.poster_path,
        backdropPath: details.backdrop_path,
        trailerKey: trailer?.key || null,
        tmdbRating: details.vote_average || null,
        tmdbVotes: details.vote_count || null,
        runtime: details.runtime || null,
        genres: details.genres?.map(g => g.name).join(', ') || null,
        director,
        cast: JSON.stringify(topCast),
      },
    });
    
    return { success: true, title: details.title };
  } catch (error) {
    return { success: false, title: `TMDB ID ${tmdbId}`, reason: String(error) };
  }
}

async function main(): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Horror Movie Sync`);
  console.log(`  Fetching new movies from TMDB`);
  console.log(`${"=".repeat(60)}\n`);
  
  const stats = {
    fetched: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
  };
  
  try {
    // Collect movies from all categories
    console.log(`📡 Fetching movies from TMDB...`);
    
    const [upcoming, recent, popular, topRated] = await Promise.all([
      getUpcomingHorror(),
      getRecentHorror(),
      getPopularHorror(),
      getTopRatedHorror(),
    ]);
    
    console.log(`   - Upcoming: ${upcoming.length} movies`);
    console.log(`   - Recent (6 months): ${recent.length} movies`);
    console.log(`   - Popular: ${popular.length} movies`);
    console.log(`   - Top Rated: ${topRated.length} movies`);
    
    // Combine and dedupe by TMDB ID
    const allMovies = [...upcoming, ...recent, ...popular, ...topRated];
    const uniqueMovies = new Map<number, TMDBMovie>();
    
    for (const movie of allMovies) {
      if (!uniqueMovies.has(movie.id)) {
        uniqueMovies.set(movie.id, movie);
      }
    }
    
    stats.fetched = uniqueMovies.size;
    console.log(`\n📊 Total unique movies: ${stats.fetched}`);
    
    // Import each movie
    console.log(`\n🎬 Importing new movies...`);
    
    let processed = 0;
    for (const [tmdbId, movie] of uniqueMovies) {
      processed++;
      
      const result = await importMovie(tmdbId);
      
      if (result.success) {
        stats.imported++;
        console.log(`   ✅ [${processed}/${stats.fetched}] Imported: ${result.title}`);
      } else if (result.reason === 'already exists') {
        stats.skipped++;
        if (processed % 20 === 0) {
          process.stdout.write(`\r   ⏭️  [${processed}/${stats.fetched}] Checking existing movies...`);
        }
      } else {
        stats.failed++;
        console.log(`   ❌ [${processed}/${stats.fetched}] Failed: ${result.title} - ${result.reason}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n`);
    
    // Get total count
    const totalMovies = await prisma.movie.count();
    
    // Summary
    console.log(`${"=".repeat(60)}`);
    console.log(`  ✅ Sync Complete!`);
    console.log(`${"=".repeat(60)}`);
    console.log(`  📊 Results:`);
    console.log(`     - Checked: ${stats.fetched} movies from TMDB`);
    console.log(`     - New imports: ${stats.imported} movies`);
    console.log(`     - Already existed: ${stats.skipped} movies`);
    console.log(`     - Failed: ${stats.failed} movies`);
    console.log(`     - Total in database: ${totalMovies} movies`);
    console.log(`${"=".repeat(60)}\n`);
    
  } catch (error) {
    console.error(`\n❌ Error:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
