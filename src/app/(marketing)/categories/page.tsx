"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Code,
  Megaphone,
  Palette,
  Terminal,
  Camera,
  BarChart3,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { fetchCategories } from "@/lib/api/services";
import type { ICategory } from "@/types";

// ─── Constants & Utils ───────────────────────────────────────────────

const PUBLIC_STALE_TIME = 5 * 60 * 1000;

const categoryIconMap: Record<string, { icon: React.ElementType; color: string }> = {
  "Web Development": { icon: Code, color: "oklch(0.6 0.2 250)" },
  "Digital Marketing": { icon: Megaphone, color: "oklch(0.7 0.2 40)" },
  "Graphic Design": { icon: Palette, color: "oklch(0.6 0.2 300)" },
  Programming: { icon: Terminal, color: "oklch(0.6 0.2 150)" },
  Photography: { icon: Camera, color: "oklch(0.6 0.2 340)" },
  "Data Science": { icon: BarChart3, color: "oklch(0.6 0.2 200)" },
};

function getCategoryGradient(name: string) {
  // Simple hash for consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  return `linear-gradient(135deg, oklch(0.7 0.15 ${h1}), oklch(0.6 0.2 ${h2}))`;
}

function getPlaceholderWorkshopCount(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash + name.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 12) + 2;
}

// ─── Category Card Component ─────────────────────────────────────────

function CategoryCard({ category }: { category: ICategory }) {
  const mapping = categoryIconMap[category.name] ?? {
    icon: BookOpen,
    color: "var(--primary)",
  };
  const Icon = mapping.icon;
  const gradient = useMemo(() => getCategoryGradient(category.name), [category.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group border-border bg-surface-1 hover:shadow-float relative flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-1"
    >
      <Link href={`/categories/${category.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {category.name}</span>
      </Link>

      {/* Top 60%: Thumbnail */}
      <div className="relative aspect-4/3 w-full overflow-hidden">
        {category.thumbnail ? (
          <Image
            src={category.thumbnail}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center transition-transform duration-500 group-hover:scale-105"
            style={{ background: gradient }}
          >
            <Icon className="size-16 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
      </div>

      {/* Bottom 40%: Content */}
      <div className="bg-surface-1 flex flex-col p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="bg-primary/10 rounded-lg p-1.5">
            <Icon className="text-primary size-4" />
          </div>
          <span className="text-primary text-[11px] font-bold tracking-widest uppercase">
            Category
          </span>
        </div>

        <h3 className="font-display text-foreground mb-2 text-xl leading-tight font-bold">
          {category.name}
        </h3>

        <p className="text-foreground-subtle mb-6 line-clamp-2 min-h-10 text-[13px]">
          {category.description ||
            `Explore professional workshops and hands-on training in ${category.name}.`}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-primary flex items-center gap-1.5 text-[13px] font-bold">
            Explore Workshops
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
          <div className="bg-surface-2 border-border text-foreground-muted flex size-8 items-center justify-center rounded-full border text-[11px] font-bold">
            {/* Placeholder for workshop count if available */}
            {getPlaceholderWorkshopCount(category.name)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function CategoriesPage() {
  const { data: categoriesData, isLoading: loading } = useQuery({
    queryKey: ["public-categories"],
    queryFn: fetchCategories,
    staleTime: PUBLIC_STALE_TIME,
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="from-primary-subtle to-background relative overflow-hidden bg-linear-to-b py-20 lg:py-28">
        <div className="bg-dot-pattern absolute top-0 left-1/2 h-full w-full -translate-x-1/2 opacity-40" />
        <div className="site-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-primary/10 border-primary/10 mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1"
          >
            <Sparkles className="text-primary size-4" />
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              All Disciplines
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-display-lg sm:text-display-xl text-foreground mx-auto max-w-3xl font-black tracking-tight"
          >
            Explore by <span className="text-primary">Category</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-foreground-subtle mx-auto mt-6 max-w-2xl text-lg leading-relaxed"
          >
            Discover a world of opportunities. From coding to creative arts, find the perfect
            workshop to master your next skill.
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="site-container py-16 lg:py-24">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-surface-2 animate-shimmer aspect-4/3 rounded-3xl" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No categories found"
            description="We're currently updating our catalog. Please check back later for new workshop categories."
          />
        )}
      </section>

      {/* CTA Section */}
      <section className="site-container mb-24">
        <div className="bg-foreground relative overflow-hidden rounded-[40px] p-8 sm:p-16">
          <div className="from-primary/20 to-accent/20 absolute inset-0 bg-linear-to-br opacity-50" />
          <div className="relative z-10 flex flex-col items-center justify-between gap-10 md:flex-row">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-display-sm sm:text-display-md mb-4 font-bold text-white">
                Can&apos;t find what you&apos;re looking for?
              </h2>
              <p className="text-lg text-white/70">
                We&apos;re constantly adding new workshops. Tell us what you&apos;d like to learn!
              </p>
            </div>
            <Button
              size="lg"
              className="text-foreground shadow-spotlight h-14 shrink-0 rounded-2xl bg-white px-8 text-base font-bold hover:bg-white/90"
            >
              Request a Category
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
