# ScreamScore

A horror movie rating platform where users can rate movies based on three fear factors: Scream (jumpscares), Psychological (mind-bending impact), and Suspense (tension and heart-racing moments).

## Features

- 🎬 Browse horror movies
- ⭐ Rate movies on three dimensions: Scream, Psychological, and Suspense
- 💬 Write and read reviews
- 📊 View aggregated scores and breakdowns
- 🎨 Sleek retro design with black, white, and orange color scheme

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **In-memory storage** - Simple MVP backend (easily replaceable with a database)

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - React components
- `/lib` - Utility functions and data management

## Rating System

Each movie can be rated on three scales (0-10):

- **Scream**: Jumpscares and startle factor
- **Psychological**: Mind-bending elements and lasting psychological impact
- **Suspense**: Tension, edge-of-seat moments, and heart-racing scenes

The overall score is calculated as the average of these three ratings.

## Future Enhancements

- Database integration (PostgreSQL, MongoDB, etc.)
- User authentication
- Movie search and filtering
- Movie posters and images
- Social features (follow users, like reviews)
- Advanced statistics and charts
