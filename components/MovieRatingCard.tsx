"use client";

import { useMemo } from "react";
import type { Rating } from "@prisma/client";
import { useRatings } from "./RatingsStateProvider";

interface MovieRatingCardProps {
  imdbRating?: number | null;
  imdbVotes?: number | null;
}

function calculateAverages(ratings: Rating[]) {
  if (ratings.length === 0) {
    return { scream: 0, psychological: 0, suspense: 0, spookScore: 0 };
  }

  const totals = ratings.reduce(
    (acc, rating) => ({
      scream: acc.scream + rating.scream,
      psychological: acc.psychological + rating.psychological,
      suspense: acc.suspense + rating.suspense,
    }),
    { scream: 0, psychological: 0, suspense: 0 }
  );

  const count = ratings.length;
  const scream = totals.scream / count;
  const psychological = totals.psychological / count;
  const suspense = totals.suspense / count;
  const spookScore = (scream + psychological + suspense) / 3;

  return {
    scream: Math.round(scream),
    psychological: Math.round(psychological),
    suspense: Math.round(suspense),
    spookScore: Math.round(spookScore),
  };
}

export default function MovieRatingCard({ imdbRating, imdbVotes }: MovieRatingCardProps) {
  const { ratings } = useRatings();
  const averages = useMemo(() => calculateAverages(ratings), [ratings]);
  const hasRatings = ratings.length > 0;

  return (
    <div className="relative bg-gradient-to-b from-card-bg/80 via-card-bg/50 to-transparent border border-white/5 rounded-2xl p-6 mb-6 lg:mb-0 lg:flex-1 flex flex-col overflow-hidden">
      {/* Subtle accent glows */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#FF6B35]/5 rounded-full blur-3xl" />
      
      <div className="flex flex-wrap items-center gap-8 mb-6 relative">
        {/* Scream Score - White themed with ghost icon */}
        {hasRatings ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 100 100">
                <path d="M50 5C30 5 15 22 15 42v38c0 3 2 5 4 3l6-8c2-2 5-2 7 0l6 8c2 3 5 3 7 0l5-8c2-2 5-2 7 0l5 8c2 3 5 3 7 0l6-8c2-2 5-2 7 0l6 8c2 2 4 0 4-3V42c0-20-15-37-35-37zm-12 45c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9zm24 0c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9z"/>
              </svg>
            </div>
            <div>
              <div className="text-4xl font-bold text-white">{averages.spookScore}</div>
              <div className="text-foreground/50 text-xs uppercase tracking-wide">Scream Score</div>
              <div className="text-foreground/40 text-xs">{ratings.length} votes</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
              <svg className="w-7 h-7 text-foreground/30" fill="currentColor" viewBox="0 0 100 100">
                <path d="M50 5C30 5 15 22 15 42v38c0 3 2 5 4 3l6-8c2-2 5-2 7 0l6 8c2 3 5 3 7 0l5-8c2-2 5-2 7 0l5 8c2 3 5 3 7 0l6-8c2-2 5-2 7 0l6 8c2 2 4 0 4-3V42c0-20-15-37-35-37zm-12 45c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9zm24 0c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9z"/>
              </svg>
            </div>
            <div>
              <div className="text-foreground/30 text-2xl font-bold">—</div>
              <div className="text-foreground/50 text-xs uppercase tracking-wide">Scream Score</div>
              <div className="text-foreground/40 text-xs">No votes yet</div>
            </div>
          </div>
        )}

        {/* IMDB Rating - Orange themed */}
        {imdbRating && (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center border border-[#FF6B35]/20">
              <svg className="w-6 h-6 text-[#FF6B35]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div>
              <div className="text-4xl font-bold gradient-text">{imdbRating.toFixed(1)}<span className="text-xl text-foreground/50">/10</span></div>
              <div className="text-foreground/50 text-xs uppercase tracking-wide">IMDB</div>
              {imdbVotes && (
                <div className="text-foreground/40 text-xs">{imdbVotes.toLocaleString()} votes</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scream Breakdown - always show, with dashes if no ratings */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5 relative">
        <div className="text-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="text-foreground/40 text-xs mb-1">Scream</div>
          <div className={`text-2xl font-bold ${hasRatings ? 'text-foreground' : 'text-foreground/30'}`}>
            {hasRatings ? averages.scream : '—'}
          </div>
        </div>
        <div className="text-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="text-foreground/40 text-xs mb-1">Psychological</div>
          <div className={`text-2xl font-bold ${hasRatings ? 'text-foreground' : 'text-foreground/30'}`}>
            {hasRatings ? averages.psychological : '—'}
          </div>
        </div>
        <div className="text-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="text-foreground/40 text-xs mb-1">Suspense</div>
          <div className={`text-2xl font-bold ${hasRatings ? 'text-foreground' : 'text-foreground/30'}`}>
            {hasRatings ? averages.suspense : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
