"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, RotateCcw } from "lucide-react";
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
import WorkshopCard from "@/components/features/workshops/WorkshopCard";
import {
  fetchWorkshops,
  fetchCategories,
  fetchWorkshopLevels,
  enrichWorkshops,
} from "@/lib/api/services";

import type { FetchWorkshopsParams } from "@/lib/api/services";

const PUBLIC_STALE_TIME = 5 * 60 * 1000;

type SortOption = "newest" | "price-asc" | "price-desc";
type LevelOption = "all" | "Beginner" | "Intermediate" | "Advanced";

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

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const levels = useMemo(() => levelsData ?? [], [levelsData]);

  // Level name → ID map for backend filtering
  const levelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const l of levels) {
      map[l.name] = l._id;
    }
    return map;
  }, [levels]);

  // Build query params for backend
  const queryParams: FetchWorkshopsParams = useMemo(() => {
    const params: FetchWorkshopsParams = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    };
    if (searchQuery.trim()) params.searchTerm = searchQuery.trim();
    if (selectedCategory !== "all") params.category = selectedCategory;
    if (selectedLevel !== "all" && levelMap[selectedLevel]) params.level = levelMap[selectedLevel];
    params.sort = sortBy === "newest" ? "-createdAt" : sortBy === "price-asc" ? "price" : "-price";
    return params;
  }, [currentPage, searchQuery, selectedCategory, selectedLevel, sortBy, levelMap]);

  const { data: workshopsRaw, isLoading } = useQuery({
    queryKey: ["public-workshops", queryParams],
    queryFn: () => fetchWorkshops(queryParams),
    staleTime: PUBLIC_STALE_TIME,
  });

  const meta = workshopsRaw?.meta;
  const totalPages = meta?.totalPage ?? 1;
  const totalItems = meta?.total ?? 0;

  const workshops = useMemo(
    () => enrichWorkshops(workshopsRaw?.data ?? [], categories, levels),
    [workshopsRaw?.data, categories, levels]
  );

  const safePage = Math.min(currentPage, totalPages);

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
    setCurrentPage(1);
  }

  function handleFilterChange(setter: (val: string) => void) {
    return (val: string) => {
      setter(val);
      setCurrentPage(1);
    };
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Section 1: Page Header */}
      <section className="from-primary/10 via-primary/5 to-background relative overflow-hidden bg-linear-to-br py-24">
        <div className="bg-primary/5 pointer-events-none absolute -top-24 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="site-container text-center">
          <span className="text-primary mb-3 block text-xs font-bold tracking-[0.2em] uppercase">
            Explore Workshops
          </span>
          <h1 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
            Find Your Perfect Workshop
          </h1>
          <p className="text-foreground-subtle mx-auto mt-4 max-w-2xl text-lg">
            Browse {totalItems} workshops taught by verified experts across Bangladesh
          </p>
        </div>
      </section>

      <div className="site-container py-12">
        {/* Filter Bar */}
        <div className="bg-background/80 border-border sticky top-18 z-30 mb-8 border-b py-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-70 shrink-0">
              <Search className="text-foreground-muted absolute top-1/2 left-4 size-5 -translate-y-1/2" />
              <Input
                placeholder="Search workshops..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 pl-11"
              />
            </div>

            {/* Category Select */}
            <Select
              value={selectedCategory}
              onValueChange={handleFilterChange(setSelectedCategory)}
            >
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

            {/* Level Select */}
            <Select
              value={selectedLevel}
              onValueChange={(v) => {
                setSelectedLevel(v as LevelOption);
                setCurrentPage(1);
              }}
            >
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

            {/* Sort Select */}
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v as SortOption);
                setCurrentPage(1);
              }}
            >
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
            <span className="text-foreground-muted text-sm">Showing {totalItems} workshops</span>

            {/* Clear Filters Button */}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-foreground-muted hover:text-foreground h-9 px-3 transition-colors"
              >
                <RotateCcw className="mr-2 size-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <WorkshopCardSkeleton count={6} />
        ) : (
          <>
            {/* Results Count */}
            <p className="text-foreground-subtle animate-fade-in mb-6 text-sm">
              Showing{" "}
              <span className="text-foreground font-medium">
                {workshops.length > 0 ? (safePage - 1) * ITEMS_PER_PAGE + 1 : 0}–
                {(safePage - 1) * ITEMS_PER_PAGE + workshops.length}
              </span>{" "}
              of <span className="text-foreground font-medium">{totalItems}</span> workshops
            </p>

            {/* Workshop Grid or Empty State */}
            {workshops.length === 0 ? (
              <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 text-center">
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
                {workshops.map((workshop) => (
                  <WorkshopCard key={workshop._id} workshop={workshop} />
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
