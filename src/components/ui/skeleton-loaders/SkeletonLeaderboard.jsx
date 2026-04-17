import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLeaderboard() {
  return (
    <div className="space-y-4">
      {/* Podium */}
      <div className="flex justify-center items-end gap-4 mb-12">
        <Skeleton className="h-40 w-28" />
        <Skeleton className="h-48 w-28" />
        <Skeleton className="h-36 w-28" />
      </div>
      
      {/* List */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 flex-1" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}