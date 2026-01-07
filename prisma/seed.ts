import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NmY5NWZhZTE0OTA2MjkxODM5NTE0YzMxNjhiY2NhOSIsIm5iZiI6MTc2NzY3MzgzNi4yMTksInN1YiI6IjY5NWM4ZmVjNDRhODYyMTE2N2RkMDViZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c-1uL5xmQPMvlM3CA8XLdgo8HiNqMtjdB5V4h7awBuA';
const OMDB_API_KEY = '627440d7';

// Fetch IMDB ratings from OMDB
async function fetchOMDBRatings(imdbId: string) {
  try {
    const res = await fetch(`http://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    const data = await res.json();
    
    if (data.Response === 'False') {
      console.log(`   ⚠️  OMDB: ${data.Error}`);
      return null;
    }
    
    return {
      imdbRating: data.imdbRating && data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,
      imdbVotes: data.imdbVotes && data.imdbVotes !== 'N/A' ? parseInt(data.imdbVotes.replace(/,/g, '')) : null,
    };
  } catch (error) {
    console.log(`   ⚠️  OMDB fetch failed`);
    return null;
  }
}

// Fetch movie data from TMDB
async function fetchTMDBMovie(tmdbId: number) {
  const [detailsRes, videosRes, creditsRes] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?language=en-US`, {
      headers: { 'Authorization': `Bearer ${TMDB_API_KEY}` }
    }),
    fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/videos?language=en-US`, {
      headers: { 'Authorization': `Bearer ${TMDB_API_KEY}` }
    }),
    fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/credits?language=en-US`, {
      headers: { 'Authorization': `Bearer ${TMDB_API_KEY}` }
    })
  ]);

  const details = await detailsRes.json();
  const videos = await videosRes.json();
  const credits = await creditsRes.json();

  // Find trailer
  const trailer = videos.results?.find(
    (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  // Get director
  const director = credits.crew?.find((c: any) => c.job === 'Director')?.name || null;

  // Get top 2 cast members
  const topCast = credits.cast?.slice(0, 2).map((c: any) => ({
    name: c.name,
    character: c.character,
    profilePath: c.profile_path,
  })) || [];

  return {
    tmdbId: details.id,
    title: details.title,
    year: details.release_date ? parseInt(details.release_date.split('-')[0]) : null,
    description: details.overview,
    tagline: details.tagline || null,
    runtime: details.runtime || null,
    posterPath: details.poster_path,
    backdropPath: details.backdrop_path,
    trailerKey: trailer?.key || null,
    genres: details.genres?.map((g: any) => g.name).join(',') || null,
    imdbId: details.imdb_id || null,
    tmdbRating: details.vote_average,
    tmdbVotes: details.vote_count,
    director,
    cast: JSON.stringify(topCast),
  };
}

// Horror movies to seed with TMDB IDs and sample ratings
const SEED_MOVIES = [
  {
    tmdbId: 694, // The Shining
    ratings: [
      { scream: 65, psychological: 95, suspense: 88, movieQuality: 95, author: "HorrorFan", review: "Kubrick's masterpiece. The psychological terror builds slowly but never lets go." },
      { scream: 70, psychological: 92, suspense: 85, movieQuality: 90, author: "FilmCritic", review: "Jack Nicholson delivers an unforgettable performance." },
    ],
  },
  {
    tmdbId: 493922, // Hereditary
    ratings: [
      { scream: 80, psychological: 98, suspense: 90, movieQuality: 92, author: "ScreamQueen", review: "The most disturbing film I've seen in years. Toni Collette deserved an Oscar." },
      { scream: 75, psychological: 95, suspense: 88, movieQuality: 88, author: "NightOwl", review: "This one stayed with me for weeks." },
    ],
  },
  {
    tmdbId: 9552, // The Exorcist
    ratings: [
      { scream: 70, psychological: 92, suspense: 85, movieQuality: 95, author: "ClassicHorror", review: "The original that started it all. Still terrifying after 50 years." },
    ],
  },
  {
    tmdbId: 377, // A Nightmare on Elm Street
    ratings: [
      { scream: 85, psychological: 75, suspense: 80, movieQuality: 85, author: "80sKid", review: "Freddy Krueger is the ultimate horror villain. Robert Englund is iconic." },
      { scream: 90, psychological: 70, suspense: 75, movieQuality: 80, author: "SlasherFan", review: "The kills are creative and the concept is genius." },
    ],
  },
  {
    tmdbId: 539, // Psycho
    ratings: [
      { scream: 60, psychological: 90, suspense: 92, movieQuality: 98, author: "Cinephile", review: "Hitchcock invented modern horror with this film." },
    ],
  },
  {
    tmdbId: 419430, // Get Out
    ratings: [
      { scream: 55, psychological: 95, suspense: 88, movieQuality: 94, author: "ModernHorror", review: "Jordan Peele's directorial debut is a masterclass in social horror." },
      { scream: 60, psychological: 92, suspense: 85, movieQuality: 90, author: "ThinkPiece", review: "Horror that makes you think. Brilliant commentary." },
    ],
  },
  {
    tmdbId: 530385, // Midsommar
    ratings: [
      { scream: 40, psychological: 98, suspense: 75, movieQuality: 88, author: "ArtHouse", review: "Ari Aster's folk horror is beautiful and deeply unsettling." },
    ],
  },
  {
    tmdbId: 310131, // The Witch
    ratings: [
      { scream: 45, psychological: 88, suspense: 82, movieQuality: 90, author: "SlowBurn", review: "A slow burn that rewards patience with pure dread." },
      { scream: 50, psychological: 85, suspense: 80, movieQuality: 85, author: "PeriodPiece", review: "The atmosphere is incredible. Black Phillip haunts my dreams." },
    ],
  },
  {
    tmdbId: 1091, // The Thing
    ratings: [
      { scream: 85, psychological: 80, suspense: 92, movieQuality: 95, author: "PracticalFX", review: "The practical effects still hold up. Peak body horror." },
      { scream: 80, psychological: 78, suspense: 95, movieQuality: 92, author: "Paranoia", review: "The paranoia and tension are unmatched." },
    ],
  },
  {
    tmdbId: 4232, // Scream (1996)
    ratings: [
      { scream: 82, psychological: 60, suspense: 85, movieQuality: 88, author: "MetaHorror", review: "Wes Craven reinvented the slasher genre with this self-aware masterpiece." },
    ],
  },
];

async function main() {
  console.log("🎬 Seeding ScreamScore database with live TMDB data...\n");

  for (const seedMovie of SEED_MOVIES) {
    // Check if movie already exists
    const existing = await prisma.movie.findUnique({
      where: { tmdbId: seedMovie.tmdbId },
    });

    if (existing) {
      console.log(`⏭️  Skipping TMDB ID ${seedMovie.tmdbId} (already exists as "${existing.title}")`);
      continue;
    }

    try {
      // Fetch live data from TMDB
      console.log(`📡 Fetching TMDB ID ${seedMovie.tmdbId}...`);
      const tmdbData = await fetchTMDBMovie(seedMovie.tmdbId);

      // Fetch IMDB ratings from OMDB if we have an IMDB ID
      let imdbData = null;
      if (tmdbData.imdbId) {
        console.log(`   🎬 Fetching IMDB ratings for ${tmdbData.imdbId}...`);
        imdbData = await fetchOMDBRatings(tmdbData.imdbId);
      }

      // Create movie with both TMDB and IMDB data
      const createdMovie = await prisma.movie.create({
        data: {
          ...tmdbData,
          imdbRating: imdbData?.imdbRating ?? null,
          imdbVotes: imdbData?.imdbVotes ?? null,
        },
      });

      console.log(`🎥 Created: ${tmdbData.title} (${tmdbData.year})`);
      console.log(`   📸 Poster: ${tmdbData.posterPath ? '✓' : '✗'}`);
      console.log(`   ⭐ IMDB: ${imdbData?.imdbRating ? `${imdbData.imdbRating}/10` : '✗'}`);

      // Add ratings
      for (const rating of seedMovie.ratings) {
        await prisma.rating.create({
          data: {
            ...rating,
            movieId: createdMovie.id,
          },
        });
      }
      console.log(`   ⭐ Added ${seedMovie.ratings.length} rating(s)`);

      // Small delay to be nice to TMDB API
      await new Promise(resolve => setTimeout(resolve, 250));

    } catch (error) {
      console.error(`❌ Failed to fetch TMDB ID ${seedMovie.tmdbId}:`, error);
    }
  }

  console.log("\n✅ Seeding complete!");

  // Count totals
  const movieCount = await prisma.movie.count();
  const ratingCount = await prisma.rating.count();
  console.log(`\n📊 Database now contains:`);
  console.log(`   🎬 ${movieCount} movies`);
  console.log(`   ⭐ ${ratingCount} ratings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
