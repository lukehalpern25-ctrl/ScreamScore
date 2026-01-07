import type { Rating } from "@prisma/client";

interface ReviewListProps {
  ratings: Rating[];
}

export default function ReviewList({ ratings }: ReviewListProps) {
  if (ratings.length === 0) {
    return (
      <div className="bg-card-bg border border-white/5 p-12 rounded-2xl text-center">
        <p className="text-foreground/50">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {ratings
        .slice()
        .reverse()
        .map((rating, index) => (
          <div
            key={index}
            className="bg-card-bg/70 backdrop-blur-sm border border-white/5 p-6 rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-semibold text-foreground">
                  {rating.author || "Anonymous"}
                </div>
                <div className="text-xs text-foreground/30 mt-1">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 100 100">
                  <path d="M50 5C30 5 15 22 15 42v38c0 3 2 5 4 3l6-8c2-2 5-2 7 0l6 8c2 3 5 3 7 0l5-8c2-2 5-2 7 0l5 8c2 3 5 3 7 0l6-8c2-2 5-2 7 0l6 8c2 2 4 0 4-3V42c0-20-15-37-35-37zm-12 45c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9zm24 0c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9z"/>
                </svg>
                <span className="text-white font-bold text-lg">
                  {Math.round((rating.scream + rating.psychological + rating.suspense) / 3)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-white/5">
              <div className="text-center">
                <div className="text-foreground/40 text-xs font-medium mb-1">Scream</div>
                <div className="text-foreground font-semibold">{rating.scream}</div>
              </div>
              <div className="text-center">
                <div className="text-foreground/40 text-xs font-medium mb-1">Psych</div>
                <div className="text-foreground font-semibold">{rating.psychological}</div>
              </div>
              <div className="text-center">
                <div className="text-foreground/40 text-xs font-medium mb-1">Suspense</div>
                <div className="text-foreground font-semibold">{rating.suspense}</div>
              </div>
            </div>

            {rating.review && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-foreground/70 whitespace-pre-wrap leading-relaxed">{rating.review}</p>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
