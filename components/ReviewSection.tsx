"use client";

import { useState, useEffect } from "react";
import type { Rating } from "@prisma/client";
import RatingForm from "./RatingForm";
import ReviewList from "./ReviewList";
import { useRatings } from "./RatingsStateProvider";

interface ReviewSectionProps {
  movieId: string;
}

export default function ReviewSection({ movieId }: ReviewSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const { ratings, addRating } = useRatings();

  // Listen for the custom event to show the form
  useEffect(() => {
    const handleShowForm = () => {
      setShowForm(true);
    };
    
    window.addEventListener('showReviewForm', handleShowForm);
    return () => {
      window.removeEventListener('showReviewForm', handleShowForm);
    };
  }, []);

  const handleNewRating = (newRating: Rating) => {
    addRating(newRating);
    // Close the form after successful submission
    setShowForm(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-foreground">
          Reviews ({ratings.length})
        </h3>
        {showForm && (
          <button
            onClick={() => setShowForm(false)}
            className="text-foreground/50 hover:text-foreground transition-colors text-sm"
          >
            Hide Form
          </button>
        )}
      </div>

      {/* Rating Form */}
      {showForm && (
        <div className="mb-8">
          <RatingForm movieId={movieId} onSuccess={handleNewRating} />
        </div>
      )}

      {/* Reviews List */}
      <ReviewList ratings={ratings} />
    </div>
  );
}
