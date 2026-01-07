"use client";

import { useRef, useState } from "react";
import { MovieWithAverages } from "@/lib/movies";
import MoviePosterCard from "./MoviePosterCard";

interface MovieCarouselProps {
  title: string;
  subtitle?: string;
  movies: MovieWithAverages[];
  viewAllLink?: string;
  icon?: "star" | "sparkle" | "film" | "ghost";
  gradientColor?: string; // e.g., "#FF6B35", "#8B5CF6", "#10B981"
}

const icons = {
  star: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  sparkle: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  ),
  film: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4zm2 0h1V9h-1v2zm1-4V5h-1v2h1zM5 5v2H4V5h1zm0 4H4v2h1V9zm-1 4h1v2H4v-2z" clipRule="evenodd" />
    </svg>
  ),
  ghost: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 100 100">
      <path d="M50 5C30 5 15 22 15 42v38c0 3 2 5 4 3l6-8c2-2 5-2 7 0l6 8c2 3 5 3 7 0l5-8c2-2 5-2 7 0l5 8c2 3 5 3 7 0l6-8c2-2 5-2 7 0l6 8c2 2 4 0 4-3V42c0-20-15-37-35-37zm-12 45c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9zm24 0c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9z"/>
    </svg>
  ),
};

export default function MovieCarousel({ title, subtitle, movies, viewAllLink, icon, gradientColor = "#FF6B35" }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (movies.length === 0) return null;

  return (
    <section className="mb-20 relative">
      {/* Subtle section glow */}
      <div 
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[120px] pointer-events-none opacity-[0.15]"
        style={{ backgroundColor: gradientColor }}
      />
      
      {/* Section Header */}
      <div className="mb-8 relative">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-foreground/40 text-xs md:text-sm mt-1">{subtitle}</p>
            )}
          </div>
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="text-foreground/50 hover:text-foreground transition-colors text-xs font-medium"
            >
              VIEW ALL →
            </a>
          )}
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className={`absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card-bg/90 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-card-bg hover:border-white/20 transition-all shadow-lg ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Scroll left"
        >
          <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => scroll("right")}
          className={`absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card-bg/90 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-card-bg hover:border-white/20 transition-all shadow-lg ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Scroll right"
        >
          <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-4 snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
          }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="snap-start">
              <MoviePosterCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Divider */}
      <div className="mt-20 px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </section>
  );
}
