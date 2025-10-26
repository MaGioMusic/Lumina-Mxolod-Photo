export const PROPERTY_IMAGES = [
  '/images/properties/pexels-expect-best-79873-323780.jpg',
  '/images/properties/pexels-fotoaibe-1571450.jpg',
  '/images/properties/pexels-fotoaibe-1571459.jpg',
  '/images/properties/pexels-alex-staudinger-829197-1732414.jpg',
  '/images/properties/pexels-heyho-6301168.jpg',
  '/images/properties/pexels-heyho-6315802.jpg',
  '/images/properties/pexels-heyho-6492386.jpg',
  '/images/properties/pexels-heyho-6585760.jpg',
  '/images/properties/pexels-heyho-6758779.jpg',
  '/images/properties/pexels-heyho-6782576.jpg',
  '/images/properties/pexels-heyho-6903152.jpg',
  '/images/properties/pexels-heyho-6908562.jpg',
  '/images/properties/pexels-heyho-6933856.jpg',
  '/images/properties/pexels-heyho-6969863.jpg',
  '/images/properties/pexels-heyho-7045712.jpg',
  '/images/properties/pexels-heyho-7045767.jpg',
  '/images/properties/pexels-heyho-7060815.jpg',
  '/images/properties/pexels-heyho-7147367.jpg',
  '/images/properties/pexels-heyho-7545494.jpg',
  '/images/properties/pexels-heyho-7545787.jpg',
  '/images/properties/pexels-heyho-7587880.jpg',
  '/images/properties/pexels-heyho-8134746.jpg',
  '/images/properties/pexels-heyho-8134763.jpg',
  '/images/properties/pexels-heyho-8143700.jpg',
  '/images/properties/pexels-itsterrymag-2631746.jpg',
  '/images/properties/pexels-jason-boyd-1388339-3209045.jpg',
  '/images/properties/pexels-ahmetcotur-31817155.jpg',
  '/images/properties/pexels-ahmetcotur-31817157.jpg',
  '/images/properties/pexels-alexander-f-ungerer-157458816-34446595.jpg',
  '/images/properties/pexels-curtis-adams-1694007-3288103.jpg',
  '/images/properties/pexels-curtis-adams-1694007-3935333.jpg',
  '/images/properties/pexels-curtis-adams-1694007-3935350.jpg',
  '/images/properties/pexels-pixabay-259588.jpg',
  '/images/properties/pexels-ranamatloob567-34378030.jpg',
  '/images/properties/pexels-william-lemond-25283-105933.jpg',
];

export function pickPropertyImages(seed: number, count = 4): string[] {
  const arr: string[] = [];
  const len = PROPERTY_IMAGES.length;
  for (let i = 0; i < count; i++) {
    const idx = (seed * 7 + 3 + i * 5) % len;
    const candidate = PROPERTY_IMAGES[idx];
    if (!arr.includes(candidate)) arr.push(candidate);
  }
  return arr;
}


