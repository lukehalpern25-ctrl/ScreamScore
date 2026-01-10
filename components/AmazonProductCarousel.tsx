"use client";

import { useRef, useState } from "react";
import { AmazonProduct } from "@/lib/amazon";
import AmazonProductCard from "./AmazonProductCard";

interface AmazonProductCarouselProps {
  title: string;
  subtitle?: string;
  products: AmazonProduct[];
}

export default function AmazonProductCarousel({
  title,
  subtitle,
  products,
}: AmazonProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="mb-20 relative">
      {/* Subtle section glow - Amazon orange themed */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[120px] pointer-events-none opacity-[0.10]"
        style={{ backgroundColor: "#FF9900" }}
      />

      {/* Section Header */}
      <div className="mb-8 relative">
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {title}
              </h2>
              {/* Amazon affiliate badge */}
              <span className="text-[10px] text-foreground/30 bg-white/5 px-2 py-0.5 rounded">
                Affiliate
              </span>
            </div>
            {subtitle && (
              <p className="text-foreground/40 text-xs md:text-sm mt-1">
                {subtitle}
              </p>
            )}
            <p className="text-foreground/30 text-[10px] mt-1">
              We earn commission from purchases made through these links
            </p>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className={`absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card-bg/90 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-card-bg hover:border-white/20 transition-all shadow-lg ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Scroll left"
        >
          <svg
            className="w-6 h-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => scroll("right")}
          className={`absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-card-bg/90 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-card-bg hover:border-white/20 transition-all shadow-lg ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label="Scroll right"
        >
          <svg
            className="w-6 h-6 text-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-6 pb-4 snap-x snap-mandatory"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
          }}
        >
          {products.map((product) => (
            <div key={product.asin} className="snap-start">
              <AmazonProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="mt-20 px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </section>
  );
}
