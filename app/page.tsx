import Link from "next/link";
import { getMovies, isUpcoming } from "@/lib/movies";
import MovieCarousel from "@/components/MovieCarousel";
import AmazonProductCarousel from "@/components/AmazonProductCarousel";
import { amazonProducts } from "@/lib/amazon";
import Header from "@/components/Header";
import HomeFilters from "@/components/HomeFilters";
import { testMovies } from "@/lib/testMovies";

interface HomeProps {
  searchParams: Promise<{
    minImdb?: string;
    maxImdb?: string;
    minYear?: string;
    maxYear?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  let movies = testMovies;
  
  console.log(`[Home] Step 1: Fetched ${movies.length} total movies from database`);
  
  // Filter out movies without trailers - only show movies with trailers on main page
  const beforeTrailerFilter = movies.length;
  movies = movies.filter(m => m.trailerKey);
  console.log(`[Home] Step 2: After trailer filter: ${movies.length} movies (removed ${beforeTrailerFilter - movies.length} without trailers)`);
  
  // Filter out released movies without IMDB ratings (but keep upcoming movies)
  const beforeImdbFilter = movies.length;
  movies = movies.filter(m => {
    // If it's upcoming, always show it (even without IMDB rating)
    if (isUpcoming(m)) return true;
    // If it's already released, only show if it has an IMDB rating
    return m.imdbRating !== null && m.imdbRating !== undefined;
  });
  console.log(`[Home] Step 3: After IMDB rating filter: ${movies.length} movies (removed ${beforeImdbFilter - movies.length} released movies without IMDB ratings)`);
  
  // Apply URL filter params
  const minImdb = params.minImdb ? parseFloat(params.minImdb) : undefined;
  const maxImdb = params.maxImdb ? parseFloat(params.maxImdb) : undefined;
  const minYear = params.minYear ? parseInt(params.minYear) : undefined;
  const maxYear = params.maxYear ? parseInt(params.maxYear) : undefined;
  
  const beforeUrlFilters = movies.length;
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
  if (beforeUrlFilters !== movies.length) {
    console.log(`[Home] Step 4: After URL filters: ${movies.length} movies (removed ${beforeUrlFilters - movies.length})`);
  }
  
  const hasFilters = minImdb || maxImdb || minYear || maxYear;
  
  // Calculate dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  
  // 1. Upcoming Movies (release date after today)
  const upcomingMovies = movies
    .filter(m => {
      if (!m.releaseDate) return false;
      const releaseDate = new Date(m.releaseDate);
      releaseDate.setHours(0, 0, 0, 0);
      return releaseDate > today;
    })
    .sort((a, b) => {
      if (!a.releaseDate || !b.releaseDate) return 0;
      return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
    });
  
  // 2. Recent Movies (released in last 6 months)
  const recentMovies = movies
    .filter(m => {
      if (!m.releaseDate) return false;
      const releaseDate = new Date(m.releaseDate);
      releaseDate.setHours(0, 0, 0, 0);
      return releaseDate <= today && releaseDate >= sixMonthsAgo;
    })
    .sort((a, b) => {
      if (!a.releaseDate || !b.releaseDate) return 0;
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });
  
  // 3. Highest Rated (sorted by IMDB rating)
  const highestRated = movies
    .filter(m => m.imdbRating !== null && m.imdbRating !== undefined)
    .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0));
  
  // 4. Horror Classics (movies before 1990)
  const horrorClassics = movies
    .filter(m => m.year && m.year < 1990)
    .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0));
  
  // 5. Horror by Category
  const getMoviesByCategory = (categoryName: string, genreKeywords: string[]) => {
    return movies
      .filter(m => {
        if (!m.genres) return false;
        const movieGenres = m.genres.toLowerCase();
        return genreKeywords.some(keyword => movieGenres.includes(keyword));
      })
      .sort((a, b) => (b.imdbRating || 0) - (a.imdbRating || 0))
      .slice(0, 20);
  };
  

  // Track displayed movies to prevent duplicates across carousels
  const displayedMovieIds = new Set<string>();
  
  // Helper function to filter out already displayed movies
  const getUniqueMovies = (movieList: typeof movies, maxCount: number = 20) => {
    const unique = movieList.filter(m => !displayedMovieIds.has(m.id));
    unique.slice(0, maxCount).forEach(m => displayedMovieIds.add(m.id));
    return unique.slice(0, maxCount);
  };

  // Get unique movies for each carousel (in order of priority)
  const uniqueUpcoming = getUniqueMovies(upcomingMovies, 20);
  const uniqueRecent = getUniqueMovies(recentMovies, 20);
  const uniqueHighestRated = getUniqueMovies(highestRated, 20);
  const uniqueHorrorClassics = getUniqueMovies(horrorClassics, 20);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background atmospheric effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#FF6B35]/5 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-[#FF6B35]/3 rounded-full blur-[100px]" />
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
        <Header filterSlot={<HomeFilters />} />

        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden">
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
          {/* 1. Upcoming Movies */}
          {uniqueUpcoming.length > 0 && (
            <MovieCarousel
              title="Upcoming"
              subtitle="Horror movies coming soon"
              movies={uniqueUpcoming}
              gradientColor="transparent"
            />
          )}

          {/* Amazon Affiliate Products */}
          <AmazonProductCarousel
            title="Shop Horror"
            subtitle="Horror collectibles and books"
            products={amazonProducts}
          />

          {/* 2. Recent Movies */}
          {uniqueRecent.length > 0 && (
            <MovieCarousel
              title="Recent Releases"
              subtitle="Released in the last 6 months"
              movies={uniqueRecent}
              gradientColor="#DC2626"
            />
          )}

          {/* 3. Highest Rated */}
          {uniqueHighestRated.length > 0 && (
            <MovieCarousel
              title="Highest Rated"
              subtitle="Top rated horror films on IMDB"
              movies={uniqueHighestRated}
              gradientColor="#10B981"
            />
          )}

          {/* 4. Horror Classics */}
          {uniqueHorrorClassics.length > 0 && (
            <MovieCarousel
              title="Horror Classics"
              subtitle="Timeless scares from before 1990"
              movies={uniqueHorrorClassics}
              gradientColor="#8B5CF6"
            />
          )}

           {/* 5. Supernatural & Mystery (test movies) */}
          {testMovies.filter(m => m.category === "Supernatural & Mystery").length > 0 && (
            <MovieCarousel
              title="Supernatural & Mystery"
              subtitle="Ghosts, demons, and the unexplained"
              movies={testMovies.filter(m => m.category === "Supernatural & Mystery")}
              gradientColor="#3B82F6"
            />
          )}

          {/* 6. Slashers & Thrillers (test movies) */}
          {testMovies.filter(m => m.category === "Slashers & Thrillers").length > 0 && (
            <MovieCarousel
              title="Slashers & Thrillers"
              subtitle="Edge-of-your-seat tension"
              movies={testMovies.filter(m => m.category === "Slashers & Thrillers")}
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
