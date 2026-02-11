'use client';

import { Skeleton } from '@/components/ui/skeleton';

interface PropertyCardSkeletonProps {
  count?: number;
}

export function PropertyCardSkeleton({ count = 1 }: PropertyCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Image Skeleton */}
          <div className="relative aspect-[4/3]">
            <Skeleton className="absolute inset-0" />
            
            {/* Badge Skeletons */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Skeleton className="w-16 h-5 rounded-full" />
              <Skeleton className="w-20 h-5 rounded-full" />
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-3 space-y-3">
            {/* Price */}
            <Skeleton className="w-24 h-5" />
            
            {/* Address */}
            <div className="space-y-1">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-3/4 h-4" />
            </div>
            
            {/* Specifications */}
            <div className="flex items-center justify-between">
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-12 h-4" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function PropertyGridSkeleton({ count = 6 }: PropertyCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <PropertyCardSkeleton count={count} />
    </div>
  );
}

export function PropertyListSkeleton({ count = 6 }: PropertyCardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col sm:flex-row"
        >
          {/* Image Skeleton */}
          <div className="relative w-full sm:w-64 h-48 sm:h-auto shrink-0">
            <Skeleton className="absolute inset-0" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-full max-w-md h-4" />
              </div>
              <Skeleton className="w-24 h-6" />
            </div>
            
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-16 h-4" />
            </div>
            
            <Skeleton className="w-full h-16" />
            
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="w-24 h-8 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="w-20 h-8 rounded-lg" />
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
