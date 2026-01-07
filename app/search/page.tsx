import Link from "next/link";
import { searchMovies } from "@/lib/movies";
import MoviePosterCard from "@/components/MoviePosterCard";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";

interface SearchPageProps {
  searchParams: { 
    q?: string;
    minImdb?: string;
    maxImdb?: string;
    minYear?: string;
    maxYear?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const minImdb = searchParams.minImdb ? parseFloat(searchParams.minImdb) : undefined;
  const maxImdb = searchParams.maxImdb ? parseFloat(searchParams.maxImdb) : undefined;
  const minYear = searchParams.minYear ? parseInt(searchParams.minYear) : undefined;
  const maxYear = searchParams.maxYear ? parseInt(searchParams.maxYear) : undefined;
  
  let movies = query ? await searchMovies(query) : [];
  
  // Apply filters
  if (minImdb !== undefined) {
    movies = movies.filter(m => m.imdbRating && m.imdbRating >= minImdb);
  }
  if (maxImdb !== undefined) {
    movies = movies.filter(m => m.imdbRating && m.imdbRating <= maxImdb);
  }
  if (minYear !== undefined) {
    movies = movies.filter(m => m.year && m.year >= minYear);
  }
  if (maxYear !== undefined) {
    movies = movies.filter(m => m.year && m.year <= maxYear);
  }

  return (
    <div className="min-h-screen relative">
      {/* Main Content */}
      <div className="lg:ml-12 xl:ml-20">
        <Header />

        <div className="px-6 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Search Results
          </h1>
          {query && (
            <p className="text-foreground/50 mb-6">
              {movies.length} result{movies.length !== 1 ? "s" : ""} for "{query}"
            </p>
          )}

          {!query && (
            <p className="text-foreground/50 mb-6">Enter a search term to find movies.</p>
          )}

          {/* Filters */}
          <SearchFilters 
            currentQuery={query}
            currentMinImdb={minImdb}
            currentMaxImdb={maxImdb}
            currentMinYear={minYear}
            currentMaxYear={maxYear}
          />

          {query && movies.length === 0 && (
            <div className="text-center py-20">
              <p className="text-foreground/50 text-lg mb-4">No movies found matching your criteria</p>
              <Link
                href="/add-movie"
                className="inline-flex items-center justify-center gradient-bg text-foreground px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Add a Movie
              </Link>
            </div>
          )}

          {movies.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {movies.map((movie) => (
                <MoviePosterCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
