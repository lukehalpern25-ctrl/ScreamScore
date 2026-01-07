import Link from "next/link";
import { MovieWithAverages, isUpcoming } from "@/lib/movies";

interface MoviePosterCardProps {
  movie: MovieWithAverages;
}

function formatReleaseDate(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MoviePosterCard({ movie }: MoviePosterCardProps) {
  const hasRatings = movie.ratings.length > 0;
  const upcoming = isUpcoming(movie);

  return (
    <Link href={`/movie/${movie.id}`} className="flex-shrink-0 w-[180px] group cursor-pointer block">
      <div className="relative mb-3">
        {/* Poster */}
        <div className="w-full h-[270px] bg-card-bg border border-white/5 rounded-lg overflow-hidden relative transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]">
          {/* Subtle backlighting glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF6B35]/20 via-[#FFA500]/20 to-[#FF6B35]/20 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
          
          {/* Poster image or placeholder gradient */}
          {movie.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div 
              className="absolute inset-0 bg-gradient-to-br"
              style={{
                background: `linear-gradient(135deg, 
                  hsl(${(movie.id.charCodeAt(0) * 137.5) % 360}, 70%, 40%) 0%,
                  hsl(${(movie.id.charCodeAt(0) * 137.5 + 60) % 360}, 60%, 30%) 100%)`
              }}
            />
          )}
          
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <svg className="w-4 h-4 text-background ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Year overlay on poster */}
          {movie.year && (
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background via-background/80 to-transparent">
              <span className="text-white/70 text-xs">{movie.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Rating Info Card */}
      <div className="bg-white/[0.02] border border-white/[0.03] rounded-lg p-2.5 space-y-1.5">
        {upcoming ? (
          /* Coming Soon - Show release date */
          <div className="text-center py-1">
            <div className="text-[#FF6B35] text-xs font-semibold mb-0.5">Coming to theaters</div>
            {movie.releaseDate && (
              <div className="text-foreground/60 text-[10px]">
                {formatReleaseDate(movie.releaseDate)}
              </div>
            )}
          </div>
        ) : (
          /* Released - Show ratings */
          <>
            {/* Main Ratings Row - Scream Score first, then IMDB */}
            <div className="flex items-center gap-3">
              {/* Scream Score - White themed */}
              {hasRatings ? (
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-md px-2 py-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 100 100">
                    <path d="M50 5C30 5 15 22 15 42v38c0 3 2 5 4 3l6-8c2-2 5-2 7 0l6 8c2 3 5 3 7 0l5-8c2-2 5-2 7 0l5 8c2 3 5 3 7 0l6-8c2-2 5-2 7 0l6 8c2 2 4 0 4-3V42c0-20-15-37-35-37zm-12 45c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9zm24 0c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9z"/>
                  </svg>
                  <span className="text-white font-bold text-sm">{movie.averages.spookScore}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-white/[0.03] rounded-md px-2 py-0.5">
                  <svg className="w-3 h-3 text-foreground/30" fill="currentColor" viewBox="0 0 100 100">
                    <path d="M50 5C30 5 15 22 15 42v38c0 3 2 5 4 3l6-8c2-2 5-2 7 0l6 8c2 3 5 3 7 0l5-8c2-2 5-2 7 0l5 8c2 3 5 3 7 0l6-8c2-2 5-2 7 0l6 8c2 2 4 0 4-3V42c0-20-15-37-35-37zm-12 45c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9zm24 0c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9z"/>
                  </svg>
                  <span className="text-foreground/30 font-bold text-sm">—</span>
                </div>
              )}
              {/* IMDB Rating - Orange themed with clapperboard icon */}
              {movie.imdbRating && (
                <div className="flex items-center gap-1 bg-[#FF6B35]/5 rounded-md px-2 py-0.5">
                  <svg className="w-3 h-3 text-[#FF6B35]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zM6 7h2v2H6zm0 4h2v2H6zm0 4h2v2H6zm4-8h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8z"/>
                  </svg>
                  <span className="gradient-text font-bold text-sm">{movie.imdbRating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Movie Title */}
        <h3 className="text-foreground font-medium text-sm line-clamp-1">
          {movie.title}
        </h3>
      </div>
    </Link>
  );
}
