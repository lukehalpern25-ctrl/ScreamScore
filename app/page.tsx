import Link from "next/link";
import { getMovies, isUpcoming } from "@/lib/movies";
import MovieCarousel from "@/components/MovieCarousel";
import Header from "@/components/Header";
import HomeFilters from "@/components/HomeFilters";

interface HomeProps {
  searchParams: {
    minImdb?: string;
    maxImdb?: string;
    minYear?: string;
    maxYear?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  let movies = await getMovies();
  
  // Filter out movies without trailers - only show movies with trailers on main page
  movies = movies.filter(m => m.trailerKey);
  
  // Filter out released movies without IMDB ratings (but keep upcoming movies)
  // This ensures that when weekly sync updates IMDB ratings, previously hidden movies will appear
  movies = movies.filter(m => {
    // If it's upcoming, always show it (even without IMDB rating)
    if (isUpcoming(m)) return true;
    // If it's already released, only show if it has an IMDB rating
    return m.imdbRating !== null && m.imdbRating !== undefined;
  });
  
  // Apply filters from URL params
  const minImdb = searchParams.minImdb ? parseFloat(searchParams.minImdb) : undefined;
  const maxImdb = searchParams.maxImdb ? parseFloat(searchParams.maxImdb) : undefined;
  const minYear = searchParams.minYear ? parseInt(searchParams.minYear) : undefined;
  const maxYear = searchParams.maxYear ? parseInt(searchParams.maxYear) : undefined;
  
  const hasFilters = minImdb || maxImdb || minYear || maxYear;
  
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
  
  // Get current year and decade
  const currentYear = new Date().getFullYear();
  const decadeStart = Math.floor(currentYear / 10) * 10;
  
  // Calculate date 6 months ago
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  // Upcoming movies (not yet released)
  const upcomingMovies = [...movies]
    .filter(m => isUpcoming(m))
    .sort((a, b) => {
      if (!a.releaseDate || !b.releaseDate) return 0;
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    })
    .slice(0, 20);
  
  // Most Recent - movies released in the last 6 months
  const mostRecentReleases = [...movies]
    .filter(m => {
      if (!m.releaseDate) return false;
      const releaseDate = new Date(m.releaseDate);
      return releaseDate <= new Date() && releaseDate >= sixMonthsAgo;
    })
    .sort((a, b) => {
      if (!a.releaseDate || !b.releaseDate) return 0;
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    })
    .slice(0, 20);
  
  // Filter movies by category
  const thisDecadeMovies = movies.filter(m => m.year && m.year >= decadeStart);
  const highestRatedIMDB = [...movies].filter(m => m.imdbRating).sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0)).slice(0, 20);
  const classicHorror = movies.filter(m => m.year && m.year < 1990);
  const slasherMovies = movies.filter(m => m.genres?.toLowerCase().includes('thriller') || m.title.toLowerCase().includes('scream') || m.title.toLowerCase().includes('halloween') || m.title.toLowerCase().includes('friday'));
  const supernaturalMovies = movies.filter(m => m.genres?.toLowerCase().includes('mystery') || m.genres?.toLowerCase().includes('fantasy'));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background atmospheric effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top gradient glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#FF6B35]/5 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-[#FF6B35]/3 rounded-full blur-[100px]" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      {/* Main Content */}
      <div className="lg:ml-12 xl:ml-20 relative z-10">
        {/* Header with Filters */}
        <Header filterSlot={<HomeFilters />} />

        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          {/* Hero background accent */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div 
              className="w-[500px] h-[500px] rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)' }}
            />
          </div>
          
          <div className="container mx-auto px-6 relative">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
                <span className="text-foreground">Know your Horror</span>
                <br />
                <span className="gradient-text">Find your Nightmare</span>
              </h2>
              <p className="text-base md:text-lg text-foreground/50 max-w-xl mx-auto leading-relaxed">
                Movies to keep you up at night
              </p>
            </div>
          </div>
        </section>
        
        {/* Active Filters Indicator */}
        {hasFilters && (
          <div className="container mx-auto px-6 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF6B35]/10 border border-[#FF6B35]/20 rounded-full text-sm text-[#FF6B35]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters active • Showing {movies.length} movies
            </div>
          </div>
        )}
        
        {/* Divider */}
        <div className="container mx-auto px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Movie Carousels */}
        <div className="py-16">
          {/* Upcoming Movies */}
          {upcomingMovies.length > 0 && (
            <MovieCarousel
              title="Upcoming"
              subtitle="Horror movies coming soon"
              movies={upcomingMovies}
              gradientColor="transparent"
            />
          )}

          {/* Most Recent - Last 6 Months */}
          {mostRecentReleases.length > 0 && (
            <MovieCarousel
              title="Most Recent"
              subtitle="Released in the last 6 months"
              movies={mostRecentReleases}
              gradientColor="#DC2626"
            />
          )}

          {/* This Decade */}
          {thisDecadeMovies.length > 0 && (
            <MovieCarousel
              title={`${decadeStart}s Horror`}
              subtitle="Modern horror from this decade"
              movies={thisDecadeMovies.slice(0, 20)}
              gradientColor="#EC4899"
            />
          )}

          {/* Highest Rated by IMDB */}
          {highestRatedIMDB.length > 0 && (
            <MovieCarousel
              title="Highest Rated"
              subtitle="Top rated horror films on IMDB"
              movies={highestRatedIMDB}
              gradientColor="#10B981"
            />
          )}

          {/* Classic Horror */}
          {classicHorror.length > 0 && (
            <MovieCarousel
              title="Classic Horror"
              subtitle="Timeless scares from before 1990"
              movies={classicHorror.slice(0, 20)}
              gradientColor="#8B5CF6"
            />
          )}

          {/* Supernatural / Mystery */}
          {supernaturalMovies.length > 0 && (
            <MovieCarousel
              title="Supernatural & Mystery"
              subtitle="Ghosts, demons, and the unexplained"
              movies={supernaturalMovies.slice(0, 20)}
              gradientColor="#3B82F6"
            />
          )}

          {/* Slashers & Thrillers */}
          {slasherMovies.length > 0 && (
            <MovieCarousel
              title="Slashers & Thrillers"
              subtitle="Edge-of-your-seat tension"
              movies={slasherMovies.slice(0, 20)}
              gradientColor="#EF4444"
            />
          )}

          {movies.length === 0 && (
            <div className="container mx-auto px-6 text-center py-20">
              <p className="text-foreground/50 text-lg mb-6">No movies match your filters</p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gradient-bg text-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Clear Filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
