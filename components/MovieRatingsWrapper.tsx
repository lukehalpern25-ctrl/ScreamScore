"use client";

import { useState } from "react";
import type { Rating } from "@prisma/client";
import MovieRatingCard from "./MovieRatingCard";
import ReviewSection from "./ReviewSection";

interface MovieRatingsWrapperProps {
  movieId: string;
  initialRatings: Rating[];
  imdbRating?: number | null;
  imdbVotes?: number | null;
}

export default function MovieRatingsWrapper({
  movieId,
  initialRatings,
  imdbRating,
  imdbVotes,
}: MovieRatingsWrapperProps) {
  const [ratings, setRatings] = useState<Rating[]>(initialRatings);

  const handleNewRating = (newRating: Rating) => {
    // Add the new rating to the list
    setRatings(prev => [newRating, ...prev]);
  };

  return (
    <>
      {/* Rating Card */}
      <MovieRatingCard 
        ratings={ratings} 
        imdbRating={imdbRating}
        imdbVotes={imdbVotes}
      />

      {/* Review Section */}
      <ReviewSection 
        movieId={movieId} 
        ratings={ratings}
        onRatingAdded={handleNewRating}
      />
    </>
  );
}
