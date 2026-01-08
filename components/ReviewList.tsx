import type { Rating } from "@prisma/client";

interface ReviewListProps {
  ratings: Rating[];
}

// Helper function to get color based on rating value
function getRatingColor(value: number): string {
  if (value >= 8) return "from-[#10B981] to-[#059669]"; // Green
  if (value >= 6) return "from-[#F59E0B] to-[#D97706]"; // Orange
  if (value >= 4) return "from-[#EF4444] to-[#DC2626]"; // Red
  return "from-[#6B7280] to-[#4B5563]"; // Gray
}

// Helper function to get category color
function getCategoryColor(category: string): string {
  switch (category) {
    case "Scream":
      return "from-[#EF4444] to-[#DC2626]";
    case "Psych":
      return "from-[#8B5CF6] to-[#7C3AED]";
    case "Suspense":
      return "from-[#3B82F6] to-[#2563EB]";
    default:
      return "from-white/10 to-white/5";
  }
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
        .map((rating, index) => {
          const overallScore = Math.round((rating.scream + rating.psychological + rating.suspense) / 3);
          const scoreColor = getRatingColor(overallScore);
          
          return (
            <div
              key={index}
              className="relative bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 p-6 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group"
            >
              {/* Subtle background glow */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${scoreColor} rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              {/* Header with overall score prominently displayed */}
              <div className="flex items-start justify-between mb-6 relative">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-bold text-foreground text-lg">
                      {rating.author || "Anonymous"}
                    </div>
                    <div className="h-1 w-1 rounded-full bg-foreground/30" />
                    <div className="text-xs text-foreground/40">
                      {new Date(rating.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Large, prominent overall score */}
                <div className="flex items-center gap-2 relative">
                  <div className={`bg-gradient-to-br ${scoreColor} rounded-xl px-4 py-2.5 shadow-lg`}>
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 100 100">
                        <path d="M50 5C30 5 15 22 15 42v38c0 3 2 5 4 3l6-8c2-2 5-2 7 0l6 8c2 3 5 3 7 0l5-8c2-2 5-2 7 0l5 8c2 3 5 3 7 0l6-8c2-2 5-2 7 0l6 8c2 2 4 0 4-3V42c0-20-15-37-35-37zm-12 45c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9zm24 0c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9z"/>
                      </svg>
                      <span className="text-white font-bold text-2xl leading-none">
                        {overallScore}
                      </span>
                    </div>
                    <div className="text-white/80 text-[10px] font-medium mt-0.5 text-center">
                      Overall
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual rating categories with visual emphasis */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Scream", value: rating.scream, icon: "😱" },
                  { label: "Psych", value: rating.psychological, icon: "🧠" },
                  { label: "Suspense", value: rating.suspense, icon: "⚡" }
                ].map((category) => {
                  const categoryColor = getCategoryColor(category.label);
                  const percentage = (category.value / 10) * 100;
                  
                  return (
                    <div
                      key={category.label}
                      className="relative bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all group/category"
                    >
                      {/* Category label */}
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        <span className="text-lg">{category.icon}</span>
                        <div className="text-foreground/50 text-[10px] font-semibold uppercase tracking-wider">
                          {category.label}
                        </div>
                      </div>
                      
                      {/* Large number display */}
                      <div className="text-center mb-2">
                        <div className={`text-3xl font-bold bg-gradient-to-br ${categoryColor} bg-clip-text text-transparent`}>
                          {category.value}
                        </div>
                      </div>
                      
                      {/* Visual progress bar */}
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${categoryColor} rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Review text */}
              {rating.review && (
                <div className="pt-4 border-t border-white/5">
                  <p className="text-foreground/70 whitespace-pre-wrap leading-relaxed text-sm">
                    {rating.review}
                  </p>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
