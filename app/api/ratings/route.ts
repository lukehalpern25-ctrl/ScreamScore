import { NextRequest, NextResponse } from "next/server";
import { addRating } from "@/lib/movies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { movieId, scream, psychological, suspense, review, author } = body;

    console.log("Rating submission received:", { movieId, scream, psychological, suspense });

    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    if (
      scream === undefined ||
      psychological === undefined ||
      suspense === undefined
    ) {
      return NextResponse.json(
        { error: "All rating values are required" },
        { status: 400 }
      );
    }

    // Validate rating ranges
    if (scream < 1 || scream > 100 || psychological < 1 || psychological > 100 || suspense < 1 || suspense > 100) {
      return NextResponse.json(
        { error: "Rating values must be between 1 and 100" },
        { status: 400 }
      );
    }

    const rating = await addRating({
      movieId,
      scream: Number(scream),
      psychological: Number(psychological),
      suspense: Number(suspense),
      review: review?.trim() || undefined,
      author: author?.trim() || "Anonymous",
    });

    console.log("Rating created successfully:", rating.id);

    // Return the rating object directly for live updates
    return NextResponse.json(rating, { status: 201 });
  } catch (error) {
    console.error("Error adding rating:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to add rating: ${errorMessage}` },
      { status: 500 }
    );
  }
}
