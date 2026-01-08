"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
}

interface HeaderProps {
  showFilters?: boolean;
  filterSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export default function Header({ showFilters, filterSlot, rightSlot }: HeaderProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showJumpscare, setShowJumpscare] = useState(false);
  const [showGif, setShowGif] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.movies);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleResultClick = (movieId: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/movie/${movieId}`);
  };

  const handleJumpscare = () => {
    // Show black screen
    setShowJumpscare(true);
    setShowGif(false);
    
    // After 1 second, show GIF
    setTimeout(() => {
      setShowGif(true);
      
      // After 0.5 seconds, hide everything
      setTimeout(() => {
        setShowGif(false);
        setShowJumpscare(false);
      }, 500);
    }, 1000);
  };

  return (
    <>
      {/* Jumpscare Overlay */}
      {showJumpscare && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {showGif ? (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <img
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjMwNzNvd2FpZjFhYm81ZmJhZzBnc3gxZHA5emV4aHpzcXZ6cXl0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohjV8JRMcNVGYK10I/giphy.gif"
                alt="Jumpscare"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-black" />
          )}
        </div>
      )}

      <header
        className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-transform duration-300 relative ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
      {/* Border line extending to left edge */}
      <div className="absolute bottom-0 -left-12 xl:-left-20 right-0 h-px bg-white/10" />
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="text-foreground">SCREAM</span>
              <span className="gradient-text">SC</span>
                <svg className="w-[22px] h-[22px] inline-block mx-[1px] mt-[2px]" viewBox="0 0 100 100">
                  {/* Rounder ghost shape */}
                  <ellipse cx="50" cy="45" rx="38" ry="40" fill="white"/>
                  <path fill="white" d="M12 45v30c0 4 3 6 6 3l8-10c3-3 7-3 10 0l7 10c3 4 8 4 11 0l7-10c3-3 7-3 10 0l8 10c3 3 6 1 6-3V45"/>
                  {/* Eyes */}
                  <ellipse cx="35" cy="42" rx="8" ry="9" fill="#0A0A0A"/>
                  <ellipse cx="65" cy="42" rx="8" ry="9" fill="#0A0A0A"/>
                </svg>
              <span className="gradient-text">RE</span>
            </h1>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* Filter Slot (for homepage) */}
            {filterSlot}
            
            {/* Jumpscare Button */}
            <button
              onClick={handleJumpscare}
              className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/5"
            >
              Click Here Sophia
            </button>
            
            {/* Custom Right Slot or Default Search/Add Movie */}
            {rightSlot ? (
              rightSlot
            ) : (
              <>
                {/* Search Bar with Dropdown */}
                <div ref={searchRef} className="relative">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                        placeholder="Search..."
                        className="w-40 bg-white/5 border border-white/10 rounded-full py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-white/20 focus:w-52 transition-all"
                      />
                      <svg
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/40"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </form>

                  {/* Search Dropdown */}
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-background/80 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden z-50">
                      {isSearching ? (
                        <div className="px-3 py-2 text-foreground/50 text-xs">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-72 overflow-y-auto">
                          {searchResults.map((movie) => (
                            <button
                              key={movie.id}
                              onClick={() => handleResultClick(movie.id)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 transition-colors text-left"
                            >
                              {movie.posterUrl ? (
                                <img
                                  src={movie.posterUrl}
                                  alt={movie.title}
                                  className="w-6 h-9 object-cover rounded flex-shrink-0"
                                />
                              ) : (
                                <div className="w-6 h-9 bg-white/5 rounded flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <div className="text-foreground text-xs font-medium truncate">
                                  {movie.title}
                                </div>
                                {movie.year && (
                                  <div className="text-foreground/40 text-[10px]">{movie.year}</div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-3 py-2 text-foreground/50 text-xs">No movies found</div>
                      )}
                    </div>
                  )}
                </div>

                <Link href="/add-movie" className="hidden md:block text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
                  Add Movie
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
