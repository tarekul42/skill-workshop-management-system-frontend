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
import { WorkshopCardSkeleton } from "@/components/shared/LoadingSkeleton";
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
    description:
      "Learn from verified industry professionals with years of real-world experience.",
  },
  {
    icon: Wrench,
    title: "Hands-on Learning",
    description:
      "Practical workshops, not passive lectures. Build skills you can use on Day 1.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description:
      "Choose workshops that fit your life. Weekend and evening batches available.",
  },
  {
    icon: Award,
    title: "Industry Certificate",
    description:
      "Earn recognized certificates to boost your professional profile.",
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
            i < rating
              ? "fill-accent text-accent"
              : "fill-surface-3 text-foreground-disabled"
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
        className="relative z-10 mx-auto aspect-video w-[85%] max-w-110 rounded-2xl border border-border bg-surface-2 p-4 shadow-spotlight backdrop-blur-sm"
      >
        <div className="h-full w-full rounded-xl bg-surface-3/50 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse" />
            <div className="h-4 w-32 rounded bg-border animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-6 w-full rounded bg-primary/10 animate-pulse" />
            <div className="h-6 w-3/4 rounded bg-primary/10 animate-pulse" />
            <div className="h-4 w-full rounded bg-border animate-pulse" />
          </div>
          <div className="mt-8 flex items-center justify-between">
            <div className="h-10 w-24 rounded-lg bg-accent animate-pulse" />
            <div className="h-6 w-16 rounded bg-primary/20 animate-pulse" />
          </div>
        </div>

        {/* Orbiting Elements */}
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-8 -top-8 rounded-xl border border-border bg-surface-1 p-3 shadow-float"
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
          className="absolute -left-12 top-1/2 rounded-xl border border-border bg-surface-1 p-3 shadow-float"
        >
          <Badge variant="info" className="gap-2">
            <Play className="size-3 fill-info" />
            Live Session
          </Badge>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-6 right-4 rounded-xl border border-border bg-surface-1 p-3 shadow-float"
        >
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary text-[10px] flex items-center justify-center text-white">
              4.9★
            </div>
            <span className="text-xs font-bold">Experts</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Decorative blurred circles */}
      <div className="absolute left-1/2 top-1/2 size-75 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px]" />
      <div className="absolute right-0 top-0 size-50 rounded-full bg-accent/10 blur-[60px]" />
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
    [workshopsRaw?.data, categories, levels],
  );

  const featuredWorkshops = workshops.slice(0, 4);
  const isLoading = !categoriesData || !workshopsRaw;

  return (
    <div className="overflow-hidden">
      {/* ── Section: Hero ────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-background pt-20 pb-32 lg:pt-32">
        {/* Background blobs & dots */}
        <div className="bg-dot-pattern absolute inset-0 opacity-[0.08]" />
        <div className="absolute right-[-10%] top-[-5%] size-200 rounded-full bg-[radial-gradient(ellipse_at_center,var(--primary),transparent_70%)] opacity-[0.08] blur-[120px]" />
        <div className="absolute left-[-5%] bottom-[-5%] size-125 rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent),transparent_70%)] opacity-[0.06] blur-[100px]" />

        <div className="site-container relative grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-left"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <Badge
                variant="accent"
                className="h-6 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em]"
              >
                🇧🇩 Made for Bangladesh
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="font-display text-[56px] font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground"
            >
              Unlock{" "}
              <span className="relative inline-block text-primary">
                Real Skills.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12C80 2 220 2 295 12"
                    stroke="var(--accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              Build Your Future.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-8 max-w-120 text-lg leading-relaxed text-foreground-subtle"
            >
              Connect with industry experts across Bangladesh through hands-on
              workshops designed for real-world results.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-wrap gap-3"
            >
              <Button size="lg" asChild className="px-8 shadow-primary-glow">
                <Link href="/workshops">Browse Workshops</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                asChild
                className="gap-2 text-foreground font-semibold"
              >
                <Link href="/about">
                  <div className="flex size-10 items-center justify-center rounded-full bg-surface-2 text-primary">
                    <Play className="ml-1 size-4 fill-current" />
                  </div>
                  Watch How It Works
                </Link>
              </Button>
            </motion.div>

            {/* In-hero stats - 4 stats separated by | dividers */}
            <motion.div
              variants={fadeInUp}
              className="mt-16 flex flex-wrap items-center gap-6 border-t border-border pt-12"
            >
              {stats.map((stat, idx) => (
                <React.Fragment key={stat.label}>
                  {idx > 0 && <div className="h-8 w-px bg-border" />}
                  <div className="flex flex-col items-center">
                    <span className="font-display text-2xl font-bold text-foreground">
                      <AnimatedCounter value={stat.value} />
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground-muted">
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
      <section className="border-y border-border bg-surface-1 py-10">
        <div className="site-container flex flex-wrap items-center justify-between gap-8 md:flex-nowrap">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4 group">
              <div className="flex size-14 items-center justify-center rounded-full bg-primary-subtle transition-transform group-hover:scale-110">
                <stat.icon className="size-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-foreground leading-none">
                  <AnimatedCounter value={stat.value} />
                </span>
                <span className="text-sm font-medium text-foreground-muted">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section: Featured Workshops ────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="site-container">
          <div className="flex flex-col items-end justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
                Top Rated
              </span>
              <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Featured Workshops
              </h2>
              <p className="mt-4 text-lg text-foreground-subtle">
                Join our most popular hands-on sessions led by industry leaders.
              </p>
            </div>
            <Button variant="outline" asChild className="group">
              <Link href="/workshops">
                View All Workshops
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <div className="mt-16">
            {isLoading ? (
              <WorkshopCardSkeleton count={4} />
            ) : featuredWorkshops.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {featuredWorkshops.map((workshop, idx) => (
                  <motion.div
                    key={workshop._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <Link
                      href={`/workshops/${workshop._id}`}
                      className="group block h-full"
                    >
                      <Card className="h-full overflow-hidden border-border bg-surface-1 shadow-raised transition-all duration-300 hover:-translate-y-2 hover:shadow-float group-hover:border-primary/20">
                        {/* Image Container */}
                        <div className="relative aspect-video overflow-hidden">
                          {workshop.images?.[0] ? (
                            <Image
                              src={workshop.images[0]}
                              alt={workshop.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-surface-3">
                              <BookOpen className="size-12 text-foreground-disabled" />
                            </div>
                          )}
                          {/* Badges Overlay */}
                          <div className="absolute left-3 top-3 flex flex-col gap-2">
                            <Badge variant="default" className="shadow-sm">
                              {getLevelName(workshop.level)}
                            </Badge>
                          </div>
                          {/* Price Tag */}
                          <div className="absolute right-3 top-3">
                            <div className="rounded-lg bg-background/90 px-3 py-1.5 font-display text-sm font-bold text-foreground backdrop-blur-md shadow-sm">
                              {formatCurrency(workshop.price ?? 0)}
                            </div>
                          </div>
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>

                        <div className="p-5">
                          <h3 className="font-display text-xl font-bold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
                            {workshop.title}
                          </h3>
                          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-foreground-muted">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5 text-primary" />
                              <span>Starting Soon</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="size-3.5 text-primary" />
                              <span>{workshop.location}</span>
                            </div>
                          </div>

                          {/* Capacity indicator */}
                          <div className="mt-6">
                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                              <span className="text-foreground-muted">
                                Seats Available
                              </span>
                              <span className="text-primary">
                                {(workshop.maxSeats ?? 0) -
                                  workshop.currentEnrollments}{" "}
                                / {workshop.maxSeats ?? "∞"}
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-surface-3">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${(workshop.currentEnrollments / (workshop.maxSeats ?? 1)) * 100}%`,
                                }}
                              />
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                            <span className="text-sm font-bold text-primary group-hover:underline">
                              Enroll Now →
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-border py-20 text-center">
                <p className="text-lg font-medium text-foreground-muted">
                  No workshops available right now.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Section: Categories ────────────────────────────────────── */}
      <section className="bg-surface-2 py-24">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
              Paths
            </span>
            <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
              Explore Categories
            </h2>
            <p className="mt-4 text-lg text-foreground-subtle">
              Find the perfect specialized path for your career goals.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <Link
                  href={`/workshops?category=${cat.slug}`}
                  className="group relative block aspect-16/10 overflow-hidden rounded-2xl shadow-float transition-transform hover:-translate-y-1"
                >
                  {/* Background Image (placeholder or actual) */}
                  <div className="absolute inset-0 bg-primary/20 group-hover:scale-110 transition-transform duration-700" />
                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0_0_0/0.8)_20%,oklch(0_0_0/0.2)_100%)] group-hover:bg-black/60 transition-colors" />

                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary shadow-lg transition-transform group-hover:scale-110">
                      <BookOpen className="size-6 text-white" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2 mb-4">
                      {cat.description}
                    </p>
                    <span className="text-sm font-bold text-accent group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                      Explore Workshops <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: Why Choose Us ─────────────────────────────────── */}
      <section className="bg-background py-24">
        <div className="site-container">
          <div className="bg-[radial-gradient(ellipse_at_center,var(--primary-subtle),transparent_70%)] rounded-[40px] border border-border p-8 lg:p-20">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="font-display text-4xl font-bold text-foreground">
                Why Choose Skill Workshop?
              </h2>
              <p className="mt-4 text-foreground-subtle">
                We bridge the gap between education and employment.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl bg-background border border-border p-8 shadow-sm hover:shadow-float hover:border-primary/30 transition-all duration-300"
                >
                  <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary-subtle group-hover:bg-primary transition-colors duration-300">
                    <feature.icon className="size-7 text-primary group-hover:text-white transition-all duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground-subtle">
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
          <div className="mx-auto max-w-2xl text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">
              Voices
            </span>
            <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">
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
                  "relative rounded-2xl border border-border bg-background p-8 shadow-sm transition-all hover:shadow-float",
                  idx === 0 && "lg:col-span-1 lg:row-span-1",
                )}
              >
                <div className="absolute top-4 right-8 font-serif text-[80px] leading-none text-primary/10 select-none">
                  “
                </div>
                <div className="relative z-10">
                  <StarRating rating={t.rating} />
                  <p className="mt-6 text-base leading-relaxed text-foreground italic">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary-subtle text-sm font-extrabold text-primary shadow-sm">
                      {getInitials(t.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-foreground">
                        {t.name}
                      </span>
                      <span className="text-xs text-foreground-muted truncate">
                        {t.role}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase font-bold"
                    >
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
      <section className="py-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-[40px] bg-primary px-8 py-20 text-center shadow-spotlight">
            <div className="bg-dot-pattern absolute inset-0 opacity-[0.05]" />
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary-foreground/70 mb-4 block">
                Take the Leap
              </span>
              <h2 className="font-display text-4xl font-extrabold text-white sm:text-5xl lg:text-6xl max-w-2xl">
                Your skills upgrade starts today.
              </h2>
              <p className="mt-8 text-lg text-primary-foreground/80 max-w-xl">
                Join 500+ learners across Bangladesh and master the skills that
                matter in the real world.
              </p>
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  asChild
                  className="h-14 rounded-2xl px-10 text-lg shadow-amber-glow"
                >
                  <Link href="/register">Browse Workshops</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-14 rounded-2xl px-10 text-lg border-white text-white hover:bg-white hover:text-primary"
                >
                  <Link href="/register?role=instructor">
                    Become an Instructor
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
