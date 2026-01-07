"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HomeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  // Get current filter values from URL
  const currentMinImdb = searchParams.get("minImdb") || "";
  const currentMaxImdb = searchParams.get("maxImdb") || "";
  const currentMinYear = searchParams.get("minYear") || "";
  const currentMaxYear = searchParams.get("maxYear") || "";
  
  const [minImdb, setMinImdb] = useState(currentMinImdb);
  const [maxImdb, setMaxImdb] = useState(currentMaxImdb);
  const [minYear, setMinYear] = useState(currentMinYear);
  const [maxYear, setMaxYear] = useState(currentMaxYear);

  const hasActiveFilters = currentMinImdb || currentMaxImdb || currentMinYear || currentMaxYear;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (minImdb) params.set("minImdb", minImdb);
    if (maxImdb) params.set("maxImdb", maxImdb);
    if (minYear) params.set("minYear", minYear);
    if (maxYear) params.set("maxYear", maxYear);
    
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
    setShowFilters(false);
  };

  const clearFilters = () => {
    setMinImdb("");
    setMaxImdb("");
    setMinYear("");
    setMaxYear("");
    router.push("/");
    setShowFilters(false);
  };

  return (
    <div ref={filterRef} className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
          hasActiveFilters
            ? "bg-[#FF6B35]/10 border-[#FF6B35]/30 text-[#FF6B35]"
            : "bg-white/5 border-white/10 text-foreground/60 hover:text-foreground hover:border-white/20"
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter
        {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]" />}
      </button>

      {/* Filter Dropdown */}
      {showFilters && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-background/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl z-50 p-4">
          <div className="space-y-4">
            {/* IMDB Rating */}
            <div>
              <label className="block text-foreground/70 text-xs font-medium mb-2">IMDB Rating</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={minImdb}
                  onChange={(e) => setMinImdb(e.target.value)}
                  placeholder="Min"
                  className="flex-1 bg-white/5 border border-white/10 text-foreground px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-white/20"
                />
                <span className="text-foreground/30">—</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={maxImdb}
                  onChange={(e) => setMaxImdb(e.target.value)}
                  placeholder="Max"
                  className="flex-1 bg-white/5 border border-white/10 text-foreground px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            {/* Release Year */}
            <div>
              <label className="block text-foreground/70 text-xs font-medium mb-2">Release Year</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 2}
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  placeholder="From"
                  className="flex-1 bg-white/5 border border-white/10 text-foreground px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-white/20"
                />
                <span className="text-foreground/30">—</span>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 2}
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  placeholder="To"
                  className="flex-1 bg-white/5 border border-white/10 text-foreground px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-foreground/70 text-xs font-medium mb-2">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    if (minImdb === "7" && !maxImdb) {
                      setMinImdb(""); setMaxImdb("");
                    } else {
                      setMinImdb("7"); setMaxImdb("");
                    }
                  }}
                  className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
                    minImdb === "7" && !maxImdb
                      ? "bg-[#FF6B35]/20 border-[#FF6B35]/40 text-[#FF6B35]"
                      : "bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10"
                  }`}
                >
                  IMDB 7+
                </button>
                <button
                  onClick={() => {
                    if (minYear === "2020" && !maxYear) {
                      setMinYear(""); setMaxYear("");
                    } else {
                      setMinYear("2020"); setMaxYear("");
                    }
                  }}
                  className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
                    minYear === "2020" && !maxYear
                      ? "bg-[#FF6B35]/20 border-[#FF6B35]/40 text-[#FF6B35]"
                      : "bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10"
                  }`}
                >
                  2020s
                </button>
                <button
                  onClick={() => {
                    if (minYear === "2000" && maxYear === "2019") {
                      setMinYear(""); setMaxYear("");
                    } else {
                      setMinYear("2000"); setMaxYear("2019");
                    }
                  }}
                  className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
                    minYear === "2000" && maxYear === "2019"
                      ? "bg-[#FF6B35]/20 border-[#FF6B35]/40 text-[#FF6B35]"
                      : "bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10"
                  }`}
                >
                  2000s-2010s
                </button>
                <button
                  onClick={() => {
                    if (!minYear && maxYear === "1999") {
                      setMinYear(""); setMaxYear("");
                    } else {
                      setMinYear(""); setMaxYear("1999");
                    }
                  }}
                  className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${
                    !minYear && maxYear === "1999"
                      ? "bg-[#FF6B35]/20 border-[#FF6B35]/40 text-[#FF6B35]"
                      : "bg-white/5 border-white/10 text-foreground/60 hover:bg-white/10"
                  }`}
                >
                  Classics
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
              <button
                onClick={applyFilters}
                className="flex-1 gradient-bg text-foreground font-medium py-2 rounded-lg text-xs hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-foreground/50 hover:text-foreground text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
