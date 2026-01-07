// TMDB API Service for ScreamScore

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NmY5NWZhZTE0OTA2MjkxODM5NTE0YzMxNjhiY2NhOSIsIm5iZiI6MTc2NzY3MzgzNi4yMTksInN1YiI6IjY5NWM4ZmVjNDRhODYyMTE2N2RkMDViZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c-1uL5xmQPMvlM3CA8XLdgo8HiNqMtjdB5V4h7awBuA';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Image URL helpers
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export function getPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getProfileUrl(path: string | null, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getYouTubeEmbedUrl(key: string | null): string | null {
  if (!key) return null;
  return `https://www.youtube.com/embed/${key}`;
}

export function getYouTubeThumbnail(key: string | null): string | null {
  if (!key) return null;
  return `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
}

// API request helper
async function tmdbFetch<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${TMDB_API_KEY}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

// Types
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  imdb_id?: string;
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
  official: boolean;
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// API Functions

/**
 * Search for movies by title
 */
export async function searchMovies(query: string, page: number = 1): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(
    `/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`
  );
}

/**
 * Get detailed movie information
 */
export async function getMovieDetails(tmdbId: number): Promise<TMDBMovie> {
  return tmdbFetch<TMDBMovie>(`/movie/${tmdbId}?language=en-US`);
}

/**
 * Get movie videos (trailers, teasers, etc.)
 */
export async function getMovieVideos(tmdbId: number): Promise<{ results: TMDBVideo[] }> {
  return tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${tmdbId}/videos?language=en-US`);
}

/**
 * Get the official trailer for a movie
 */
export async function getMovieTrailer(tmdbId: number): Promise<TMDBVideo | null> {
  const { results } = await getMovieVideos(tmdbId);
  
  // Prefer official trailers from YouTube
  const trailer = results.find(
    v => v.type === 'Trailer' && v.site === 'YouTube' && v.official
  ) || results.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  ) || results.find(
    v => v.site === 'YouTube'
  );
  
  return trailer || null;
}

/**
 * Discover popular horror movies
 */
export async function getPopularHorrorMovies(page: number = 1): Promise<TMDBSearchResult> {
  // Genre ID 27 = Horror
  return tmdbFetch<TMDBSearchResult>(
    `/discover/movie?with_genres=27&sort_by=popularity.desc&language=en-US&page=${page}`
  );
}

/**
 * Discover top-rated horror movies
 */
export async function getTopRatedHorrorMovies(page: number = 1): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(
    `/discover/movie?with_genres=27&sort_by=vote_average.desc&vote_count.gte=500&language=en-US&page=${page}`
  );
}

/**
 * Get recently released horror movies
 */
export async function getRecentHorrorMovies(page: number = 1): Promise<TMDBSearchResult> {
  const today = new Date();
  const threeMonthsAgo = new Date(today.setMonth(today.getMonth() - 3));
  const dateStr = threeMonthsAgo.toISOString().split('T')[0];
  
  return tmdbFetch<TMDBSearchResult>(
    `/discover/movie?with_genres=27&sort_by=release_date.desc&release_date.gte=${dateStr}&language=en-US&page=${page}`
  );
}

/**
 * Full movie data fetch - gets details + trailer in parallel
 */
export async function getFullMovieData(tmdbId: number) {
  const [details, trailer] = await Promise.all([
    getMovieDetails(tmdbId),
    getMovieTrailer(tmdbId),
  ]);
  
  return {
    tmdbId: details.id,
    title: details.title,
    year: details.release_date ? parseInt(details.release_date.split('-')[0]) : null,
    releaseDate: details.release_date ? new Date(details.release_date) : null,
    description: details.overview,
    tagline: details.tagline || null,
    runtime: details.runtime || null,
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    trailerKey: trailer?.key || null,
    genres: details.genres?.map(g => g.name).join(',') || null,
    imdbId: details.imdb_id || null,
    tmdbRating: details.vote_average,
    tmdbVotes: details.vote_count,
  };
}
