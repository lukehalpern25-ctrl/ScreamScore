import { AmazonProduct } from "@/lib/amazon";

interface AmazonProductCardProps {
  product: AmazonProduct;
}

export default function AmazonProductCard({ product }: AmazonProductCardProps) {
  // Generate star rating display
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 >= 0.5;

  return (
    <a
      href={product.detailPageUrl}
      className="flex-shrink-0 w-[180px] group cursor-pointer block"
    >
      <div className="relative mb-3">
        {/* Product Image */}
        <div className="w-full h-[270px] bg-card-bg border border-white/5 rounded-lg overflow-hidden relative transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_0_20px_rgba(255,107,53,0.3)]">
          {/* Subtle backlighting glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF9900]/20 via-[#FF9900]/20 to-[#FF9900]/20 rounded-lg opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />

          {/* Product image */}
          <img
            src={product.imageUrl}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

          {/* Amazon badge */}
          <div className="absolute top-2 left-2 bg-[#FF9900] text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
            amazon
          </div>

          {/* Shop button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full bg-[#FF9900] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>

          {/* Price overlay on image */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background via-background/80 to-transparent">
            <span className="text-[#FF9900] font-bold text-lg">{product.displayPrice}</span>
          </div>
        </div>
      </div>

      {/* Product Info Card */}
      <div className="bg-white/[0.02] border border-white/[0.03] rounded-lg p-2.5 space-y-1.5">
        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3 h-3 ${
                  i < fullStars
                    ? "text-[#FF9900]"
                    : i === fullStars && hasHalfStar
                    ? "text-[#FF9900]/50"
                    : "text-foreground/20"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-foreground/40 text-[10px]">({product.reviewCount})</span>
        </div>

        {/* Product Title */}
        <h3 className="text-foreground font-medium text-sm line-clamp-2">
          {product.title}
        </h3>
      </div>
    </a>
  );
}
