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
  Cloud,
  ArrowRight,
  BookOpen,
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
  "DevOps & Cloud Infrastructure": { icon: Cloud, color: "oklch(0.5 0.15 220)" },
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
      className="group border-border bg-surface-1 hover:shadow-float relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
    >
      <Link href={`/workshops?category=${category.slug}`} className="absolute inset-0 z-10">
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
      <section className="from-primary/10 via-primary/5 to-background relative overflow-hidden bg-linear-to-br py-24">
        <div className="bg-primary/5 pointer-events-none absolute -top-24 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="site-container relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
              All Disciplines
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl"
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
      <section className="site-container py-24">
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-surface-2 aspect-4/3 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
      <section className="bg-primary">
        <div className="site-container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-primary-foreground font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Can&apos;t find what you&apos;re looking for?
            </h2>
            <p className="text-primary-foreground/80 mt-4">
              We&apos;re constantly adding new workshops. Tell us what you&apos;d like to learn!
            </p>
            <Button
              variant="secondary"
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 mt-8"
            >
              Request a Category
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
