import { NextRequest, NextResponse } from "next/server";
import { createMovie, importMovieFromTmdb, getMovies } from "@/lib/movies";

export async function GET() {
  try {
    const movies = await getMovies();
    return NextResponse.json(movies);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, year, description, tmdbId } = body;

    // If TMDB ID is provided, import from TMDB
    if (tmdbId) {
      const movie = await importMovieFromTmdb(Number(tmdbId));
      return NextResponse.json(movie, { status: 201 });
    }

    // Otherwise create manually
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const movie = await createMovie({
      title: title.trim(),
      year: year ? Number(year) : undefined,
      description: description?.trim(),
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error("Error adding movie:", error);
    return NextResponse.json(
      { error: "Failed to add movie" },
      { status: 500 }
    );
  }
}
