import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-bold gradient-text mb-6">404</h1>
        <h2 className="text-3xl font-bold text-foreground mb-4">Movie Not Found</h2>
        <p className="text-foreground/50 mb-8 text-lg">The movie you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gradient-bg text-foreground font-bold py-4 px-8 rounded-full hover:opacity-90 transition-opacity"
        >
          Back to Movies
        </Link>
      </div>
    </div>
  );
}
