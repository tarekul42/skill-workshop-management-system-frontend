"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  WorkshopCardSkeleton,
  CategoryCardSkeleton,
} from "@/components/shared/LoadingSkeleton";
import { formatCurrency } from "@/lib/formatters";
import {
  fetchWorkshops,
  fetchCategories,
  fetchWorkshopLevels,
  enrichWorkshops,
  getLevelName,
} from "@/lib/api/services";

const PUBLIC_STALE_TIME = 5 * 60 * 1000; // 5 minutes

// ─── Inline Testimonials (no backend endpoint) ─────────────────────────────

const testimonials = [
  {
    id: "testimonial-001",
    name: "Mehedi Hasan",
    role: "Freelance Web Developer",
    content:
      "The Web Development Bootcamp completely changed my career trajectory. Before this workshop, I was struggling to land even freelance gigs. Now I have a solid portfolio of React projects and have already signed three clients through local referrals. The instructors made complex topics feel approachable and the hands-on approach was exactly what I needed.",
    workshop: "Web Development Bootcamp",
    rating: 5,
  },
  {
    id: "testimonial-002",
    name: "Sumaiya Akter",
    role: "E-commerce Entrepreneur",
    content:
      "I enrolled in the Digital Marketing Mastery workshop to grow my own online clothing store on Facebook. Within two months of applying what I learned, my monthly ad revenue doubled and I finally understand how to target the right audience. The live campaign exercises were incredibly valuable — there is no substitute for real practice.",
    workshop: "Digital Marketing Mastery",
    rating: 5,
  },
  {
    id: "testimonial-003",
    name: "Arif Mahmud",
    role: "Computer Science Student, BUET",
    content:
      "As a CS student, I thought I knew Python well enough, but the Data Science with Python workshop took my skills to a whole new level. Working with real Bangladeshi datasets and building an actual ML model gave me the confidence to apply for data science internships. I recently received an offer from a leading fintech company in Dhaka.",
    workshop: "Data Science with Python",
    rating: 4,
  },
  {
    id: "testimonial-004",
    name: "Nadia Tabassum",
    role: "Content Creator & Photographer",
    content:
      "The Photography Basics workshop was a game-changer for my social media content. I went from shooting everything on auto mode to confidently using manual settings. The outdoor field sessions in Chittagong were not only educational but also incredibly fun. My followers have noticed the difference in my photos and I have even started getting paid photography gigs.",
    workshop: "Photography Basics",
    rating: 5,
  },
];

// ─── Static Data ─────────────────────────────────────────────────────────

const stats = [
  { label: "500+ Students", icon: Users },
  { label: "50+ Workshops", icon: BookOpen },
  { label: "30+ Instructors", icon: GraduationCap },
  { label: "4.8 Rating", icon: Star },
];

const features = [
  {
    icon: GraduationCap,
    title: "Expert Instructors",
    description:
      "Learn from industry professionals with years of practical experience.",
  },
  {
    icon: Wrench,
    title: "Hands-on Learning",
    description:
      "Practice-based curriculum designed for real-world application.",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    description: "Choose from weekday, weekend, and online workshop options.",
  },
  {
    icon: Award,
    title: "Certificate of Completion",
    description:
      "Receive industry-recognized certificates to boost your career.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}



// ─── Page ─────────────────────────────────────────────────────────────────

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
  const loading = !categoriesData && !levelsData && !workshopsRaw;
  const featuredWorkshops = workshops.slice(0, 4);

  return (
    <>
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100vh-3.5rem)] items-center overflow-hidden bg-linear-to-br from-primary/10 via-primary/5 to-background">
        {/* Dot pattern background */}
        <div className="bg-dot-pattern absolute inset-0 opacity-40" />
        
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-125 w-175 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="site-container relative py-16 sm:py-20 lg:py-24 animate-fade-in-up">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Master New Skills with{" "}
              <span className="text-primary">Expert-Led Workshops</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Join thousands of learners across Bangladesh. From coding to
              creativity, find workshops that transform your career.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/workshops">Browse Workshops</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Stats row */}
            <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center gap-1.5"
                >
                  <stat.icon className="size-6 text-primary" />
                  <span className="text-sm font-semibold text-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Workshops ──────────────────────────────────────── */}
      <section className="site-container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Featured Workshops
          </h2>
          <p className="mt-2 text-muted-foreground">
            Discover our most popular workshops
          </p>
        </div>

        {loading ? (
          <WorkshopCardSkeleton count={4} variant="compact" />
        ) : featuredWorkshops.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 reveal active">
            {featuredWorkshops.map((workshop) => (
              <Card key={workshop._id} className="group/card flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-dashed">
                {/* Image placeholder */}
                <div className="flex h-40 items-center justify-center rounded-t-xl bg-muted">
                  <BookOpen className="size-10 text-muted-foreground/40" />
                </div>

                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getLevelName(workshop.level)}
                    </Badge>
                  </div>
                  <CardTitle className="mt-1 font-semibold leading-tight">
                    {workshop.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {workshop.description}
                  </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(workshop.price ?? 0)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {workshop.location}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No workshops available at the moment. Check back later!
            </p>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/workshops">
              View All Workshops
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Categories Section ──────────────────────────────────────── */}
      <section className="bg-muted/40">
        <div className="site-container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Explore Categories
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find the perfect workshop for your goals
            </p>
          </div>

          {loading ? (
            <CategoryCardSkeleton count={3} />
          ) : categories.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 reveal active">
              {categories.map((cat) => (
                <Card key={cat._id} className="transition-all duration-300 hover:shadow-md hover:border-primary/30">
                  <CardContent className="flex items-start gap-4">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="size-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="font-semibold">
                        {cat.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {cat.description}
                      </CardDescription>
                      <Link
                        href={`/workshops?category=${cat.slug}`}
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Explore
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No categories available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Why Choose Us ───────────────────────────────────────────── */}
      <section className="site-container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why Choose Skill Workshop?
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="size-7 text-primary" />
                </div>
                <CardTitle className="mt-4 font-semibold">
                  {feature.title}
                </CardTitle>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────── */}
      <section className="bg-muted/40">
        <div className="site-container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What Our Students Say
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {testimonials.map((t) => (
              <Card key={t.id}>
                <CardContent className="space-y-4">
                  <StarRating rating={t.rating} />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {t.workshop}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ─────────────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="site-container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
              Ready to Start Learning?
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Join our community of learners and take the first step toward
              mastering new skills.
            </p>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="mt-8 bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/register">
                Get Started
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
