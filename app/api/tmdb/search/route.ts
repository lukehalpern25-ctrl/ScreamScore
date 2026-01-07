import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NmY5NWZhZTE0OTA2MjkxODM5NTE0YzMxNjhiY2NhOSIsIm5iZiI6MTc2NzY3MzgzNi4yMTksInN1YiI6IjY5NWM4ZmVjNDRhODYyMTE2N2RkMDViZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c-1uL5xmQPMvlM3CA8XLdgo8HiNqMtjdB5V4h7awBuA';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query.trim())}&include_adult=false&language=en-US&page=1`,
      {
        headers: {
          'Authorization': `Bearer ${TMDB_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return top 10 results
    return NextResponse.json({
      results: data.results?.slice(0, 10) || [],
    });
  } catch (error) {
    console.error("TMDB search error:", error);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
