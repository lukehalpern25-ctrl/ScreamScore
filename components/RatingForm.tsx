"use client";

import { useState } from "react";
import type { Rating } from "@prisma/client";

interface RatingFormProps {
  movieId: string;
  onSuccess?: (newRating: Rating) => void;
}

export default function RatingForm({ movieId, onSuccess }: RatingFormProps) {
  const [scream, setScream] = useState(50);
  const [psychological, setPsychological] = useState(50);
  const [suspense, setSuspense] = useState(50);
  const [review, setReview] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const spookScore = Math.round((scream + psychological + suspense) / 3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(false);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          scream,
          psychological,
          suspense,
          review: review.trim() || undefined,
          author: author.trim() || "Anonymous",
        }),
      });

      if (response.ok) {
        const newRating = await response.json();
        
        // Call the success callback with the new rating
        if (onSuccess) {
          onSuccess(newRating);
        }
        
        // Reset form
        setScream(50);
        setPsychological(50);
        setSuspense(50);
        setReview("");
        setAuthor("");
        setSuccessMessage(true);
        setErrorMessage(null);
        
        // Hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(false), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: "Failed to submit rating" }));
        setErrorMessage(errorData.error || "Failed to submit rating. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card-bg/70 backdrop-blur-sm border border-white/5 p-5 rounded-2xl space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-3 py-2 rounded-xl text-center text-sm">
          Review submitted successfully!
        </div>
      )}
      
      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-center text-sm">
          {errorMessage}
        </div>
      )}
      
      {/* Header with live spook score */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 100 100">
            <path d="M50 5C30 5 15 22 15 42v38c0 3 2 5 4 3l6-8c2-2 5-2 7 0l6 8c2 3 5 3 7 0l5-8c2-2 5-2 7 0l5 8c2 3 5 3 7 0l6-8c2-2 5-2 7 0l6 8c2 2 4 0 4-3V42c0-20-15-37-35-37zm-12 45c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9zm24 0c-4 0-8-4-8-9s4-9 8-9 8 4 8 9-4 9-8 9z"/>
          </svg>
          <span className="text-foreground font-semibold text-base">Rate the Scream Factor</span>
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-xl">{spookScore}</div>
          <div className="text-foreground/40 text-xs">Scream Score</div>
        </div>
      </div>

      {/* Scream Rating */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-foreground font-semibold text-sm">
            Scream (Jumpscares)
          </label>
          <span className="gradient-text font-bold text-base">{scream}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={scream}
          onChange={(e) => setScream(Number(e.target.value))}
          className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-[#FF6B35]"
          style={{
            background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${scream}%, rgba(255,255,255,0.1) ${scream}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-foreground/30 mt-1">
          <span>Mild</span>
          <span>Extreme</span>
        </div>
      </div>

      {/* Psychological Rating */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-foreground font-semibold text-sm">
            Psychological (Mind Fuck)
          </label>
          <span className="gradient-text font-bold text-base">{psychological}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={psychological}
          onChange={(e) => setPsychological(Number(e.target.value))}
          className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${psychological}%, rgba(255,255,255,0.1) ${psychological}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-foreground/30 mt-1">
          <span>Simple</span>
          <span>Mind-Bending</span>
        </div>
      </div>

      {/* Suspense Rating */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-foreground font-semibold text-sm">
            Suspense (Tension)
          </label>
          <span className="gradient-text font-bold text-base">{suspense}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={suspense}
          onChange={(e) => setSuspense(Number(e.target.value))}
          className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${suspense}%, rgba(255,255,255,0.1) ${suspense}%, rgba(255,255,255,0.1) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-foreground/30 mt-1">
          <span>Relaxed</span>
          <span>Edge of Seat</span>
        </div>
      </div>

      {/* Author Name */}
      <div>
        <label className="block text-foreground/70 text-xs font-medium mb-1.5">
          Your Name (Optional)
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Anonymous"
          className="w-full bg-background border border-white/5 text-foreground px-3 py-2 rounded-xl focus:border-white/20 focus:outline-none transition-colors text-sm"
        />
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-foreground/70 text-xs font-medium mb-1.5">
          Review (Optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your thoughts on how scary this movie is..."
          rows={3}
          className="w-full bg-background border border-white/5 text-foreground px-3 py-2 rounded-xl focus:border-white/20 focus:outline-none resize-none transition-colors text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full gradient-bg text-foreground font-bold py-2.5 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isSubmitting ? "Submitting..." : "Submit Scream Rating"}
      </button>
    </form>
  );
}
