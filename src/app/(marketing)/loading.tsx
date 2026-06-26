export default function MarketingLoading() {
  return (
    <div className="overflow-hidden">
      {/* Hero skeleton */}
      <section className="bg-background relative flex min-h-[calc(100vh-72px)] overflow-hidden">
        <div className="site-container relative z-10 flex w-full items-center">
          <div className="grid w-full items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="bg-surface-3 h-24 w-3/4 animate-pulse rounded-2xl sm:h-32" />
              <div className="bg-surface-3 h-24 w-full animate-pulse rounded-2xl sm:h-32" />
              <div className="bg-surface-3 mt-8 h-8 w-2/3 animate-pulse rounded-xl" />
              <div className="flex gap-3">
                <div className="bg-surface-3 h-14 w-44 animate-pulse rounded-xl" />
                <div className="bg-surface-3 h-14 w-44 animate-pulse rounded-xl" />
              </div>
            </div>
            <div className="bg-surface-3 hidden aspect-video animate-pulse rounded-2xl lg:block" />
          </div>
        </div>
      </section>

      {/* Featured workshops skeleton */}
      <section className="bg-background py-32">
        <div className="site-container">
          <div className="bg-surface-3 mb-20 h-12 w-96 animate-pulse rounded-2xl" />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                <div className="bg-surface-3 aspect-16/10 animate-pulse rounded-2xl" />
                <div className="bg-surface-3 h-6 w-3/4 animate-pulse rounded" />
                <div className="bg-surface-3 h-4 w-1/2 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
