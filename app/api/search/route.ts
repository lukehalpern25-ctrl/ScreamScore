import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/movies";
import { getPosterUrl } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ movies: [] });
  }

  try {
    const movies = await searchMovies(query.trim());
    
    // Return simplified movie data for the dropdown
    const results = movies.slice(0, 8).map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.year,
      posterUrl: movie.posterPath ? getPosterUrl(movie.posterPath, "w185") : null,
    }));

    return NextResponse.json({ movies: results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ movies: [] }, { status: 500 });
  }
}
