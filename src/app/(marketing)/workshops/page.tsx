"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Calendar, BookOpen, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkshopCardSkeleton } from "@/components/ui/loading-skeleton";
import {
  fetchWorkshops,
  fetchCategories,
  fetchWorkshopLevels,
  enrichWorkshops,
  getCategoryId,
  getLevelName,
  getCategoryName,
} from "@/lib/api/services";
import { formatCurrency, formatDate, computeDuration } from "@/lib/formatters";

const PUBLIC_STALE_TIME = 5 * 60 * 1000;

type SortOption = "newest" | "price-asc" | "price-desc";
type LevelOption = "all" | "Beginner" | "Intermediate" | "Advanced";

function getLevelBadgeVariant(level: string): "default" | "secondary" | "danger" {
  switch (level) {
    case "Beginner":
      return "default";
    case "Intermediate":
      return "secondary";
    case "Advanced":
      return "danger";
    default:
      return "default";
  }
}

const ITEMS_PER_PAGE = 9;

export default function WorkshopsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState<LevelOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: categoriesData } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchCategories,
    staleTime: PUBLIC_STALE_TIME,
  });

  const { data: levelsData } = useQuery({
    queryKey: ["public-levels"],
    queryFn: fetchWorkshopLevels,
    staleTime: PUBLIC_STALE_TIME,
  });

  const { data: workshopsRaw } = useQuery({
    queryKey: ["public-workshops"],
    queryFn: () => fetchWorkshops({ limit: 100 }),
    staleTime: PUBLIC_STALE_TIME,
  });

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const levels = useMemo(() => levelsData ?? [], [levelsData]);
  const workshops = useMemo(
    () => enrichWorkshops(workshopsRaw?.data ?? [], categories, levels),
    [workshopsRaw?.data, categories, levels]
  );
  const loading = !workshopsRaw && !categoriesData && !levelsData;

  const filteredWorkshops = useMemo(() => {
    let results = [...workshops];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter((w) => w.title.toLowerCase().includes(query));
    }

    // Filter by category
    if (selectedCategory !== "all") {
      results = results.filter((w) => getCategoryId(w.category) === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== "all") {
      results = results.filter((w) => getLevelName(w.level) === selectedLevel);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-asc":
        results.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        results.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
    }

    return results;
  }, [workshops, searchQuery, selectedCategory, selectedLevel, sortBy]);
  const isFiltered =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedLevel !== "all" ||
    sortBy !== "newest";

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredWorkshops.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredWorkshops.length);
  const paginatedWorkshops = filteredWorkshops.slice(startIndex, endIndex);

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSortBy("newest");
    setCurrentPage(1);
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Section 1: Page Header */}
      <section className="from-primary-subtle to-background bg-linear-to-b py-15">
        <div className="site-container text-center">
          <span className="text-primary mb-3 block text-xs font-bold tracking-[0.2em] uppercase">
            Explore Workshops
          </span>
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Find Your Perfect Workshop
          </h1>
          <p className="text-foreground-subtle mx-auto mt-4 max-w-2xl text-lg">
            Browse {filteredWorkshops.length} workshops taught by verified experts across Bangladesh
          </p>
        </div>
      </section>

      <div className="site-container py-12">
        {/* Filter Bar - Sticky on scroll */}
        <div className="bg-background/95 border-border shadow-3 sticky top-18 z-30 -mx-4 mb-8 border-b px-4 py-4 backdrop-blur-md">
          <div className="site-container flex flex-wrap items-center gap-3">
            {/* Search Input - width 280px */}
            <div className="relative w-70 shrink-0">
              <Search className="text-muted-foreground absolute top-1/2 left-4 size-5 -translate-y-1/2" />
              <Input
                placeholder="Search workshops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-11"
              />
            </div>

            {/* Category Select - width 180px */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="hover:bg-surface-2 h-11 w-45 transition-all">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level Select - width 160px */}
            <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as LevelOption)}>
              <SelectTrigger className="hover:bg-surface-2 h-11 w-40 transition-all">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Select - width 200px */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="hover:bg-surface-2 h-11 w-50 transition-all">
                <SelectValue placeholder="Sort: Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort: Newest First</SelectItem>
                <SelectItem value="price-asc">Sort: Price Low to High</SelectItem>
                <SelectItem value="price-desc">Sort: Price High to Low</SelectItem>
              </SelectContent>
            </Select>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Active filter count badge */}
            {isFiltered && (
              <Badge variant="default" className="h-6 px-2.5">
                {
                  [
                    searchQuery.trim(),
                    selectedCategory !== "all",
                    selectedLevel !== "all",
                    sortBy !== "newest",
                  ].filter(Boolean).length
                }{" "}
                Filters
              </Badge>
            )}

            {/* Results count */}
            <span className="text-muted-foreground text-sm">
              Showing {filteredWorkshops.length} workshops
            </span>

            {/* Clear Filters Button */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground h-9 px-3 transition-colors"
              >
                <RotateCcw className="mr-2 size-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <WorkshopCardSkeleton count={6} />
        ) : (
          <>
            {/* Results Count */}
            <p className="text-muted-foreground animate-fade-in mb-6 text-sm">
              Showing{" "}
              <span className="text-foreground font-medium">
                {filteredWorkshops.length > 0 ? startIndex + 1 : 0}–{endIndex}
              </span>{" "}
              of <span className="text-foreground font-medium">{filteredWorkshops.length}</span>{" "}
              workshops
            </p>

            {/* Workshop Grid or Empty State */}
            {filteredWorkshops.length === 0 ? (
              <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 text-center">
                {/* SVG Illustration - Telescope */}
                <div className="text-primary/30 mb-6 flex justify-center">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </div>
                <h3 className="text-foreground text-xl font-bold tracking-tight">
                  No workshops match your filters
                </h3>
                <p className="text-foreground-subtle mt-2 max-w-md text-sm leading-relaxed">
                  Try adjusting your search or clearing the filters
                </p>
                <div className="mt-8 flex gap-3">
                  <Button variant="default" onClick={resetFilters}>
                    <RotateCcw className="mr-2 size-4" />
                    Clear Filters
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/workshops">Browse All</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginatedWorkshops.map((workshop) => (
                  <div key={workshop._id} className="group block">
                    <div className="border-border bg-surface-1 shadow-raised hover:shadow-float overflow-hidden rounded-[20px] border transition-all duration-300 hover:-translate-y-0.75">
                      {/* Image Container - height 200px */}
                      <div className="relative h-50 overflow-hidden">
                        {workshop.images && workshop.images.length > 0 ? (
                          <Image
                            src={workshop.images[0]}
                            alt={workshop.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-104"
                            unoptimized
                          />
                        ) : (
                          <div className="bg-surface-3 flex h-full w-full items-center justify-center">
                            <BookOpen className="text-foreground-disabled size-12" />
                          </div>
                        )}
                        {/* Top-Left badges: Level + Category stacked */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          <Badge variant={getLevelBadgeVariant(getLevelName(workshop.level))}>
                            {getLevelName(workshop.level)}
                          </Badge>
                        </div>
                        {/* Top-Right: Price pill */}
                        <div className="absolute top-3 right-3">
                          <div className="bg-background/90 font-display text-foreground rounded-lg px-3 py-1.5 text-sm font-bold backdrop-blur-md">
                            {formatCurrency(workshop.price ?? 0)}
                          </div>
                        </div>
                        {/* Gradient Overlay on hover */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>

                      <div className="p-5">
                        {/* Category dot + name */}
                        <div className="mb-2 flex items-center gap-2">
                          <div className="bg-primary size-2 rounded-full" />
                          <span className="text-primary text-[12px] font-semibold tracking-[0.02em] uppercase">
                            {getCategoryName(workshop.category)}
                          </span>
                        </div>

                        {/* Title - 2 line clamp */}
                        <Link href={`/workshops/${workshop.slug}`}>
                          <h3 className="font-display text-foreground group-hover:text-primary line-clamp-2 text-lg font-bold transition-colors">
                            {workshop.title}
                          </h3>
                        </Link>

                        {/* Description - 3 line clamp */}
                        <p className="text-foreground-subtle mt-2 line-clamp-3 text-sm">
                          {workshop.description}
                        </p>

                        {/* Meta row - Location, Date, Duration */}
                        <div className="text-foreground-subtle mt-4 flex flex-wrap items-center gap-4 text-xs">
                          {workshop.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="text-primary size-3.5" />
                              <span>{workshop.location}</span>
                            </div>
                          )}
                          {workshop.startDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="text-primary size-3.5" />
                              <span>{formatDate(workshop.startDate)}</span>
                            </div>
                          )}
                          {workshop.startDate && workshop.endDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="text-primary size-3.5" />
                              <span>{computeDuration(workshop.startDate, workshop.endDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="border-border my-4 border-t" />

                        {/* Footer: Seats remaining + Enroll Now */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {/* Seats progress bar */}
                            {(() => {
                              const percentEnrolled =
                                workshop.currentEnrollments / (workshop.maxSeats ?? 1);
                              const bgClass =
                                percentEnrolled <= 0.5
                                  ? "bg-success"
                                  : percentEnrolled <= 0.75
                                    ? "bg-warning"
                                    : "bg-danger";
                              const textClass =
                                percentEnrolled <= 0.5
                                  ? "text-success"
                                  : percentEnrolled <= 0.75
                                    ? "text-warning"
                                    : "text-danger";
                              return (
                                <>
                                  <div className="bg-border mb-1 h-1.5 w-full rounded-full">
                                    <div
                                      className={`h-full rounded-full ${bgClass}`}
                                      style={{
                                        width: `${Math.min(100, percentEnrolled * 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <p className={`text-[12px] font-semibold ${textClass}`}>
                                    {workshop.maxSeats
                                      ? workshop.maxSeats - workshop.currentEnrollments
                                      : "∞"}{" "}
                                    seats left
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                          <Link
                            href={`/workshops/${workshop.slug}`}
                            className="text-primary ml-4 text-sm font-semibold transition-colors group-hover:underline"
                          >
                            Enroll Now →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-border mt-12 flex flex-col items-center gap-4 border-t py-10 sm:flex-row sm:justify-between">
            <p className="text-foreground-muted text-sm">
              Page <span className="text-foreground font-semibold">{safePage}</span> of{" "}
              <span className="text-foreground font-semibold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-surface-2 h-9 rounded-lg px-3 text-sm font-medium disabled:opacity-40"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={safePage === pageNum ? "default" : "ghost"}
                  size="icon-xs"
                  className={`h-9 w-9 rounded-lg p-0 text-sm font-bold ${
                    safePage !== pageNum && "hover:bg-surface-2 text-foreground-muted"
                  }`}
                  onClick={() => setCurrentPage(pageNum)}
                  aria-label={`Page ${pageNum}`}
                >
                  {pageNum}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-surface-2 h-9 rounded-lg px-3 text-sm font-medium disabled:opacity-40"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
