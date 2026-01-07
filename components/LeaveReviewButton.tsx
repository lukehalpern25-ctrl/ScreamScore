"use client";

export default function LeaveReviewButton() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const reviewsSection = document.getElementById('reviews');
    if (reviewsSection) {
      // First, trigger the form to show
      const event = new CustomEvent('showReviewForm');
      window.dispatchEvent(event);
      
      // Wait for the form to render, then calculate scroll position
      setTimeout(() => {
        // Find the form element
        const form = reviewsSection.querySelector('form');
        if (form) {
          const headerHeight = 80; // Approximate sticky header height
          const formRect = form.getBoundingClientRect();
          const formTop = formRect.top + window.pageYOffset;
          const viewportHeight = window.innerHeight;
          const formHeight = formRect.height;
          
          // Calculate scroll position to center the form in the viewport (accounting for header)
          // We want the form to be fully visible, so position it so it fits in the viewport
          const availableHeight = viewportHeight - headerHeight;
          const scrollPosition = formTop - headerHeight - (availableHeight - formHeight) / 2;
          
          window.scrollTo({
            top: Math.max(0, scrollPosition),
            behavior: 'smooth'
          });
        } else {
          // Fallback: scroll to reviews section if form not found
          const elementPosition = reviewsSection.getBoundingClientRect().top + window.pageYOffset;
          const headerHeight = 80;
          window.scrollTo({
            top: elementPosition - headerHeight - 100,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  return (
    <a
      href="#reviews"
      onClick={handleClick}
      className="gradient-bg text-foreground font-medium px-6 py-2.5 rounded-full transition-all duration-300 text-sm hover:shadow-[0_0_30px_rgba(255,107,53,0.8)] hover:scale-105"
    >
      ✍️ Leave a Review
    </a>
  );
}
