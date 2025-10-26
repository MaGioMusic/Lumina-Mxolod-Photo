'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  onImageChange?: (index: number) => void;
}

export default function PropertyImageCarousel({
  images,
  alt,
  className = '',
  onImageChange
}: PropertyImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Fix hydration issue
  useEffect(() => {
    setIsMounted(true);
    // Initialize loaded images array
    setLoadedImages(new Array(images.length).fill(false));
  }, [images.length]);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Handle image loading for current image
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  }, []);

  // Observe visibility to limit preloading when offscreen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      setInView(entries[0]?.isIntersecting ?? false);
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Preload only current and next when in view
  useEffect(() => {
    if (!inView) return;
    const targets = [currentIndex, (currentIndex + 1) % images.length];
    targets.forEach((idx) => {
      const src = images[idx];
      const img = new Image();
      img.onload = () => handleImageLoad(idx);
      img.src = src;
    });
  }, [images, handleImageLoad, currentIndex, inView]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (images.length <= 1) return;
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    onImageChange?.(nextIndex);
  }, [currentIndex, images.length, onImageChange]);

  const goToPrevious = useCallback(() => {
    if (images.length <= 1) return;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onImageChange?.(prevIndex);
  }, [currentIndex, images.length, onImageChange]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    onImageChange?.(index);
  }, [onImageChange]);

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  }, [touchStart, touchEnd, goToNext, goToPrevious]);

  // Mouse click navigation
  const handleMouseClick = (e: React.MouseEvent) => {
    if (images.length <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Left 40% - previous, Right 40% - next, Middle 20% - no action
    if (clickX < width * 0.4) {
      goToPrevious();
    } else if (clickX > width * 0.6) {
      goToNext();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    if (isHovered) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isHovered, goToPrevious, goToNext]);

  // Auto-advance on hover (optional)
  useEffect(() => {
    if (!isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 4000); // 4 seconds per image

    return () => clearInterval(interval);
  }, [isHovered, goToNext, images.length]);

  // Handle empty or single image
  if (!images || images.length === 0) {
    return (
      <div className={`relative h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 dark:text-gray-400">No Image</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative h-40 group overflow-hidden cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image */}
      <img
        ref={imageRef}
        src={images[currentIndex]}
        alt={`${alt} - Image ${currentIndex + 1}`}
        className={`w-full h-full object-cover transition-all duration-500 ease-out
          ${loadedImages[currentIndex] ? 'opacity-100' : 'opacity-0'}
          ${isHovered ? 'scale-110 brightness-105' : 'scale-100 brightness-100'}
        `}
        onLoad={() => handleImageLoad(currentIndex)}
        loading="lazy"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleMouseClick}
      />

      {/* Loading Skeleton */}
      {!loadedImages[currentIndex] && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse opacity-50" />
      )}

      {/* Gradient Overlay on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent
        transition-opacity duration-300 ${isMounted && isHovered ? 'opacity-100' : 'opacity-0'}
      `} />

      {/* Navigation Arrows (Desktop) */}
      {images.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 
              bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full 
              flex items-center justify-center text-white
              transition-all duration-200 hover:scale-110
              ${isMounted && isHovered ? 'opacity-100' : 'opacity-0'}
              md:block hidden
            `}
            aria-label="Previous image"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 
              bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full 
              flex items-center justify-center text-white
              transition-all duration-200 hover:scale-110
              ${isMounted && isHovered ? 'opacity-100' : 'opacity-0'}
              md:block hidden
            `}
            aria-label="Next image"
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}

      {/* Image Counter Badge */}
      {isMounted && images.length > 1 && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md text-white text-[10px] font-medium">
          {currentIndex + 1}/{images.length}
        </div>
      )}

      {/* Progress Dots */}
      {isMounted && images.length > 1 && images.length <= 8 && (
        <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1
          transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-70'}
        `}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 hover:scale-125
                ${index === currentIndex 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/50 hover:bg-white/70'
                }
              `}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar (for many images) */}
      {isMounted && images.length > 8 && (
        <div className={`absolute bottom-2 left-16 right-2 h-1 bg-black/20 rounded-full overflow-hidden
          transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-70'}
        `}>
          <div 
            className="h-full bg-white rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
          />
        </div>
      )}

      {/* Touch Navigation Zones (Mobile) */}
      {images.length > 1 && (
        <>
          <div 
            className="absolute left-0 top-0 w-1/3 h-full md:hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
          <div 
            className="absolute right-0 top-0 w-1/3 h-full md:hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </>
      )}
    </div>
  );
} 