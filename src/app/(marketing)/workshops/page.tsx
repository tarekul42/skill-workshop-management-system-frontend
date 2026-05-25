"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Calendar,
  BookOpen,
  RotateCcw,
  Clock,
} from "lucide-react";
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

function getLevelBadgeVariant(
  level: string,
): "default" | "secondary" | "danger" {
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

export default function WorkshopsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState<LevelOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

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
    [workshopsRaw?.data, categories, levels],
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
      results = results.filter(
        (w) => getCategoryId(w.category) === selectedCategory,
      );
    }

    // Filter by level
    if (selectedLevel !== "all") {
      results = results.filter((w) => getLevelName(w.level) === selectedLevel);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
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

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSortBy("newest");
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Section 1: Page Header */}
      <section className="bg-linear-to-b from-primary-subtle to-background py-15">
        <div className="site-container text-center">
          <span className="mb-3 block text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Explore Workshops
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Find Your Perfect Workshop
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground-subtle">
            Browse {filteredWorkshops.length} workshops taught by verified
            experts across Bangladesh
          </p>
        </div>
      </section>

      <div className="site-container py-12">
        {/* Filter Bar - Sticky on scroll */}
        <div className="sticky top-18 z-30 -mx-4 mb-8 bg-background/95 px-4 py-4 backdrop-blur-md border-b border-border shadow-3">
          <div className="site-container flex flex-wrap items-center gap-3">
            {/* Search Input - width 280px */}
            <div className="relative w-70 shrink-0">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search workshops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-11"
              />
            </div>

            {/* Category Select - width 180px */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-45 h-11 transition-all hover:bg-surface-2">
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
            <Select
              value={selectedLevel}
              onValueChange={(v) => setSelectedLevel(v as LevelOption)}
            >
              <SelectTrigger className="w-40 h-11 transition-all hover:bg-surface-2">
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
            <Select
              value={sortBy}
              onValueChange={(v) => setSortBy(v as SortOption)}
            >
              <SelectTrigger className="w-50 h-11 transition-all hover:bg-surface-2">
                <SelectValue placeholder="Sort: Newest First" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort: Newest First</SelectItem>
                <SelectItem value="price-asc">
                  Sort: Price Low to High
                </SelectItem>
                <SelectItem value="price-desc">
                  Sort: Price High to Low
                </SelectItem>
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
            <span className="text-sm text-muted-foreground">
              Showing {filteredWorkshops.length} workshops
            </span>

            {/* Clear Filters Button */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-9 px-3 text-muted-foreground hover:text-foreground transition-colors"
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
            <p className="mb-6 text-sm text-muted-foreground animate-fade-in">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredWorkshops.length}
              </span>{" "}
              workshop{filteredWorkshops.length !== 1 ? "s" : ""}
            </p>

            {/* Workshop Grid or Empty State */}
            {filteredWorkshops.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 text-center animate-fade-in">
                {/* SVG Illustration - Telescope */}
                <div className="mb-6 flex justify-center text-primary/30">
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
                <h3 className="text-xl font-bold text-foreground tracking-tight">
                  No workshops match your filters
                </h3>
                <p className="mt-2 max-w-md text-sm text-foreground-subtle leading-relaxed">
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
                {filteredWorkshops.map((workshop) => (
                  <div key={workshop._id} className="group block">
                    <div className="overflow-hidden rounded-[20px] border border-border bg-surface-1 shadow-raised transition-all duration-300 hover:shadow-float hover:-translate-y-0.75">
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
                          <div className="flex h-full w-full items-center justify-center bg-surface-3">
                            <BookOpen className="size-12 text-foreground-disabled" />
                          </div>
                        )}
                        {/* Top-Left badges: Level + Category stacked */}
                        <div className="absolute left-3 top-3 flex flex-col gap-2">
                          <Badge
                            variant={getLevelBadgeVariant(
                              getLevelName(workshop.level),
                            )}
                          >
                            {getLevelName(workshop.level)}
                          </Badge>
                        </div>
                        {/* Top-Right: Price pill */}
                        <div className="absolute right-3 top-3">
                          <div className="rounded-lg bg-background/90 px-3 py-1.5 font-display text-sm font-bold text-foreground backdrop-blur-md">
                            {formatCurrency(workshop.price ?? 0)}
                          </div>
                        </div>
                        {/* Gradient Overlay on hover */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>

                      <div className="p-5">
                        {/* Category dot + name */}
                        <div className="mb-2 flex items-center gap-2">
                          <div className="size-2 rounded-full bg-primary" />
                          <span className="text-[12px] font-semibold uppercase tracking-[0.02em] text-primary">
                            {getCategoryName(workshop.category)}
                          </span>
                        </div>

                        {/* Title - 2 line clamp */}
                        <Link href={`/workshops/${workshop.slug}`}>
                          <h3 className="font-display text-lg font-bold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                            {workshop.title}
                          </h3>
                        </Link>

                        {/* Description - 3 line clamp */}
                        <p className="mt-2 text-sm text-foreground-subtle line-clamp-3">
                          {workshop.description}
                        </p>

                        {/* Meta row - Location, Date, Duration */}
                        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-foreground-subtle">
                          {workshop.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-primary" />
                              <span>{workshop.location}</span>
                            </div>
                          )}
                          {workshop.startDate && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 text-primary" />
                              <span>{formatDate(workshop.startDate)}</span>
                            </div>
                          )}
                          {workshop.startDate && workshop.endDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="size-3.5 text-primary" />
                              <span>
                                {computeDuration(
                                  workshop.startDate,
                                  workshop.endDate,
                                )}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Divider */}
                        <div className="my-4 border-t border-border" />

                        {/* Footer: Seats remaining + Enroll Now */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {/* Seats progress bar */}
                            {(() => {
                              const percentEnrolled =
                                workshop.currentEnrollments /
                                (workshop.maxSeats ?? 1);
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
                                  <div className="mb-1 h-1.5 w-full rounded-full bg-border">
                                    <div
                                      className={`h-full rounded-full ${bgClass}`}
                                      style={{
                                        width: `${Math.min(100, percentEnrolled * 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <p
                                    className={`text-[12px] font-semibold ${textClass}`}
                                  >
                                    {workshop.maxSeats
                                      ? workshop.maxSeats -
                                        workshop.currentEnrollments
                                      : "∞"}{" "}
                                    seats left
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                          <Link
                            href={`/workshops/${workshop.slug}`}
                            className="text-sm font-semibold text-primary transition-colors group-hover:underline ml-4"
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

        {/* Pagination Section placeholder */}
        {filteredWorkshops.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-2 py-10 border-t border-border">
            <Button variant="ghost" disabled className="opacity-40">
              Previous
            </Button>
            <Button
              variant="default"
              className="rounded-lg h-9 w-9 p-0 bg-primary text-primary-foreground"
            >
              1
            </Button>
            <Button
              variant="ghost"
              className="rounded-lg h-9 w-9 p-0 hover:bg-surface-2"
            >
              2
            </Button>
            <Button
              variant="ghost"
              className="rounded-lg h-9 w-9 p-0 hover:bg-surface-2"
            >
              3
            </Button>
            <span className="px-2 text-foreground-muted">...</span>
            <Button variant="ghost" disabled className="opacity-40">
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
