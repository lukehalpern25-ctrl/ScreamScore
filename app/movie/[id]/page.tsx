import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovie, getSimilarMoviesByGenre } from "@/lib/movies";
import { getPosterUrl } from "@/lib/tmdb";
import MovieRatingCard from "@/components/MovieRatingCard";
import ReviewSection from "@/components/ReviewSection";
import RatingsStateProvider from "@/components/RatingsStateProvider";
import Header from "@/components/Header";
import LeaveReviewButton from "@/components/LeaveReviewButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;
  const movie = await getMovie(id);

  if (!movie) {
    notFound();
  }

  // Get similar movies by genre (already excludes current movie)
  const sidebarMovies = await getSimilarMoviesByGenre(movie.genres, movie.id, 10);
  const hasRatings = movie.ratings.length > 0;

  return (
    <div className="min-h-screen relative">
      {/* Full page background gradient */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, 
            hsl(${(movie.id.charCodeAt(0) * 137.5) % 360}, 40%, 12%) 0%,
            transparent 50%),
            radial-gradient(ellipse at top right, 
            hsl(${(movie.id.charCodeAt(0) * 137.5 + 60) % 360}, 30%, 10%) 0%,
            transparent 40%)`
        }}
      />

      {/* Header */}
      <Header rightSlot={
        <Link href="/" className="text-foreground/50 hover:text-foreground transition-colors text-sm">
          ← Back to Movies
        </Link>
      } />

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-none">
            {movie.title}
          </h2>
          <LeaveReviewButton />
        </div>
      </div>

      {/* Main Content */}
      <RatingsStateProvider initialRatings={movie.ratings}>
        <div className="relative z-10 container mx-auto px-6 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-stretch gap-6">
            {/* Left Column - Poster & Cast */}
            <div className="w-[180px] flex-shrink-0 hidden lg:flex flex-col gap-4">
            {/* Poster */}
            {movie.posterUrl ? (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover border border-white/10 rounded-xl shadow-xl"
              />
            ) : (
              <div 
                className="w-full aspect-[2/3] bg-card-bg border border-white/10 rounded-xl overflow-hidden shadow-xl"
                style={{
                  background: `linear-gradient(135deg, 
                    hsl(${(movie.id.charCodeAt(0) * 137.5) % 360}, 50%, 25%) 0%,
                    hsl(${(movie.id.charCodeAt(0) * 137.5 + 60) % 360}, 40%, 15%) 100%)`
                }}
              />
            )}

            {/* Movie Details Card */}
            <div className="relative bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-xl px-4 py-6 overflow-hidden">
              {/* Subtle accent glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FF6B35]/10 rounded-full blur-2xl" />
              
              <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-5 relative">Details</h4>
              <div className="space-y-4 relative">
                {movie.year && (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-foreground font-medium text-sm">{movie.year}</div>
                      <div className="text-foreground/40 text-[10px]">Release Year</div>
                    </div>
                  </div>
                )}
                {movie.runtime && (
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-foreground font-medium text-sm">{movie.runtime} min</div>
                      <div className="text-foreground/40 text-[10px]">Runtime</div>
                    </div>
                  </div>
                )}
                {movie.genres && (
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-foreground/40 text-[10px] mb-2">Genres</div>
                    <div className="flex flex-wrap gap-1.5">
                      {movie.genres.split(',').slice(0, 3).map((genre, idx) => (
                        <span key={idx} className="text-foreground text-xs bg-gradient-to-r from-white/10 to-white/5 px-2.5 py-1 rounded-full border border-white/10">
                          {genre.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cast & Crew Card */}
            {(movie.director || movie.parsedCast.length > 0) && (
              <div className="relative bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-xl p-4 overflow-hidden">
                {/* Subtle accent glow */}
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#FF6B35]/10 rounded-full blur-2xl" />
                
                <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-4 relative">Cast & Crew</h4>
                
                {/* Director */}
                {movie.director && (
                  <div className="mb-3 pb-3 border-b border-white/5 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                        <svg className="w-4 h-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-foreground text-sm font-medium truncate">{movie.director}</div>
                        <div className="text-foreground/40 text-[10px]">Director</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cast Members */}
                {movie.parsedCast.length > 0 && (
                  <div className="space-y-3 relative">
                    {movie.parsedCast.map((actor, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {actor.profileUrl ? (
                          <img
                            src={actor.profileUrl}
                            alt={actor.name}
                            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                            <svg className="w-4 h-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-foreground text-sm font-medium truncate">{actor.name}</div>
                          <div className="text-foreground/40 text-[10px] truncate">{actor.character}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

            {/* Middle Column - Main Info */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Trailer Section */}
              {movie.trailerUrl && (
                <div className="mb-6 aspect-video rounded-2xl overflow-hidden bg-card-bg border border-white/5">
                  <iframe
                    src={movie.trailerUrl}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Ratings Card - flex-1 to fill available space */}
              <MovieRatingCard 
                imdbRating={movie.imdbRating}
                imdbVotes={movie.imdbVotes}
              />

              {/* Description & Tagline */}
              <div className="flex-1 flex flex-col justify-end relative">
                {movie.description && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">Synopsis</h4>
                    <p className="text-foreground/70 leading-relaxed text-sm">
                      {movie.description}
                    </p>
                  </div>
                )}
                {movie.tagline && (
                  <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-white/5">
                    <p className="text-foreground/60 italic text-sm text-center">
                      "{movie.tagline}"
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column - Sidebar */}
          <div className="w-full lg:w-[200px] flex-shrink-0 flex flex-col">
            <div className="relative bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-2xl p-4 flex-1 flex flex-col overflow-hidden">
              {/* Subtle accent glow */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#FF6B35]/10 rounded-full blur-2xl" />
              
              <h3 className="text-sm font-bold text-foreground mb-3 relative">Similar Movies</h3>
              
              {sidebarMovies.length > 0 ? (
                <div className="flex-1 flex flex-col justify-between relative">
                  {sidebarMovies.map((m) => (
                    <Link key={m.id} href={`/movie/${m.id}`} className="flex items-center gap-2 group">
                      {m.posterUrl ? (
                        <img
                          src={getPosterUrl(m.posterPath, 'w185') || ''}
                          alt={m.title}
                          className="w-6 h-8 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div 
                          className="w-6 h-8 rounded flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, 
                              hsl(${(m.id.charCodeAt(0) * 137.5) % 360}, 50%, 30%) 0%,
                              hsl(${(m.id.charCodeAt(0) * 137.5 + 60) % 360}, 40%, 20%) 100%)`
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="gradient-text text-xs font-medium truncate">
                          {m.title}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-foreground/40 text-xs">No other rated movies yet</p>
              )}

              <Link 
                href="/"
                className="block mt-auto pt-4 text-center text-xs text-white hover:opacity-80 transition-opacity"
              >
                VIEW ALL →
              </Link>
            </div>
          </div>
        </div>

          {/* Reviews Section */}
          <div id="reviews" className="mt-8 border-t border-white/5 pt-8 scroll-mt-8">
            <ReviewSection movieId={movie.id} />
          </div>
        </div>
      </RatingsStateProvider>
    </div>
  );
}
