"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchFiltersProps {
  currentQuery: string;
  currentMinImdb?: number;
  currentMaxImdb?: number;
  currentMinYear?: number;
  currentMaxYear?: number;
}

export default function SearchFilters({
  currentQuery,
  currentMinImdb,
  currentMaxImdb,
  currentMinYear,
  currentMaxYear,
}: SearchFiltersProps) {
  const router = useRouter();
  // Show filters by default when there's a query
  const [showFilters, setShowFilters] = useState(true);
  const [minImdb, setMinImdb] = useState(currentMinImdb?.toString() || "");
  const [maxImdb, setMaxImdb] = useState(currentMaxImdb?.toString() || "");
  const [minYear, setMinYear] = useState(currentMinYear?.toString() || "");
  const [maxYear, setMaxYear] = useState(currentMaxYear?.toString() || "");

  const hasActiveFilters = currentMinImdb || currentMaxImdb || currentMinYear || currentMaxYear;

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (currentQuery) params.set("q", currentQuery);
    if (minImdb) params.set("minImdb", minImdb);
    if (maxImdb) params.set("maxImdb", maxImdb);
    if (minYear) params.set("minYear", minYear);
    if (maxYear) params.set("maxYear", maxYear);
    
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinImdb("");
    setMaxImdb("");
    setMinYear("");
    setMaxYear("");
    
    const params = new URLSearchParams();
    if (currentQuery) params.set("q", currentQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mb-8">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          hasActiveFilters 
            ? "bg-[#FF6B35]/10 border-[#FF6B35]/30 text-[#FF6B35]" 
            : "bg-card-bg border-white/10 text-foreground/70 hover:text-foreground hover:border-white/20"
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-medium">
          {showFilters ? "Hide Filters" : "Filters"}
          {hasActiveFilters && " (active)"}
        </span>
      </button>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mt-4 p-6 bg-card-bg/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* IMDB Rating Range */}
            <div>
              <label className="block text-foreground/70 text-sm font-medium mb-2">
                Min IMDB Rating
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={minImdb}
                onChange={(e) => setMinImdb(e.target.value)}
                placeholder="0"
                className="w-full bg-background border border-white/10 text-foreground px-4 py-2 rounded-lg focus:border-white/20 focus:outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-foreground/70 text-sm font-medium mb-2">
                Max IMDB Rating
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={maxImdb}
                onChange={(e) => setMaxImdb(e.target.value)}
                placeholder="10"
                className="w-full bg-background border border-white/10 text-foreground px-4 py-2 rounded-lg focus:border-white/20 focus:outline-none transition-colors text-sm"
              />
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-foreground/70 text-sm font-medium mb-2">
                Min Year
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                placeholder="1900"
                className="w-full bg-background border border-white/10 text-foreground px-4 py-2 rounded-lg focus:border-white/20 focus:outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-foreground/70 text-sm font-medium mb-2">
                Max Year
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                placeholder={new Date().getFullYear().toString()}
                className="w-full bg-background border border-white/10 text-foreground px-4 py-2 rounded-lg focus:border-white/20 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10">
            <button
              onClick={applyFilters}
              className="gradient-bg text-foreground font-medium px-6 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Apply Filters
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-foreground/50 hover:text-foreground transition-colors text-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
