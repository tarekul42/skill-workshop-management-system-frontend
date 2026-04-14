"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  Calendar,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WorkshopCardSkeleton,
} from "@/components/shared/LoadingSkeleton";
import {
  fetchWorkshops,
  fetchCategories,
  fetchWorkshopLevels,
  enrichWorkshops,
  getCategoryId,
  getLevelName,
  getCategoryName,
} from "@/lib/api/services";
import { formatCurrency, formatDate } from "@/lib/formatters";

const PUBLIC_STALE_TIME = 5 * 60 * 1000;

type SortOption = "newest" | "price-asc" | "price-desc";
type LevelOption = "all" | "Beginner" | "Intermediate" | "Advanced";

function getLevelBadgeVariant(
  level: string,
): "default" | "secondary" | "destructive" {
  switch (level) {
    case "Beginner":
      return "default";
    case "Intermediate":
      return "secondary";
    case "Advanced":
      return "destructive";
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
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore Our Workshops
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Discover hands-on workshops taught by industry experts and take your
            skills to the next level.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-50">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workshops..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full"
            />
          </div>

          {/* Category Select */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-45">
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
            onValueChange={(v) => setSelectedLevel(v as LevelOption)}
          >
            <SelectTrigger className="w-full sm:w-42.5">
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
            onValueChange={(v) => setSortBy(v as SortOption)}
          >
            <SelectTrigger className="w-full sm:w-50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-3 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-2 size-4" />
              Clear all
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <WorkshopCardSkeleton count={6} />
        ) : (
          <>
            {/* Results Count */}
            <p className="mb-6 text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredWorkshops.length}
              </span>{" "}
              workshop{filteredWorkshops.length !== 1 ? "s" : ""}
            </p>

            {/* Workshop Grid or Empty State */}
            {filteredWorkshops.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                  <BookOpen className="size-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  No workshops found
                </h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Try adjusting your filters or search terms to find what
                  you&apos;re looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={resetFilters}
                >
                  <RotateCcw />
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredWorkshops.map((workshop) => (
                  <Card
                    key={workshop._id}
                    className="flex flex-col overflow-hidden"
                  >
                    {/* Placeholder Image */}
                    <div className="relative flex aspect-16/10 items-center justify-center bg-muted">
                      <BookOpen className="size-12 text-muted-foreground/50" />
                      <Badge
                        variant={getLevelBadgeVariant(
                          getLevelName(workshop.level),
                        )}
                        className="absolute top-3 right-3"
                      >
                        {getLevelName(workshop.level)}
                      </Badge>
                    </div>

                    <CardContent className="flex flex-1 flex-col gap-2 pt-4">
                      {/* Category Badge */}
                      <Badge variant="outline" className="w-fit text-xs">
                        {getCategoryName(workshop.category)}
                      </Badge>

                      {/* Title */}
                      <Link
                        href={`/workshops/${workshop.slug}`}
                        className="group/title inline-block"
                      >
                        <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover/title:text-primary transition-colors">
                          {workshop.title}
                        </h3>
                      </Link>

                      {/* Description */}
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {workshop.description}
                      </p>

                      {/* Location & Date */}
                      <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {workshop.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {workshop.location}
                          </span>
                        )}
                        {workshop.startDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(workshop.startDate)}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between gap-2">
                      <span className="text-lg font-bold text-foreground">
                        {formatCurrency(workshop.price ?? 0)}
                      </span>
                      <Button asChild size="sm">
                        <Link href={`/workshops/${workshop.slug}`}>
                          Enroll Now
                          <ArrowRight />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
