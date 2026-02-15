import { Skeleton } from '@/components/ui/skeleton';

export default function AIToolsLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-10 w-96" />
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  );
}
