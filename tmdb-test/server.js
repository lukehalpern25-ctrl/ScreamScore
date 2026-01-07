import express from 'express';

const app = express();
const PORT = 3002;

// TMDB API Configuration
const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NmY5NWZhZTE0OTA2MjkxODM5NTE0YzMxNjhiY2NhOSIsIm5iZiI6MTc2NzY3MzgzNi4yMTksInN1YiI6IjY5NWM4ZmVjNDRhODYyMTE2N2RkMDViZCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.c-1uL5xmQPMvlM3CA8XLdgo8HiNqMtjdB5V4h7awBuA';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Helper function to make TMDB API requests
async function tmdbFetch(endpoint) {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${TMDB_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

// Test endpoint - Search for a movie
app.get('/search', async (req, res) => {
  const query = req.query.q || 'The Shining';
  
  try {
    const data = await tmdbFetch(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`);
    
    console.log('\n=== SEARCH RESULTS ===');
    console.log(`Query: "${query}"`);
    console.log(`Total Results: ${data.total_results}`);
    console.log('\nFirst 5 Results:');
    
    const results = data.results.slice(0, 5).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date?.split('-')[0],
      overview: movie.overview?.substring(0, 100) + '...',
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
      vote_average: movie.vote_average,
    }));
    
    results.forEach((m, i) => {
      console.log(`\n${i + 1}. ${m.title} (${m.year}) - ID: ${m.id}`);
      console.log(`   Rating: ${m.vote_average}/10`);
      console.log(`   Poster: ${m.poster_path}`);
    });
    
    res.json({
      query,
      total_results: data.total_results,
      results,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint - Get movie details
app.get('/movie/:id', async (req, res) => {
  const movieId = req.params.id;
  
  try {
    const data = await tmdbFetch(`/movie/${movieId}?language=en-US`);
    
    console.log('\n=== MOVIE DETAILS ===');
    console.log(`Title: ${data.title}`);
    console.log(`Year: ${data.release_date?.split('-')[0]}`);
    console.log(`Runtime: ${data.runtime} min`);
    console.log(`Genres: ${data.genres?.map(g => g.name).join(', ')}`);
    console.log(`Overview: ${data.overview?.substring(0, 150)}...`);
    
    const movie = {
      id: data.id,
      title: data.title,
      tagline: data.tagline,
      year: data.release_date?.split('-')[0],
      release_date: data.release_date,
      runtime: data.runtime,
      genres: data.genres?.map(g => g.name),
      overview: data.overview,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      poster_path: data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : null,
      backdrop_path: data.backdrop_path ? `${TMDB_IMAGE_BASE}/original${data.backdrop_path}` : null,
      imdb_id: data.imdb_id,
    };
    
    res.json(movie);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint - Get movie videos (trailers)
app.get('/movie/:id/videos', async (req, res) => {
  const movieId = req.params.id;
  
  try {
    const data = await tmdbFetch(`/movie/${movieId}/videos?language=en-US`);
    
    console.log('\n=== MOVIE VIDEOS ===');
    console.log(`Movie ID: ${movieId}`);
    console.log(`Total Videos: ${data.results?.length || 0}`);
    
    const videos = data.results?.map(video => ({
      id: video.id,
      key: video.key,
      name: video.name,
      type: video.type,
      site: video.site,
      official: video.official,
      // YouTube embed URL
      embed_url: video.site === 'YouTube' ? `https://www.youtube.com/embed/${video.key}` : null,
      // YouTube thumbnail
      thumbnail: video.site === 'YouTube' ? `https://img.youtube.com/vi/${video.key}/hqdefault.jpg` : null,
    })) || [];
    
    // Filter for trailers
    const trailers = videos.filter(v => v.type === 'Trailer');
    
    console.log('\nTrailers:');
    trailers.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name}`);
      console.log(`   Embed: ${t.embed_url}`);
      console.log(`   Thumbnail: ${t.thumbnail}`);
    });
    
    res.json({
      movie_id: movieId,
      all_videos: videos,
      trailers,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint - Get movie images (posters & backdrops)
app.get('/movie/:id/images', async (req, res) => {
  const movieId = req.params.id;
  
  try {
    const data = await tmdbFetch(`/movie/${movieId}/images`);
    
    console.log('\n=== MOVIE IMAGES ===');
    console.log(`Movie ID: ${movieId}`);
    console.log(`Posters: ${data.posters?.length || 0}`);
    console.log(`Backdrops: ${data.backdrops?.length || 0}`);
    
    const posters = data.posters?.slice(0, 5).map(img => ({
      file_path: img.file_path,
      width: img.width,
      height: img.height,
      url_small: `${TMDB_IMAGE_BASE}/w185${img.file_path}`,
      url_medium: `${TMDB_IMAGE_BASE}/w500${img.file_path}`,
      url_large: `${TMDB_IMAGE_BASE}/original${img.file_path}`,
    })) || [];
    
    const backdrops = data.backdrops?.slice(0, 5).map(img => ({
      file_path: img.file_path,
      width: img.width,
      height: img.height,
      url_small: `${TMDB_IMAGE_BASE}/w300${img.file_path}`,
      url_medium: `${TMDB_IMAGE_BASE}/w780${img.file_path}`,
      url_large: `${TMDB_IMAGE_BASE}/original${img.file_path}`,
    })) || [];
    
    console.log('\nSample Poster URLs:');
    posters.slice(0, 2).forEach((p, i) => {
      console.log(`${i + 1}. ${p.url_medium}`);
    });
    
    res.json({
      movie_id: movieId,
      posters,
      backdrops,
      image_sizes: {
        poster: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
        backdrop: ['w300', 'w780', 'w1280', 'original'],
      },
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint - Get popular horror movies
app.get('/horror/popular', async (req, res) => {
  try {
    // Genre ID 27 = Horror
    const data = await tmdbFetch('/discover/movie?with_genres=27&sort_by=popularity.desc&language=en-US&page=1');
    
    console.log('\n=== POPULAR HORROR MOVIES ===');
    console.log(`Total Results: ${data.total_results}`);
    
    const movies = data.results.slice(0, 10).map(movie => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date?.split('-')[0],
      overview: movie.overview?.substring(0, 100) + '...',
      poster_path: movie.poster_path ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}` : null,
      backdrop_path: movie.backdrop_path ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}` : null,
      vote_average: movie.vote_average,
      popularity: movie.popularity,
    }));
    
    console.log('\nTop 10:');
    movies.forEach((m, i) => {
      console.log(`${i + 1}. ${m.title} (${m.year}) - ${m.vote_average}/10`);
    });
    
    res.json({
      total_results: data.total_results,
      movies,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Homepage with test links
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>TMDB API Test</title>
      <style>
        body { font-family: system-ui; background: #0a0a0a; color: #fff; padding: 40px; }
        h1 { color: #FF6B35; }
        a { color: #FFA500; display: block; margin: 10px 0; }
        code { background: #1a1a1a; padding: 2px 8px; border-radius: 4px; }
        .section { margin: 30px 0; padding: 20px; background: #1a1a1a; border-radius: 8px; }
      </style>
    </head>
    <body>
      <h1>🎬 TMDB API Test Server</h1>
      <p>Test endpoints for TMDB API integration</p>
      
      <div class="section">
        <h2>Search Movies</h2>
        <a href="/search?q=The%20Shining">/search?q=The Shining</a>
        <a href="/search?q=Hereditary">/search?q=Hereditary</a>
        <a href="/search?q=The%20Exorcist">/search?q=The Exorcist</a>
      </div>
      
      <div class="section">
        <h2>Movie Details</h2>
        <p>Get details by TMDB ID:</p>
        <a href="/movie/694">/movie/694 (The Shining)</a>
        <a href="/movie/493922">/movie/493922 (Hereditary)</a>
        <a href="/movie/9552">/movie/9552 (The Exorcist)</a>
      </div>
      
      <div class="section">
        <h2>Movie Videos (Trailers)</h2>
        <a href="/movie/694/videos">/movie/694/videos (The Shining)</a>
        <a href="/movie/493922/videos">/movie/493922/videos (Hereditary)</a>
      </div>
      
      <div class="section">
        <h2>Movie Images (Posters & Backdrops)</h2>
        <a href="/movie/694/images">/movie/694/images (The Shining)</a>
        <a href="/movie/493922/images">/movie/493922/images (Hereditary)</a>
      </div>
      
      <div class="section">
        <h2>Discover Horror</h2>
        <a href="/horror/popular">/horror/popular</a>
      </div>
      
      <div class="section">
        <h2>Image URL Formats</h2>
        <p>Poster sizes: <code>w92, w154, w185, w342, w500, w780, original</code></p>
        <p>Backdrop sizes: <code>w300, w780, w1280, original</code></p>
        <p>Base URL: <code>https://image.tmdb.org/t/p/{size}{file_path}</code></p>
      </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`\n🎬 TMDB API Test Server running at http://localhost:${PORT}`);
  console.log('\nTest endpoints:');
  console.log('  GET /                    - Homepage with links');
  console.log('  GET /search?q=movie      - Search for movies');
  console.log('  GET /movie/:id           - Get movie details');
  console.log('  GET /movie/:id/videos    - Get movie trailers');
  console.log('  GET /movie/:id/images    - Get movie posters/backdrops');
  console.log('  GET /horror/popular      - Get popular horror movies');
});
