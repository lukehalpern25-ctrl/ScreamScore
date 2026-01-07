"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Rating } from "@prisma/client";

interface RatingsContextType {
  ratings: Rating[];
  addRating: (rating: Rating) => void;
}

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function useRatings() {
  const context = useContext(RatingsContext);
  if (!context) {
    throw new Error("useRatings must be used within RatingsStateProvider");
  }
  return context;
}

interface RatingsStateProviderProps {
  children: ReactNode;
  initialRatings: Rating[];
}

export default function RatingsStateProvider({
  children,
  initialRatings,
}: RatingsStateProviderProps) {
  const [ratings, setRatings] = useState<Rating[]>(initialRatings);

  const addRating = (newRating: Rating) => {
    setRatings(prev => [newRating, ...prev]);
  };

  return (
    <RatingsContext.Provider value={{ ratings, addRating }}>
      {children}
    </RatingsContext.Provider>
  );
}
