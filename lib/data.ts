// Simple in-memory data store for MVP
// In production, this would be replaced with a database

export interface Rating {
  movieQuality: number;  // How good is the movie overall (1-100)
  scream: number;        // Jumpscares (1-100)
  psychological: number; // Mind fuck factor (1-100)
  suspense: number;      // Tension (1-100)
  review?: string;
  author?: string;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  year?: number;
  description?: string;
  ratings: Rating[];
}

// In-memory storage
// Ratings are now on a 1-100 scale
let movies: Movie[] = [
  {
    id: "1",
    title: "The Exorcist",
    year: 1973,
    description: "When a 12-year-old girl is possessed by a mysterious entity, her mother seeks the help of two priests to save her daughter.",
    ratings: [
      {
        movieQuality: 89,
        scream: 70,
        psychological: 92,
        suspense: 85,
        review: "A classic that still holds up. The psychological terror is unmatched.",
        author: "HorrorFan",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "2",
    title: "Hereditary",
    year: 2018,
    description: "A grieving family is haunted by tragic and disturbing occurrences.",
    ratings: [
      {
        movieQuality: 92,
        scream: 65,
        psychological: 98,
        suspense: 88,
        review: "The psychological horror here is absolutely devastating.",
        author: "ScareSeeker",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "3",
    title: "The Shining",
    year: 1980,
    description: "A family heads to an isolated hotel for the winter where a sinister presence influences the father into violence.",
    ratings: [
      {
        movieQuality: 95,
        scream: 55,
        psychological: 94,
        suspense: 91,
        review: "Masterpiece of psychological horror. The tension is unbearable.",
        author: "FilmBuff",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "4",
    title: "Get Out",
    year: 2017,
    description: "A young African-American visits his white girlfriend's parents for the weekend, where his uneasiness about their reception of him eventually reaches a boiling point.",
    ratings: [
      {
        movieQuality: 98,
        scream: 45,
        psychological: 89,
        suspense: 82,
        review: "Brilliant social commentary wrapped in horror.",
        author: "CinemaLover",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "5",
    title: "The Conjuring",
    year: 2013,
    description: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.",
    ratings: [
      {
        movieQuality: 86,
        scream: 92,
        psychological: 72,
        suspense: 84,
        review: "Non-stop jumpscares! Not for the faint of heart.",
        author: "ScareSeeker",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "6",
    title: "Midsommar",
    year: 2019,
    description: "A couple travels to Sweden to visit a rural hometown's fabled mid-summer festival. What begins as an idyllic retreat quickly devolves into an increasingly violent and bizarre competition.",
    ratings: [
      {
        movieQuality: 83,
        scream: 35,
        psychological: 96,
        suspense: 74,
        review: "Disturbing and beautiful. The psychological impact is intense.",
        author: "HorrorFan",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "7",
    title: "It Follows",
    year: 2014,
    description: "A young woman is followed by an unknown supernatural force after a sexual encounter.",
    ratings: [],
  },
  {
    id: "8",
    title: "The Witch",
    year: 2015,
    description: "A family in 1630s New England is torn apart by the forces of witchcraft, black magic, and possession.",
    ratings: [],
  },
];

export function getMovies(): Movie[] {
  return movies;
}

export function getMovie(id: string): Movie | undefined {
  return movies.find((m) => m.id === id);
}

export function addMovie(movie: Omit<Movie, "id" | "ratings">): Movie {
  const newMovie: Movie = {
    ...movie,
    id: Date.now().toString(),
    ratings: [],
  };
  movies.push(newMovie);
  return newMovie;
}

export function addRating(movieId: string, rating: Rating): boolean {
  const movie = movies.find((m) => m.id === movieId);
  if (!movie) return false;
  
  rating.createdAt = new Date().toISOString();
  movie.ratings.push(rating);
  return true;
}

export function calculateAverageRating(ratings: Rating[]): {
  movieQuality: number;
  spookScore: number;
  scream: number;
  psychological: number;
  suspense: number;
} {
  if (ratings.length === 0) {
    return { movieQuality: 0, spookScore: 0, scream: 0, psychological: 0, suspense: 0 };
  }

  const totals = ratings.reduce(
    (acc, rating) => ({
      movieQuality: acc.movieQuality + rating.movieQuality,
      scream: acc.scream + rating.scream,
      psychological: acc.psychological + rating.psychological,
      suspense: acc.suspense + rating.suspense,
    }),
    { movieQuality: 0, scream: 0, psychological: 0, suspense: 0 }
  );

  const count = ratings.length;
  const movieQuality = totals.movieQuality / count;
  const scream = totals.scream / count;
  const psychological = totals.psychological / count;
  const suspense = totals.suspense / count;
  const spookScore = (scream + psychological + suspense) / 3;

  return {
    movieQuality: Math.round(movieQuality),
    spookScore: Math.round(spookScore),
    scream: Math.round(scream),
    psychological: Math.round(psychological),
    suspense: Math.round(suspense),
  };
}
