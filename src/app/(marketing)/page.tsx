"use client";

import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useSpring, useTransform, useInView, AnimatePresence } from "framer-motion";
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
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkshopCardSkeleton } from "@/components/ui/loading-skeleton";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";
import {
  fetchWorkshops,
  fetchCategories,
  fetchWorkshopLevels,
  enrichWorkshops,
  getLevelName,
} from "@/lib/api/services";
import { getInitials } from "@/lib/formatters";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/motion-variants";

const PUBLIC_STALE_TIME = 5 * 60 * 1000;

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  workshop: string;
  rating: number;
}

// ─── Inline Testimonials ──────────────────────────────────────────────────
const testimonials: Testimonial[] = [
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
      "Every instructor is a verified industry professional with proven experience at top companies in Bangladesh and beyond. They bring real projects, case studies, and insider knowledge straight from the field — so you're not just learning theory, you're learning what actually works on the job.",
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
  },
  {
    icon: Wrench,
    title: "Hands-on Learning",
    description:
      "Forget death-by-PowerPoint. Our workshops are built around live coding sessions, real-world projects, and collaborative problem-solving. By the time you walk out, you will have built something tangible — a working app, a live campaign, or a portfolio piece — that proves what you can do.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description:
      "We know you are juggling work, studies, or family. That is why every workshop offers weekend and evening batches, plus recorded sessions you can revisit anytime. Miss a class? Catch up on your own time. Learning should fit your life, not the other way around.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
  },
  {
    icon: Award,
    title: "Industry Certificate",
    description:
      "Earn more than just attendance — walk away with a verified certificate that speaks to real employers. Our certificates are co-signed by industry partners, include a verifiable digital badge, and detail the exact skills you mastered. Add them to your LinkedIn, portfolio, or resume with confidence.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
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
  const isInView = useInView(ref, { once: true });
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

// ─── Component: TestimonialCarousel ──────────────────────────────────
function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(
    () => setActive((a) => (a + 1) % testimonials.length),
    [testimonials.length]
  );
  const prev = useCallback(
    () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length),
    [testimonials.length]
  );

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    intervalRef.current = id;
    return () => clearInterval(id);
  }, [paused, next]);

  const t = testimonials[active];

  return (
    <div
      className="site-container"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto mb-16 max-w-2xl text-center">
        <span className="text-primary mb-3 block text-xs font-bold tracking-[0.2em] uppercase">
          Voices
        </span>
        <h2 className="font-display text-foreground text-4xl font-bold sm:text-5xl">
          What Our Students Say
        </h2>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={t.id}
          layout
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-4xl"
        >
          <div className="bg-background border-border/50 relative rounded-2xl border p-10 shadow-sm sm:p-16">
            <div className="text-primary/[0.06] pointer-events-none absolute top-6 left-8 font-serif text-[180px] leading-none select-none">
              &ldquo;
            </div>

            <div className="relative z-10">
              <StarRating rating={t.rating} />

              <blockquote className="text-foreground mt-8 text-xl leading-relaxed sm:text-2xl sm:leading-[1.6]">
                &ldquo;{t.content}&rdquo;
              </blockquote>

              <div className="mt-10 flex items-center gap-5">
                <div className="bg-primary-subtle text-primary flex size-14 items-center justify-center rounded-full text-lg font-extrabold shadow-sm">
                  {getInitials(t.name)}
                </div>
                <div>
                  <div className="text-foreground text-base font-bold">{t.name}</div>
                  <div className="text-foreground-muted text-sm">{t.role}</div>
                  <Badge variant="secondary" className="mt-1.5 text-[10px] font-bold uppercase">
                    {t.workshop}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="bg-background border-border hover:border-primary/30 flex size-10 items-center justify-center rounded-full border transition-all"
          aria-label="Previous testimonial"
        >
          <ArrowRight className="size-4 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          {testimonials.map((_t: Testimonial, i: number) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === active ? "bg-primary w-8" : "bg-border hover:bg-foreground-muted w-2"
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="bg-background border-border hover:border-primary/30 flex size-10 items-center justify-center rounded-full border transition-all"
          aria-label="Next testimonial"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
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

  const featuredWorkshops = workshops.slice(0, 3);
  const isLoading = !categoriesData || !workshopsRaw;

  return (
    <div className="overflow-hidden">
      {/* ── Section: Hero ────────────────────────────────────────── */}
      <section className="bg-background relative flex min-h-[calc(100vh-72px)] overflow-hidden">
        {/* Background blobs & dots */}
        <div className="bg-dot-pattern absolute inset-0" />
        <div className="absolute top-[-5%] right-[-10%] size-200 rounded-full bg-[radial-gradient(ellipse_at_center,var(--primary),transparent_70%)] opacity-20 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] size-125 rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent),transparent_70%)] opacity-15 blur-[100px]" />

        <div className="site-container relative z-10 flex items-center">
          <div className="grid w-full items-center gap-16 lg:grid-cols-2">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="text-left"
            >
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
                className="text-foreground-subtle mt-8 max-w-160 text-xl leading-relaxed sm:text-2xl"
              >
                Connect with industry experts across Bangladesh through hands-on workshops designed
                for real-world results.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap gap-3">
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
                className="border-border mt-12 flex flex-wrap items-center gap-6 border-t pt-10"
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
              <WorkshopCardSkeleton count={3} />
            ) : featuredWorkshops.length > 0 ? (
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
                    <Link href={`/workshops/${workshop.slug}`} className="group block h-full">
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
                              loading="lazy"
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

      {/* ── Section: Categories (Visual Immersion) ───────────────── */}
      <section className="bg-surface-2 border-border relative border-y py-32">
        <div className="site-container">
          <div className="mx-auto mb-20 max-w-2xl text-center">
            <span className="text-primary mb-4 block text-[13px] font-bold tracking-[0.25em] uppercase">
              Paths
            </span>
            <h2 className="font-display text-foreground text-4xl font-bold sm:text-5xl">
              Explore Categories
            </h2>
            <p className="text-foreground-subtle mt-6 text-xl leading-relaxed">
              Choose your path and start building career-ready skills.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((cat, idx) => {
              const colors = [
                "from-primary/20 to-accent/10",
                "from-accent/20 to-primary/10",
                "from-primary/15 to-surface-3",
                "from-accent/15 to-surface-3",
              ];
              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link
                    href={`/workshops?category=${cat.slug}`}
                    className={`group bg-gradient-to-br ${colors[idx % colors.length]} border-border/40 hover:shadow-float relative flex items-center gap-8 overflow-hidden rounded-[28px] border p-8 transition-all duration-500 hover:-translate-y-1 sm:p-10`}
                  >
                    {/* Decorative blob */}
                    <div className="bg-primary/5 absolute -top-20 -right-20 size-50 rounded-full blur-[60px] transition-all duration-700 group-hover:scale-150" />

                    <div className="bg-background/80 border-border/30 relative z-10 flex size-20 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6">
                      <BookOpen className="text-primary size-9" />
                    </div>

                    <div className="relative z-10 min-w-0">
                      <h3 className="font-display text-foreground mb-2 text-2xl font-bold tracking-tight">
                        {cat.name}
                      </h3>
                      <p className="text-foreground-subtle line-clamp-2 text-sm leading-relaxed">
                        {cat.description}
                      </p>
                      <span className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-bold transition-transform group-hover:translate-x-2">
                        View workshops <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section: Why Choose Us (Alternating Visual Layout) ────── */}
      <section className="bg-background relative overflow-hidden py-32">
        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 size-200 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(var(--primary)/0.05),transparent_70%)]" />

        <div className="site-container relative">
          <div className="mx-auto mb-24 max-w-3xl text-center">
            <span className="text-primary mb-4 block text-[13px] font-bold tracking-[0.25em] uppercase">
              Why Choose Us
            </span>
            <h2 className="font-display text-foreground text-4xl font-bold tracking-tight sm:text-5xl">
              Built for Real Growth
            </h2>
            <p className="text-foreground-subtle mt-6 text-xl leading-relaxed">
              Every workshop is designed to bridge the gap between learning and doing.
            </p>
          </div>

          <div className="space-y-28">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`grid items-center gap-20 ${
                  idx % 2 === 0 ? "lg:grid-cols-[1fr_1.2fr]" : "lg:grid-cols-[1.2fr_1fr]"
                }`}
              >
                {/* Text side */}
                <div className={idx % 2 === 0 ? "lg:order-1" : "lg:order-2"}>
                  <div className="bg-primary/10 mb-8 flex size-20 items-center justify-center rounded-2xl shadow-sm">
                    <feature.icon className="text-primary size-9" />
                  </div>
                  <h3 className="font-display text-foreground mb-6 text-4xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-subtle text-xl leading-[1.7]">
                    {feature.description}
                  </p>
                  <div className="border-border mt-8 flex items-center gap-3 border-t pt-6">
                    <div className="flex -space-x-2">
                      <div className="border-background size-8 overflow-hidden rounded-full border-2">
                        <Image
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&q=60&fit=crop"
                          alt="Testimonial from Sarah"
                          width={32}
                          height={32}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="border-background size-8 overflow-hidden rounded-full border-2">
                        <Image
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&q=60&fit=crop"
                          alt="Testimonial from Alex"
                          width={32}
                          height={32}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="border-background size-8 overflow-hidden rounded-full border-2">
                        <Image
                          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=64&q=60&fit=crop"
                          alt="Testimonial from Jordan"
                          width={32}
                          height={32}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <span className="text-foreground-muted text-sm font-medium">
                      Trusted by professionals
                    </span>
                  </div>
                </div>

                {/* Visual side */}
                <div className={idx % 2 === 0 ? "lg:order-2" : "lg:order-1"}>
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-sm">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section: Testimonials (Carousel) ──────────────────────── */}
      <section className="bg-surface-1 relative overflow-hidden py-24">
        {/* Background decoration */}
        <div className="bg-primary/[0.03] absolute top-1/2 left-1/2 size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]" />

        <TestimonialCarousel testimonials={testimonials} />
      </section>

      {/* ── Section: Newsletter Subscription ── */}
      <section className="bg-background border-border border-t py-24">
        <div className="site-container max-w-4xl text-center">
          <div className="bg-primary/5 border-primary/10 rounded-3xl border p-8 sm:p-12">
            <span className="text-primary mb-3 block text-xs font-bold tracking-[0.2em] uppercase">
              Stay Updated
            </span>
            <h2 className="font-display text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Join the Skill Workshop Newsletter
            </h2>
            <p className="text-foreground-subtle mx-auto mt-4 max-w-lg text-sm leading-relaxed sm:text-base">
              Get weekly updates on upcoming workshops, early-bird discounts, and professional
              learning resources directly in your inbox.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement)
                  .value;
                if (email) {
                  toast.success("Subscribed! Check your inbox for updates.");
                  e.currentTarget.reset();
                }
              }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <Input
                name="email"
                type="email"
                required
                placeholder="Enter your email address"
                className="h-12 w-full sm:w-80"
              />
              <Button type="submit" className="h-12 rounded-xl px-6 font-bold shadow-md">
                Subscribe Now
              </Button>
            </form>
            <p className="text-foreground-disabled mt-4 text-xs">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section: CTA Banner ────────────────────────────────────── */}
      <section className="bg-primary py-24">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-primary-foreground/70 mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
              Take the Leap
            </span>
            <h2 className="text-primary-foreground font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Your skills upgrade starts today.
            </h2>
            <p className="text-primary-foreground/80 mx-auto mt-4 max-w-xl leading-relaxed">
              Join 500+ learners across Bangladesh and master the skills that matter in the real
              world.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="bg-background text-foreground hover:bg-background/90 font-bold"
              >
                <Link href="/register">Browse Workshops</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary font-bold"
              >
                <Link href="/register?role=instructor">Become an Instructor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
