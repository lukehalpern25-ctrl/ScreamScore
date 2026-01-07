"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface TMDBSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export default function AddMoviePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        if (data.results?.length === 0) {
          setError("No movies found. Try a different search term.");
        }
      } else {
        setError("Failed to search. Please try again.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (tmdbId: number) => {
    setIsImporting(tmdbId);
    setError(null);

    try {
      const response = await fetch("/api/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tmdbId }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/movie/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to import movie.");
      }
    } catch (err) {
      console.error("Import error:", err);
      setError("An error occurred while importing.");
    } finally {
      setIsImporting(null);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center text-foreground/50 hover:text-foreground transition-colors text-sm mb-4">
            ← Back to Movies
          </Link>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold">
                <span className="text-foreground">SCREAM</span>
                <span className="gradient-text">SCORE</span>
              </h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Add Movie</h2>
        <p className="text-foreground/50 mb-8">Search for a movie to add it to ScreamScore</p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a horror movie..."
              className="flex-1 bg-card-bg border border-white/10 text-foreground px-5 py-4 rounded-xl focus:border-white/20 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="gradient-bg text-foreground font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Search Results ({searchResults.length})
            </h3>
            {searchResults.map((movie) => (
              <div
                key={movie.id}
                className="bg-card-bg border border-white/5 rounded-xl p-4 flex gap-4 hover:border-white/10 transition-colors"
              >
                {/* Poster */}
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-24 bg-white/5 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-foreground font-semibold text-lg truncate">{movie.title}</h4>
                  <p className="text-foreground/50 text-sm mb-2">
                    {movie.release_date ? movie.release_date.split("-")[0] : "Unknown year"}
                  </p>
                  <p className="text-foreground/40 text-sm line-clamp-2">
                    {movie.overview || "No description available."}
                  </p>
                </div>

                {/* Import Button */}
                <button
                  onClick={() => handleImport(movie.id)}
                  disabled={isImporting === movie.id}
                  className="flex-shrink-0 gradient-bg text-foreground font-medium px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 h-fit self-center"
                >
                  {isImporting === movie.id ? "Importing..." : "Add"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isSearching && searchResults.length === 0 && !error && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-foreground/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-foreground/40">Search for a movie to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
