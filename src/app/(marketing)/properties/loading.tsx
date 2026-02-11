import { PropertyGridSkeleton } from './components/PropertyCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function PropertiesLoading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Skeleton className="w-64 h-8 mb-2" />
          <Skeleton className="w-96 h-4" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Skeleton */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-32" />
              <Skeleton className="w-full h-10" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-12" />
                <Skeleton className="w-24 h-12" />
              </div>
            </div>

            {/* Filter Bar Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-32 h-5" />
              <div className="flex gap-2">
                <Skeleton className="w-24 h-8" />
                <Skeleton className="w-24 h-8" />
              </div>
            </div>

            {/* Property Grid Skeleton */}
            <PropertyGridSkeleton count={8} />

            {/* Pagination Skeleton */}
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
                <Skeleton className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
