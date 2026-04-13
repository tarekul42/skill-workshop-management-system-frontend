"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Code,
  Megaphone,
  Palette,
  Terminal,
  Camera,
  BarChart3,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCategories } from "@/lib/api/services";
import type { ICategory } from "@/types/workshop.types";

const PUBLIC_STALE_TIME = 5 * 60 * 1000;

const categoryIconMap: Record<
  string,
  { icon: React.ElementType; bgClass: string }
> = {
  "Web Development": { icon: Code, bgClass: "bg-blue-100 text-blue-600" },
  "Digital Marketing": {
    icon: Megaphone,
    bgClass: "bg-orange-100 text-orange-600",
  },
  "Graphic Design": {
    icon: Palette,
    bgClass: "bg-purple-100 text-purple-600",
  },
  Programming: { icon: Terminal, bgClass: "bg-green-100 text-green-600" },
  Photography: { icon: Camera, bgClass: "bg-pink-100 text-pink-600" },
  "Data Science": { icon: BarChart3, bgClass: "bg-cyan-100 text-cyan-600" },
};

function CategoryCardSkeleton() {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="items-center text-center">
        <Skeleton className="mb-2 h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </CardHeader>
      <CardContent className="flex justify-center">
        <Skeleton className="h-5 w-28" />
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const { data: categoriesData, isLoading: loading } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchCategories,
    staleTime: PUBLIC_STALE_TIME,
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <section className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      {/* Page Header */}
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Browse Categories
        </h1>
        <p className="mt-3 text-muted-foreground">
          Find workshops by topic
        </p>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
          <CategoryCardSkeleton />
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const mapping = categoryIconMap[category.name] ?? {
              icon: BookOpen,
              bgClass: "bg-muted text-muted-foreground",
            };
            const IconComponent = mapping.icon;

            return (
              <Card
                key={category._id}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader className="items-center text-center">
                  {/* Icon Circle */}
                  <div
                    className={`mb-2 flex h-16 w-16 items-center justify-center rounded-full ${mapping.bgClass}`}
                  >
                    <IconComponent className="size-8" />
                  </div>

                  {/* Category Name */}
                  <CardTitle className="text-lg">{category.name}</CardTitle>

                  {/* Description */}
                  {category.description && (
                    <CardDescription className="mt-1 line-clamp-3">
                      {category.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="flex justify-center">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    View Workshops
                    <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-1" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Code className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No categories found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no workshop categories available at the moment. Please
            check back later.
          </p>
        </div>
      )}
    </section>
  );
}
