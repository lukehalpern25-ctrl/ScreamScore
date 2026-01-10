// Amazon Affiliate Product Types and Data

export interface AmazonProduct {
  asin: string;
  detailPageUrl: string;
  title: string;
  imageUrl: string;
  currentPrice: number;
  displayPrice: string;
  currency: string;
  rating: number;
  reviewCount: number;
}

// Hardcoded horror-themed products for affiliate carousel
export const amazonProducts: AmazonProduct[] = [
  {
    asin: "B08P3QVXHK",
    detailPageUrl: "https://amzn.to/49wWUwi",
    title: "Horror-Themed Wordsearches",
    imageUrl: "https://images.unsplash.com/photo-1673491396472-280f3e66e08a?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    currentPrice: 5.99,
    displayPrice: "$5.99",
    currency: "USD",
    rating: 4.5,
    reviewCount: 135,
  },
  {
    asin: "B09NXVQJKL",
    detailPageUrl: "https://amzn.to/45MDjXH",
    title: "Freak Of Horror Coloring Book",
    imageUrl: "https://images.unsplash.com/photo-1494376877685-d3d2559d4f82?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    currentPrice: 5.90,
    displayPrice: "$5.90",
    currency: "USD",
    rating: 4.3,
    reviewCount: 58,
  },
  {
    asin: "B0CLM8XYZP",
    detailPageUrl: "https://amzn.to/49wizEP",
    title: "Horror Coloring Book for Adults",
    imageUrl: "https://images.unsplash.com/photo-1526547462705-121430d02c2c?q=80&w=986&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    currentPrice: 4.90,
    displayPrice: "$4.90",
    currency: "USD",
    rating: 5.0,
    reviewCount: 1,
  },
  {
    asin: "B0DPQRST12",
    detailPageUrl: "https://amzn.to/4pCuXt1",
    title: "Beetlejuice Phunny Plush - Scary Adam",
    imageUrl: "https://images.unsplash.com/photo-1584858820878-ca1d45fb15b6?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    currentPrice: 7.01,
    displayPrice: "$7.01",
    currency: "USD",
    rating: 4.8,
    reviewCount: 143,
  },
];
