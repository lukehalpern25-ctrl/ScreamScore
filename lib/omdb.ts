// OMDB API Service for fetching IMDB ratings

const OMDB_API_KEY = '627440d7';
const OMDB_BASE_URL = 'http://www.omdbapi.com';

export interface OMDBMovie {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: {
    Source: string;
    Value: string;
  }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  Response: string;
  Error?: string;
}

export interface IMDBRating {
  imdbRating: number | null;      // e.g., 7.6
  imdbVotes: number | null;       // e.g., 816421
  rottenTomatoes: number | null;  // e.g., 85 (percentage)
  metacritic: number | null;      // e.g., 67
}

/**
 * Fetch movie data from OMDB by IMDB ID
 */
export async function getMovieByImdbId(imdbId: string): Promise<OMDBMovie | null> {
  try {
    const response = await fetch(`${OMDB_BASE_URL}/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    const data: OMDBMovie = await response.json();
    
    if (data.Response === 'False') {
      console.error(`OMDB Error for ${imdbId}:`, data.Error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to fetch OMDB data for ${imdbId}:`, error);
    return null;
  }
}

/**
 * Search for a movie by title on OMDB
 */
export async function searchMovie(title: string, year?: number): Promise<OMDBMovie | null> {
  try {
    let url = `${OMDB_BASE_URL}/?t=${encodeURIComponent(title)}&apikey=${OMDB_API_KEY}`;
    if (year) {
      url += `&y=${year}`;
    }
    
    const response = await fetch(url);
    const data: OMDBMovie = await response.json();
    
    if (data.Response === 'False') {
      console.error(`OMDB Error for "${title}":`, data.Error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to search OMDB for "${title}":`, error);
    return null;
  }
}

/**
 * Extract structured ratings from OMDB response
 */
export function extractRatings(movie: OMDBMovie): IMDBRating {
  // Parse IMDB rating
  const imdbRating = movie.imdbRating && movie.imdbRating !== 'N/A' 
    ? parseFloat(movie.imdbRating) 
    : null;
  
  // Parse IMDB votes (remove commas)
  const imdbVotes = movie.imdbVotes && movie.imdbVotes !== 'N/A'
    ? parseInt(movie.imdbVotes.replace(/,/g, ''))
    : null;
  
  // Find Rotten Tomatoes rating
  const rtRating = movie.Ratings?.find(r => r.Source === 'Rotten Tomatoes');
  const rottenTomatoes = rtRating 
    ? parseInt(rtRating.Value.replace('%', ''))
    : null;
  
  // Parse Metacritic
  const metacritic = movie.Metascore && movie.Metascore !== 'N/A'
    ? parseInt(movie.Metascore)
    : null;
  
  return {
    imdbRating,
    imdbVotes,
    rottenTomatoes,
    metacritic,
  };
}

/**
 * Get IMDB ratings for a movie by its IMDB ID
 */
export async function getIMDBRatings(imdbId: string): Promise<IMDBRating | null> {
  const movie = await getMovieByImdbId(imdbId);
  if (!movie) return null;
  return extractRatings(movie);
}
