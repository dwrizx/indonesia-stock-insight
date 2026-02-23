import { motion } from "framer-motion";

const SkeletonPulse = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
);

export const OverviewSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    {/* Market Overview skeleton */}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <SkeletonPulse className="h-3 w-16" />
            <SkeletonPulse className="h-5 w-14 rounded-full" />
          </div>
          <SkeletonPulse className="h-7 w-28" />
          <SkeletonPulse className="h-3 w-20" />
        </div>
      ))}
    </div>
    {/* Top Movers + Sector skeleton */}
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
        <SkeletonPulse className="h-4 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonPulse className="h-4 w-12" />
            <SkeletonPulse className="h-4 flex-1" />
            <SkeletonPulse className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <SkeletonPulse className="h-4 w-24" />
        <SkeletonPulse className="h-40 w-full rounded-xl" />
      </div>
    </div>
  </motion.div>
);

export const StocksSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4"
  >
    <div className="flex items-center justify-between">
      <SkeletonPulse className="h-4 w-28" />
      <div className="flex gap-2">
        <SkeletonPulse className="h-9 w-20 rounded-lg" />
        <SkeletonPulse className="h-9 w-28 rounded-lg" />
      </div>
    </div>
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <SkeletonPulse className="h-4 w-14" />
              <SkeletonPulse className="h-3 w-24" />
            </div>
            <SkeletonPulse className="h-6 w-16 rounded-lg" />
          </div>
          <SkeletonPulse className="h-12 w-full rounded-lg" />
          <SkeletonPulse className="h-6 w-32" />
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="space-y-1.5">
                <SkeletonPulse className="h-2 w-8" />
                <SkeletonPulse className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export const HeatmapSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-xl border border-border bg-card p-5 space-y-4"
  >
    <SkeletonPulse className="h-4 w-28" />
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-1.5">
      {Array.from({ length: 14 }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className={`rounded-lg ${i < 3 ? "col-span-2 row-span-2 h-24" : "h-14"}`}
        />
      ))}
    </div>
  </motion.div>
);

export const SectorSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="rounded-xl border border-border bg-card p-5 space-y-4 max-w-2xl"
  >
    <SkeletonPulse className="h-4 w-32" />
    <SkeletonPulse className="h-48 w-48 rounded-full mx-auto" />
    <div className="space-y-3 pt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonPulse className="h-3 w-3 rounded-full" />
          <SkeletonPulse className="h-3 flex-1" />
          <SkeletonPulse className="h-3 w-10" />
        </div>
      ))}
    </div>
  </motion.div>
);

export const CompareSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <div>
      <SkeletonPulse className="h-3 w-32 mb-3" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-9 w-28 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
      <SkeletonPulse className="h-10 rounded-lg" />
      <SkeletonPulse className="h-9 w-9 rounded-full" />
      <SkeletonPulse className="h-10 rounded-lg" />
    </div>
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid grid-cols-3 gap-4">
        <SkeletonPulse className="h-12 rounded-lg" />
        <SkeletonPulse className="h-4 w-full self-center rounded-full" />
        <SkeletonPulse className="h-12 rounded-lg" />
      </div>
    </div>
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="grid grid-cols-[1fr,auto,1fr] items-center px-4 py-3 border-b border-border/30">
          <SkeletonPulse className="h-3 w-20 ml-auto" />
          <SkeletonPulse className="h-3 w-16 mx-3" />
          <SkeletonPulse className="h-3 w-20" />
        </div>
      ))}
    </div>
  </motion.div>
);

export const ScreeningSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-5"
  >
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonPulse className="h-5 w-40" />
        <div className="flex gap-2">
          <SkeletonPulse className="h-9 w-20 rounded-lg" />
          <SkeletonPulse className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonPulse className="h-3 w-16" />
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 3 }).map((_, j) => (
                <SkeletonPulse key={j} className="h-7 w-20 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-xl border border-border bg-card p-4">
      <SkeletonPulse className="h-4 w-36 mb-3" />
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-7 w-14 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2.5 bg-secondary/30 border-b border-border/50 flex justify-between">
            <SkeletonPulse className="h-3 w-28" />
            <SkeletonPulse className="h-5 w-20 rounded-full" />
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <SkeletonPulse className="h-5 w-16" />
                <SkeletonPulse className="h-3 w-28" />
              </div>
              <div className="space-y-2">
                <SkeletonPulse className="h-5 w-20" />
                <SkeletonPulse className="h-3 w-12" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <SkeletonPulse key={j} className="h-16 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }).map((_, j) => (
                <SkeletonPulse key={j} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);
