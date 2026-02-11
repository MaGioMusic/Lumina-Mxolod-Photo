// Sample property images for carousel demonstration
const samplePropertyImages = {
  property1: [
    '/images/properties/property-1.jpg',
    '/images/properties/property-2.jpg',
    '/images/properties/property-3.jpg',
    '/images/properties/property-4.jpg',
    '/images/properties/property-5.jpg'
  ],
  property2: [
    '/images/properties/property-6.jpg',
    '/images/properties/property-7.jpg',
    '/images/properties/property-8.jpg',
    '/images/properties/property-9.jpg'
  ],
  property3: [
    '/images/properties/property-10.jpg',
    '/images/properties/property-11.jpg',
    '/images/properties/property-12.jpg'
  ],
  property4: [
    '/images/properties/property-13.jpg',
    '/images/properties/property-14.jpg',
    '/images/properties/property-15.jpg',
    '/images/properties/property-1.jpg'
  ],
  property5: [
    '/images/properties/property-2.jpg',
    '/images/properties/property-3.jpg'
  ],
  property6: [
    '/images/properties/property-4.jpg',
    '/images/properties/property-5.jpg',
    '/images/properties/property-6.jpg',
    '/images/properties/property-7.jpg',
    '/images/properties/property-8.jpg'
  ]
};

// Function to get random property images
const getRandomPropertyImages = (count: number = 3): string[] => {
  const allImages = [
    '/images/properties/property-1.jpg',
    '/images/properties/property-2.jpg',
    '/images/properties/property-3.jpg',
    '/images/properties/property-4.jpg',
    '/images/properties/property-5.jpg',
    '/images/properties/property-6.jpg',
    '/images/properties/property-7.jpg',
    '/images/properties/property-8.jpg',
    '/images/properties/property-9.jpg',
    '/images/properties/property-10.jpg',
    '/images/properties/property-11.jpg',
    '/images/properties/property-12.jpg',
    '/images/properties/property-13.jpg',
    '/images/properties/property-14.jpg',
    '/images/properties/property-15.jpg'
  ];
  
  // Shuffle and return specified count
  const shuffled = [...allImages].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, allImages.length));
};

// Get images for specific property by ID
export const getPropertyImages = (propertyId: string): string[] => {
  const imageCount = Math.floor(Math.random() * 5) + 2; // 2-6 images
  return getRandomPropertyImages(imageCount);
}; 