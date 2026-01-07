import prisma from "./db";
import { getFullMovieData, getPosterUrl, getBackdropUrl, getYouTubeEmbedUrl, getProfileUrl } from "./tmdb";
import type { Movie, Rating } from "@prisma/client";

// Cast member type
export interface CastMember {
  name: string;
  character: string;
  profilePath: string | null;
  profileUrl: string | null;
}

// Types for frontend consumption
export interface MovieWithRatings extends Movie {
  ratings: Rating[];
}

export interface MovieWithAverages extends MovieWithRatings {
  averages: {
    scream: number;
    psychological: number;
    suspense: number;
    spookScore: number;
  };
  posterUrl: string | null;
  backdropUrl: string | null;
  trailerUrl: string | null;
  parsedCast: CastMember[];
}

// Calculate average ratings
export function calculateAverages(ratings: Rating[]) {
  if (ratings.length === 0) {
    return { scream: 0, psychological: 0, suspense: 0, spookScore: 0 };
  }

  const totals = ratings.reduce(
    (acc, rating) => ({
      scream: acc.scream + rating.scream,
      psychological: acc.psychological + rating.psychological,
      suspense: acc.suspense + rating.suspense,
    }),
    { scream: 0, psychological: 0, suspense: 0 }
  );

  const count = ratings.length;
  const scream = totals.scream / count;
  const psychological = totals.psychological / count;
  const suspense = totals.suspense / count;
  const spookScore = (scream + psychological + suspense) / 3;

  return {
    scream: Math.round(scream),
    psychological: Math.round(psychological),
    suspense: Math.round(suspense),
    spookScore: Math.round(spookScore),
  };
}

/**
 * Check if a movie is upcoming (not yet released)
 */
export function isUpcoming(movie: Movie): boolean {
  if (!movie.releaseDate) {
    // If no release date, check by year
    if (!movie.year) return false;
    const currentYear = new Date().getFullYear();
    return movie.year > currentYear;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const releaseDate = new Date(movie.releaseDate);
  releaseDate.setHours(0, 0, 0, 0);
  
  return releaseDate > today;
}

// Parse cast JSON string into typed array
function parseCast(castJson: string | null): CastMember[] {
  if (!castJson) return [];
  try {
    const cast = JSON.parse(castJson) as Array<{ name: string; character: string; profilePath: string | null }>;
    return cast.map(c => ({
      ...c,
      profileUrl: getProfileUrl(c.profilePath),
    }));
  } catch {
    return [];
  }
}

// Enhance movie with URLs and averages
function enhanceMovie(movie: MovieWithRatings): MovieWithAverages {
  return {
    ...movie,
    averages: calculateAverages(movie.ratings),
    posterUrl: getPosterUrl(movie.posterPath),
    backdropUrl: getBackdropUrl(movie.backdropPath),
    trailerUrl: getYouTubeEmbedUrl(movie.trailerKey),
    parsedCast: parseCast(movie.cast),
  };
}

// ============ MOVIE QUERIES ============

/**
 * Get all movies with their ratings
 */
export async function getMovies(): Promise<MovieWithAverages[]> {
  const movies = await prisma.movie.findMany({
    include: { ratings: true },
    orderBy: { createdAt: "desc" },
  });
  
  return movies.map(enhanceMovie);
}

/**
 * Get a single movie by ID
 */
export async function getMovie(id: string): Promise<MovieWithAverages | null> {
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { ratings: true },
  });
  
  if (!movie) return null;
  return enhanceMovie(movie);
}

/**
 * Get a movie by TMDB ID
 */
export async function getMovieByTmdbId(tmdbId: number): Promise<MovieWithAverages | null> {
  const movie = await prisma.movie.findUnique({
    where: { tmdbId },
    include: { ratings: true },
  });
  
  if (!movie) return null;
  return enhanceMovie(movie);
}

/**
 * Get top-rated movies (by spook score)
 */
export async function getTopRatedMovies(limit: number = 10): Promise<MovieWithAverages[]> {
  const movies = await prisma.movie.findMany({
    include: { ratings: true },
    where: {
      ratings: { some: {} }, // Only movies with ratings
    },
  });
  
  return movies
    .map(enhanceMovie)
    .sort((a, b) => b.averages.spookScore - a.averages.spookScore)
    .slice(0, limit);
}

/**
 * Get recently added movies
 */
export async function getRecentMovies(limit: number = 10): Promise<MovieWithAverages[]> {
  const movies = await prisma.movie.findMany({
    include: { ratings: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  
  return movies.map(enhanceMovie);
}

/**
 * Get similar movies by genre (top rated within same genres)
 */
export async function getSimilarMoviesByGenre(
  genres: string | null,
  excludeMovieId: string,
  limit: number = 10
): Promise<MovieWithAverages[]> {
  if (!genres) {
    // Fallback to top rated if no genres
    return getTopRatedMovies(limit);
  }
  
  // Parse genres (comma-separated string)
  const genreList = genres.split(",").map(g => g.trim().toLowerCase());
  
  const movies = await prisma.movie.findMany({
    include: { ratings: true },
    where: {
      id: { not: excludeMovieId },
    },
  });
  
  // Filter movies that share at least one genre and sort by IMDB rating
  const matchingMovies = movies
    .map(enhanceMovie)
    .filter(m => {
      if (!m.genres) return false;
      const movieGenres = m.genres.split(",").map(g => g.trim().toLowerCase());
      return genreList.some(g => movieGenres.includes(g));
    })
    .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
    .slice(0, limit);
  
  // If not enough matching movies, supplement with top rated
  if (matchingMovies.length < limit) {
    const remaining = limit - matchingMovies.length;
    const existingIds = new Set([excludeMovieId, ...matchingMovies.map(m => m.id)]);
    const topRated = movies
      .map(enhanceMovie)
      .filter(m => !existingIds.has(m.id) && m.imdbRating)
      .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
      .slice(0, remaining);
    return [...matchingMovies, ...topRated];
  }
  
  return matchingMovies;
}

/**
 * Search movies by title
 */
export async function searchMovies(query: string): Promise<MovieWithAverages[]> {
  const movies = await prisma.movie.findMany({
    where: {
      title: { contains: query },
    },
    include: { ratings: true },
  });
  
  return movies.map(enhanceMovie);
}

// ============ MOVIE MUTATIONS ============

interface CreateMovieInput {
  title: string;
  year?: number;
  releaseDate?: Date;
  description?: string;
  tagline?: string;
  runtime?: number;
  tmdbId?: number;
  imdbId?: string;
  posterPath?: string;
  backdropPath?: string;
  trailerKey?: string;
  genres?: string;
  tmdbRating?: number;
  tmdbVotes?: number;
}

/**
 * Create a new movie manually
 */
export async function createMovie(data: CreateMovieInput): Promise<MovieWithAverages> {
  const movie = await prisma.movie.create({
    data: {
      title: data.title,
      year: data.year,
      releaseDate: data.releaseDate,
      description: data.description,
      tagline: data.tagline,
      runtime: data.runtime,
      tmdbId: data.tmdbId,
      imdbId: data.imdbId,
      posterPath: data.posterPath,
      backdropPath: data.backdropPath,
      trailerKey: data.trailerKey,
      genres: data.genres,
      tmdbRating: data.tmdbRating,
      tmdbVotes: data.tmdbVotes,
    },
    include: { ratings: true },
  });
  
  return enhanceMovie(movie);
}

/**
 * Import a movie from TMDB by ID
 */
export async function importMovieFromTmdb(tmdbId: number): Promise<MovieWithAverages> {
  // Check if already exists
  const existing = await prisma.movie.findUnique({
    where: { tmdbId },
    include: { ratings: true },
  });
  
  if (existing) {
    return enhanceMovie(existing);
  }
  
  // Fetch from TMDB
  const tmdbData = await getFullMovieData(tmdbId);
  
  // Create in database
  const movie = await prisma.movie.create({
    data: {
      title: tmdbData.title,
      year: tmdbData.year,
      releaseDate: tmdbData.releaseDate,
      description: tmdbData.description,
      tagline: tmdbData.tagline,
      runtime: tmdbData.runtime,
      tmdbId: tmdbData.tmdbId,
      imdbId: tmdbData.imdbId,
      posterPath: tmdbData.posterPath,
      backdropPath: tmdbData.backdropPath,
      trailerKey: tmdbData.trailerKey,
      genres: tmdbData.genres,
      tmdbRating: tmdbData.tmdbRating,
      tmdbVotes: tmdbData.tmdbVotes,
    },
    include: { ratings: true },
  });
  
  return enhanceMovie(movie);
}

/**
 * Update a movie
 */
export async function updateMovie(id: string, data: Partial<CreateMovieInput>): Promise<MovieWithAverages | null> {
  try {
    const movie = await prisma.movie.update({
      where: { id },
      data,
      include: { ratings: true },
    });
    return enhanceMovie(movie);
  } catch {
    return null;
  }
}

/**
 * Delete a movie
 */
export async function deleteMovie(id: string): Promise<boolean> {
  try {
    await prisma.movie.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

// ============ RATING MUTATIONS ============

interface CreateRatingInput {
  movieId: string;
  scream: number;
  psychological: number;
  suspense: number;
  review?: string;
  author?: string;
}

/**
 * Add a rating to a movie
 */
export async function addRating(data: CreateRatingInput): Promise<Rating> {
  const rating = await prisma.rating.create({
    data: {
      movieId: data.movieId,
      scream: data.scream,
      psychological: data.psychological,
      suspense: data.suspense,
      review: data.review,
      author: data.author || "Anonymous",
    },
  });
  
  return rating;
}

/**
 * Get ratings for a movie
 */
export async function getMovieRatings(movieId: string): Promise<Rating[]> {
  return prisma.rating.findMany({
    where: { movieId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Delete a rating
 */
export async function deleteRating(id: string): Promise<boolean> {
  try {
    await prisma.rating.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
