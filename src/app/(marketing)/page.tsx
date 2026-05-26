"use client";

import React, { useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useSpring, useTransform, useInView } from "framer-motion";
import {
  Users,
  BookOpen,
  GraduationCap,
  Star,
  MapPin,
  ArrowRight,
  Wrench,
  Calendar,
  Award,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkshopCardSkeleton } from "@/components/ui/loading-skeleton";
import { formatCurrency } from "@/lib/formatters";
import {
  fetchWorkshops,
  fetchCategories,
  fetchWorkshopLevels,
  enrichWorkshops,
  getLevelName,
} from "@/lib/api/services";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/formatters";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/motion-variants";

const PUBLIC_STALE_TIME = 5 * 60 * 1000;

// ─── Inline Testimonials ──────────────────────────────────────────────────
const testimonials = [
  {
    id: "testimonial-001",
    name: "Mehedi Hasan",
    role: "Freelance Web Developer",
    content:
      "The Web Development Bootcamp completely changed my career trajectory. Now I have a solid portfolio and signed three clients through local referrals.",
    workshop: "Web Development Bootcamp",
    rating: 5,
  },
  {
    id: "testimonial-002",
    name: "Sumaiya Akter",
    role: "E-commerce Entrepreneur",
    content:
      "Enrolled in Digital Marketing Mastery to grow my clothing store. Monthly revenue doubled. The live campaign exercises were incredibly valuable.",
    workshop: "Digital Marketing Mastery",
    rating: 5,
  },
  {
    id: "testimonial-003",
    name: "Arif Mahmud",
    role: "Computer Science Student",
    content:
      "Working with real Bangladeshi datasets in the Python workshop gave me the confidence to land a data science internship at a leading fintech.",
    workshop: "Data Science with Python",
    rating: 4,
  },
  {
    id: "testimonial-004",
    name: "Nadia Tabassum",
    role: "Content Creator",
    content:
      "The Photography Basics workshop was a game-changer. My followers have noticed the difference and I've started getting paid photography gigs.",
    workshop: "Photography Basics",
    rating: 5,
  },
  {
    id: "testimonial-005",
    name: "Rakib Ahmed",
    role: "Graphic Designer",
    content:
      "Learned advanced UI/UX principles. The instructor's feedback was practical and industry-standard. Highly recommended for professionals.",
    workshop: "UI/UX Design Masterclass",
    rating: 5,
  },
];

const stats = [
  { label: "Students", value: "500+", icon: Users },
  { label: "Workshops", value: "50+", icon: BookOpen },
  { label: "Instructors", value: "30+", icon: GraduationCap },
  { label: "Rating", value: "4.8★", icon: Star },
];

const features = [
  {
    icon: GraduationCap,
    title: "Expert Instructors",
    description: "Learn from verified industry professionals with years of real-world experience.",
  },
  {
    icon: Wrench,
    title: "Hands-on Learning",
    description: "Practical workshops, not passive lectures. Build skills you can use on Day 1.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Choose workshops that fit your life. Weekend and evening batches available.",
  },
  {
    icon: Award,
    title: "Industry Certificate",
    description: "Earn recognized certificates to boost your professional profile.",
  },
];

// ─── Component: StarRating ────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < rating ? "fill-accent text-accent" : "fill-surface-3 text-foreground-disabled"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Component: AnimatedCounter ───────────────────────────────────────────
function AnimatedCounter({ value }: { value: string }) {
  const match = value.match(/^([\d.]+)(.*)$/);
  const number = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : "";
  const isDecimal = value.includes(".");

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const springValue = useSpring(0, {
    stiffness: 80,
    damping: 20,
    duration: 1200,
  });

  useEffect(() => {
    if (isInView) {
      springValue.set(number);
    }
  }, [isInView, number, springValue]);

  const displayValue = useTransform(springValue, (current) => {
    if (isDecimal) {
      return current.toFixed(1) + suffix;
    }
    return Math.floor(current) + suffix;
  });

  return <motion.span ref={ref}>{displayValue}</motion.span>;
}

// ─── Component: HeroIllustration ──────────────────────────────────────────
function HeroIllustration() {
  return (
    <div className="relative h-100 w-full lg:h-125">
      <motion.div
        animate={{ rotate: [0, 2, -2, 0], y: [0, -10, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="glass shadow-spotlight relative z-10 mx-auto aspect-video w-[85%] max-w-110 rounded-2xl p-4"
      >
        <div className="bg-surface-3/30 h-full w-full rounded-xl p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/20 h-10 w-10 animate-pulse rounded-full" />
            <div className="bg-border h-4 w-32 animate-pulse rounded" />
          </div>
          <div className="space-y-3">
            <div className="bg-primary/10 h-6 w-full animate-pulse rounded" />
            <div className="bg-primary/10 h-6 w-3/4 animate-pulse rounded" />
            <div className="bg-border h-4 w-full animate-pulse rounded" />
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="bg-accent h-10 w-24 animate-pulse rounded-lg" />
            <div className="bg-primary/20 h-6 w-16 animate-pulse rounded" />
          </div>
        </div>

        {/* Orbiting Elements */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="glass shadow-float absolute -top-8 -right-8 rounded-xl p-3"
        >
          <Badge variant="success">Certificate</Badge>
        </motion.div>

        <motion.div
          animate={{ x: [0, 15, 0] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="glass shadow-float absolute top-1/2 -left-12 rounded-xl p-3"
        >
          <Badge variant="info" className="gap-2">
            <Play className="fill-info size-3" />
            Live Session
          </Badge>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="glass shadow-float absolute right-4 -bottom-6 rounded-xl p-3"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary flex size-8 items-center justify-center rounded-full text-[10px] text-white">
              4.9★
            </div>
            <span className="text-xs font-bold">Experts</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative blurred circles */}
      <div className="bg-primary/10 absolute top-1/2 left-1/2 size-75 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]" />
      <div className="bg-accent/10 absolute top-0 right-0 size-50 rounded-full blur-[60px]" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function HomePage() {
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
    queryKey: ["public-featured-workshops"],
    queryFn: () => fetchWorkshops({ limit: 100 }),
    staleTime: PUBLIC_STALE_TIME,
  });

  const categories = useMemo(() => categoriesData ?? [], [categoriesData]);
  const levels = useMemo(() => levelsData ?? [], [levelsData]);
  const workshops = useMemo(
    () => enrichWorkshops(workshopsRaw?.data ?? [], categories, levels),
    [workshopsRaw?.data, categories, levels]
  );

  const featuredWorkshops = workshops.slice(0, 4);
  const isLoading = !categoriesData || !workshopsRaw;

  return (
    <div className="overflow-hidden">
      {/* ── Section: Hero ────────────────────────────────────────── */}
      <section className="bg-background relative min-h-[calc(100vh-72px)] overflow-hidden pt-24 pb-40 lg:pt-36">
        {/* Background blobs & dots */}
        <div className="bg-dot-pattern absolute inset-0 opacity-[0.08]" />
        <div className="absolute top-[-5%] right-[-10%] size-200 rounded-full bg-[radial-gradient(ellipse_at_center,var(--primary),transparent_70%)] opacity-[0.08] blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] size-125 rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent),transparent_70%)] opacity-[0.06] blur-[100px]" />

        <div className="site-container relative grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-left"
          >
            <motion.div variants={fadeInUp} className="mb-8">
              <Badge
                variant="accent"
                className="h-7 rounded-full px-4 py-1 text-[13px] font-bold tracking-widest uppercase shadow-sm"
              >
                🇧🇩 Made for Bangladesh
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-display text-foreground text-[56px] leading-[1.05] font-extrabold tracking-[-0.04em] sm:text-[80px] lg:text-[96px]"
            >
              Unlock{" "}
              <span className="text-primary relative inline-block">
                Real Skills.
                <svg
                  className="absolute -bottom-3 left-0 w-full"
                  viewBox="0 0 300 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12C80 2 220 2 295 12"
                    stroke="var(--accent)"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              Build Your Future.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-foreground-subtle mt-12 max-w-160 text-xl leading-relaxed sm:text-2xl"
            >
              Connect with industry experts across Bangladesh through hands-on workshops designed
              for real-world results.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-10 flex flex-wrap gap-3">
              <Button size="lg" asChild className="px-8">
                <Link href="/workshops">Browse Workshops</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="text-foreground gap-2 font-semibold"
              >
                <Link href="/about">
                  <div className="bg-surface-2 text-primary flex size-10 items-center justify-center rounded-full">
                    <Play className="ml-1 size-4 fill-current" />
                  </div>
                  Watch How It Works
                </Link>
              </Button>
            </motion.div>

            {/* In-hero stats - 4 stats separated by | dividers */}
            <motion.div
              variants={fadeInUp}
              className="border-border mt-16 flex flex-wrap items-center gap-6 border-t pt-12"
            >
              {stats.map((stat, idx) => (
                <React.Fragment key={stat.label}>
                  {idx > 0 && <div className="bg-border h-8 w-px" />}
                  <div className="flex flex-col items-center">
                    <span className="font-display text-foreground text-2xl font-bold">
                      <AnimatedCounter value={stat.value} />
                    </span>
                    <span className="text-foreground-muted text-[12px] font-semibold tracking-[0.08em] uppercase">
                      {stat.label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            className="hidden lg:block"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* ── Section: Stats Bar (Social Proof Strip) ────────────────── */}
      <section className="border-border bg-surface-1 border-y py-10">
        <div className="site-container flex flex-wrap items-center justify-between gap-8 md:flex-nowrap">
          {stats.map((stat) => (
            <div key={stat.label} className="group flex items-center gap-4">
              <div className="bg-primary-subtle flex size-14 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                <stat.icon className="text-primary size-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-foreground text-2xl leading-none font-bold">
                  <AnimatedCounter value={stat.value} />
                </span>
                <span className="text-foreground-muted text-sm font-medium">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section: Featured Workshops ────────────────────────────── */}
      <section className="bg-background py-32">
        <div className="site-container">
          <div className="flex flex-col items-end justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-primary mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
                Top Rated
              </span>
              <h2 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-6xl">
                Featured Workshops
              </h2>
              <p className="text-foreground-subtle mt-6 text-xl leading-relaxed">
                Join our most popular hands-on sessions led by industry leaders.
              </p>
            </div>
            <Button variant="outline" size="lg" asChild className="group h-14 rounded-2xl px-8">
              <Link href="/workshops">
                View All Workshops
                <ArrowRight className="ml-2.5 size-5 transition-transform group-hover:translate-x-1.5" />
              </Link>
            </Button>
          </div>

          <div className="mt-20">
            {isLoading ? (
              <WorkshopCardSkeleton count={4} />
            ) : featuredWorkshops.length > 0 ? (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {featuredWorkshops.map((workshop, idx) => (
                  <motion.div
                    key={workshop._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 0.6,
                      delay: idx * 0.1,
                      ease: "easeOut",
                    }}
                  >
                    <Link href={`/workshops/${workshop._id}`} className="group block h-full">
                      <Card
                        interactive
                        className="border-border bg-surface-1 shadow-2 h-full overflow-hidden transition-all duration-500"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-16/10 overflow-hidden">
                          {workshop.images?.[0] ? (
                            <Image
                              src={workshop.images[0]}
                              alt={workshop.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="bg-surface-3 flex h-full w-full items-center justify-center">
                              <BookOpen className="text-foreground-disabled size-12" />
                            </div>
                          )}
                          {/* Badges Overlay */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <Badge variant="default" className="px-3 py-1 font-bold shadow-lg">
                              {getLevelName(workshop.level)}
                            </Badge>
                          </div>
                          {/* Price Tag */}
                          <div className="absolute top-4 right-4">
                            <div className="bg-background/90 font-display text-foreground rounded-xl border border-white/20 px-4 py-2 text-base font-extrabold shadow-lg backdrop-blur-md">
                              {formatCurrency(workshop.price ?? 0)}
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="font-display text-foreground group-hover:text-primary line-clamp-2 text-xl leading-tight font-bold transition-colors">
                            {workshop.title}
                          </h3>
                          <div className="text-foreground-muted mt-5 flex items-center gap-5 text-xs font-bold">
                            <div className="flex items-center gap-2">
                              <Calendar className="text-primary/70 size-4" />
                              <span>Starting Soon</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="text-primary/70 size-4" />
                              <span>{workshop.location}</span>
                            </div>
                          </div>

                          {/* Capacity indicator */}
                          <div className="mt-8">
                            <div className="mb-2.5 flex justify-between text-[11px] font-bold tracking-widest uppercase">
                              <span className="text-foreground-muted">Seats Available</span>
                              <span className="text-primary">
                                {(workshop.maxSeats ?? 0) - workshop.currentEnrollments} /{" "}
                                {workshop.maxSeats ?? "∞"}
                              </span>
                            </div>
                            <div className="bg-surface-3 h-2 w-full overflow-hidden rounded-full">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{
                                  width: `${(workshop.currentEnrollments / (workshop.maxSeats ?? 1)) * 100}%`,
                                }}
                                viewport={{ once: true }}
                                transition={{
                                  duration: 1,
                                  ease: "easeOut",
                                  delay: 0.5,
                                }}
                                className="bg-primary h-full rounded-full"
                              />
                            </div>
                          </div>

                          <div className="border-border mt-8 flex items-center justify-between border-t pt-5">
                            <span className="text-primary flex items-center gap-2 text-[15px] font-bold">
                              Enroll Now{" "}
                              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="border-border rounded-2xl border-2 border-dashed py-20 text-center">
                <p className="text-foreground-muted text-lg font-medium">
                  No workshops available right now.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Section: Categories ────────────────────────────────────── */}
      <section className="bg-surface-2 border-border border-y py-32">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-primary mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
              Paths
            </span>
            <h2 className="font-display text-foreground text-4xl font-bold sm:text-6xl">
              Explore Categories
            </h2>
            <p className="text-foreground-subtle mt-6 text-xl leading-relaxed">
              Find the perfect specialized path for your career goals.
            </p>
          </div>

          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Link
                  href={`/workshops?category=${cat.slug}`}
                  className="group shadow-2 hover:shadow-4 relative block aspect-16/10 overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2"
                >
                  {/* Background (placeholder color with gradient) */}
                  <div className="bg-primary/10 absolute inset-0 transition-transform duration-700 group-hover:scale-110" />
                  {/* Dark Gradient Overlay - Refined for readability */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0_0_0/0.85)_15%,oklch(0_0_0/0.1)_100%)] transition-colors duration-500 group-hover:bg-black/60" />

                  <div className="absolute inset-0 flex flex-col justify-end p-10">
                    <div className="glass-dark mb-5 flex size-14 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
                      <BookOpen className="size-7 text-white" />
                    </div>
                    <h3 className="font-display mb-3 text-3xl font-bold tracking-tight text-white">
                      {cat.name}
                    </h3>
                    <p className="mb-5 line-clamp-2 text-base leading-relaxed text-white/70">
                      {cat.description}
                    </p>
                    <span className="text-accent inline-flex items-center gap-2.5 text-[15px] font-bold transition-transform group-hover:translate-x-2">
                      Explore Workshops <ArrowRight className="size-5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: Why Choose Us ─────────────────────────────────── */}
      <section className="bg-background py-32">
        <div className="site-container">
          <div className="border-border rounded-[48px] border bg-[radial-gradient(ellipse_at_center,oklch(var(--primary)/0.08),transparent_70%)] p-10 shadow-sm lg:p-24">
            <div className="mx-auto mb-20 max-w-3xl text-center">
              <h2 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
                Why Choose Skill Workshop?
              </h2>
              <p className="text-foreground-subtle mt-6 text-xl leading-relaxed">
                We bridge the gap between traditional education and industry employment.
              </p>
            </div>

            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group bg-background border-border shadow-1 hover:shadow-float hover:border-primary/20 rounded-3xl border p-10 transition-all duration-500"
                >
                  <div className="bg-primary-subtle group-hover:bg-primary mb-8 flex size-16 items-center justify-center rounded-2xl shadow-sm transition-colors duration-500">
                    <feature.icon className="text-primary size-8 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-white" />
                  </div>
                  <h3 className="font-display text-foreground mb-4 text-2xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-subtle text-[15px] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Testimonials ──────────────────────────────────── */}
      <section className="bg-surface-1 py-24">
        <div className="site-container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-primary mb-3 block text-xs font-bold tracking-[0.2em] uppercase">
              Voices
            </span>
            <h2 className="font-display text-foreground text-4xl font-bold sm:text-5xl">
              What Our Students Say
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={cn(
                  "border-border bg-background hover:shadow-float relative rounded-2xl border p-8 shadow-sm transition-all",
                  idx === 0 && "lg:col-span-1 lg:row-span-1"
                )}
              >
                <div className="text-primary/10 absolute top-4 right-8 font-serif text-[80px] leading-none select-none">
                  “
                </div>
                <div className="relative z-10">
                  <StarRating rating={t.rating} />
                  <p className="text-foreground mt-6 text-base leading-relaxed italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="border-border mt-8 flex items-center gap-4 border-t pt-6">
                    <div className="bg-primary-subtle text-primary flex size-12 items-center justify-center rounded-full text-sm font-extrabold shadow-sm">
                      {getInitials(t.name)}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="text-foreground text-sm font-bold">{t.name}</span>
                      <span className="text-foreground-muted truncate text-xs">{t.role}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                      {t.workshop}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: CTA Banner ────────────────────────────────────── */}
      <section className="py-32">
        <div className="site-container">
          <div className="bg-primary shadow-spotlight relative overflow-hidden rounded-[64px] px-10 py-24 text-center">
            <div className="bg-dot-pattern absolute inset-0 opacity-[0.08]" />
            <div className="relative z-10 flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-primary-foreground/70 mb-6 block text-[13px] font-bold tracking-[0.4em] uppercase"
              >
                Take the Leap
              </motion.span>
              <h2 className="font-display max-w-4xl text-5xl leading-[1.05] font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Your skills upgrade starts today.
              </h2>
              <p className="text-primary-foreground/80 mt-10 max-w-2xl text-xl leading-relaxed">
                Join 500+ learners across Bangladesh and master the skills that matter in the real
                world.
              </p>
              <div className="mt-14 flex flex-wrap justify-center gap-5">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="h-16 rounded-[20px] px-12 text-xl font-bold shadow-lg"
                >
                  <Link href="/register">Browse Workshops</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="hover:text-primary h-16 rounded-[20px] border-white/30 px-10 text-lg font-bold text-white shadow-md transition-all hover:bg-white"
                >
                  <Link href="/register?role=instructor">Become an Instructor</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
