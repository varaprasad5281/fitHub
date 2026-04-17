import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonDashboard() {
  return (
    <div className="space-y-8 p-6">
      <Skeleton className="h-12 w-64" />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      
      {/* Content */}
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}