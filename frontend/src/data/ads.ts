export interface HomeAd {
  id: string;
  companyName: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaText: string;
  link: string;
  type: 'image' | 'video';
}

/** Fallback banners used when the content API is unreachable or returns nothing. */
export const SAMPLE_ADS: HomeAd[] = [
  {
    id: 'ad-1',
    companyName: 'UltraTech Cement',
    title: 'Build Beautiful Homes',
    description: "The Engineer's Choice. Get 10% off on bulk orders for your next big project.",
    imageUrl:
      'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=1200&h=400',
    ctaText: 'View Offers',
    link: '#',
    type: 'image',
  },
  {
    id: 'ad-2',
    companyName: 'Local Hardware Pros',
    title: 'Premium Tools on Sale',
    description: 'Upgrade your toolkit with premium brands at 30% discount.',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/25/86236-592750692_tiny.mp4',
    ctaText: 'Shop Now',
    link: '#',
    type: 'video',
  },
  {
    id: 'ad-3',
    companyName: 'Asian Paints',
    title: 'Bring Colors to Life',
    description: 'Explore the new Royale range. Water-proof, dust-proof, and vibrant.',
    imageUrl:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=1200&h=400',
    ctaText: 'Explore Colors',
    link: '#',
    type: 'image',
  },
];
