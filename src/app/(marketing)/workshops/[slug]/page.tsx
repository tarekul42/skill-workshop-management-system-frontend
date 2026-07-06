import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  Star,
  ArrowLeft,
  Clock,
  Shield,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnrollButton } from "@/components/features/workshops/EnrollButton";
import { ShareButtons } from "@/components/features/workshops/ShareButtons";
import { ReviewSection } from "@/components/features/reviews/ReviewSection";
import WorkshopCard from "@/components/features/workshops/WorkshopCard";
import { BACKEND_API_URL } from "@/lib/constants";
import {
  enrichWorkshop,
  enrichWorkshops,
  getLevelName,
  getCategoryName,
  getCreatorName,
} from "@/lib/api/services";
import {
  formatCurrency,
  formatDate,
  getInitials,
  computeDuration,
  truncate,
} from "@/lib/formatters";
import type { IWorkshop, ICategory, ILevel } from "@/types/workshop.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getLevelBadgeVariant(level: string): "default" | "secondary" | "danger" {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(`${BACKEND_API_URL}/workshop/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return {
        title: "Workshop Not Found",
      };
    }

    const json = await res.json();
    if (!json?.success) {
      return {
        title: "Workshop Not Found",
      };
    }

    const workshop = json.data.data ?? json.data;
    if (!workshop) {
      return {
        title: "Workshop Not Found",
      };
    }

    const levelName = getLevelName(workshop.level);
    const categoryName = getCategoryName(workshop.category);
    const description = workshop.description
      ? workshop.description.slice(0, 160)
      : `Enroll in ${workshop.title} — a ${levelName.toLowerCase()} ${categoryName.toLowerCase()} workshop. Expert-led, hands-on training with real-world projects.`;

    return {
      title: workshop.title,
      description,
      openGraph: {
        title: `${workshop.title} | Skill Workshop`,
        description,
        type: "article",
      },
    };
  } catch {
    return {
      title: "Workshop",
    };
  }
}

export default async function WorkshopDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch the workshop, categories, levels, and similar workshops in parallel
  let workshop: IWorkshop | null = null;
  let categories: ICategory[] = [];
  let levels: ILevel[] = [];
  let allWorkshops: IWorkshop[] = [];

  try {
    const [workshopRes, categoriesRes, levelsRes, similarRes] = await Promise.allSettled([
      fetch(`${BACKEND_API_URL}/workshop/${slug}`, {
        next: { revalidate: 60 },
      }),
      fetch(`${BACKEND_API_URL}/category`, { next: { revalidate: 60 } }),
      fetch(`${BACKEND_API_URL}/workshop/levels`, {
        next: { revalidate: 60 },
      }),
      fetch(`${BACKEND_API_URL}/workshop?limit=4`, {
        next: { revalidate: 60 },
      }),
    ]);

    if (workshopRes.status === "fulfilled") {
      const json = await workshopRes.value.json();
      if (json?.success) {
        // Handle double-nested response: { success, data: { data: {...} } }
        workshop = json.data.data ?? json.data;
      }
    }

    if (categoriesRes.status === "fulfilled") {
      const json = await categoriesRes.value.json();
      if (json?.success) {
        categories = json.data ?? [];
      }
    }

    if (levelsRes.status === "fulfilled") {
      const json = await levelsRes.value.json();
      if (json?.success) {
        // Handle double-nested response
        levels = json.data.data ?? json.data ?? [];
      }
    }

    if (similarRes.status === "fulfilled") {
      const json = await similarRes.value.json();
      if (json?.success && json.data) {
        allWorkshops = Array.isArray(json.data) ? json.data : [];
      }
    }
  } catch (err) {
    console.error("Failed to fetch similar workshops:", err);
  }

  // Enrich workshop and similar workshops with resolved category/level objects
  if (workshop) {
    workshop = enrichWorkshop(workshop, categories, levels);
  }
  allWorkshops = enrichWorkshops(allWorkshops, categories, levels);

  if (!workshop) {
    notFound();
  }

  const similarWorkshops = allWorkshops
    .filter((w) => {
      const wCatId = typeof w.category === "string" ? w.category : w.category?._id;
      const wsCatId =
        typeof workshop.category === "string" ? workshop.category : workshop.category?._id;
      return w._id !== workshop._id && wCatId === wsCatId;
    })
    .slice(0, 3);

  // If not enough from same category, fill with others
  const finalSimilar =
    similarWorkshops.length >= 3
      ? similarWorkshops
      : [
          ...similarWorkshops,
          ...allWorkshops
            .filter((w) => w._id !== workshop._id && !similarWorkshops.some((s) => s._id === w._id))
            .slice(0, 3 - similarWorkshops.length),
        ];

  const seatsAvailable = (workshop.maxSeats ?? 0) - workshop.currentEnrollments;

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="border-border bg-background w-full border-b py-4">
        <div className="site-container">
          <nav aria-label="Breadcrumb">
            <ol className="text-foreground-muted flex items-center gap-2 text-[13px] font-medium">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-foreground-muted/50">/</li>
              <li>
                <Link href="/workshops" className="hover:text-foreground transition-colors">
                  Workshops
                </Link>
              </li>
              <li className="text-foreground-muted/50">/</li>
              <li className="text-foreground line-clamp-1 max-w-75">
                {truncate(workshop.title, 40)}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="site-container py-10 lg:py-12">
        {/* Main Content + Sidebar */}
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          {/* Left Column: Main Content (scrollable) */}
          <div className="space-y-12">
            {/* Hero Block with Image Carousel */}
            <div className="mb-2">
              {/* Image Carousel - Height 440px, border-radius 20px */}
              <div
                className="relative mb-7 overflow-hidden rounded-2xl"
                style={{ height: "440px" }}
              >
                {workshop.images && workshop.images.length > 0 ? (
                  <>
                    <Image
                      src={workshop.images[0]}
                      alt={workshop.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-cover"
                      priority
                    />
                    {/* Thumbnails strip at bottom if >1 image */}
                    {workshop.images.length > 1 && (
                      <div className="bg-background/90 absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-lg p-2 backdrop-blur-md">
                        {workshop.images.slice(0, 5).map((img: string, idx: number) => (
                          <div
                            key={img}
                            className="relative size-16 cursor-pointer overflow-hidden rounded-lg opacity-60 transition-opacity hover:opacity-100"
                          >
                            <Image
                              src={img}
                              alt={`${workshop.title} ${idx + 1}`}
                              fill
                              sizes="64px"
                              className="object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-surface-3 flex h-full w-full items-center justify-center">
                    <BookOpen className="text-primary/40 size-16" />
                  </div>
                )}
              </div>

              {/* Badges Row */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge variant={getLevelBadgeVariant(getLevelName(workshop.level))}>
                  {getLevelName(workshop.level)}
                </Badge>
                <Badge variant="outline">{getCategoryName(workshop.category)}</Badge>
              </div>

              {/* H1 Title */}
              <h1 className="font-display text-foreground my-4 text-[40px] leading-[1.1] font-bold tracking-[-0.02em] sm:text-5xl">
                {workshop.title}
              </h1>

              {/* Meta Pills Row */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {workshop.location && (
                  <div className="border-border bg-surface-2 flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm">
                    <MapPin className="text-primary size-4" />
                    <span className="text-foreground">{workshop.location}</span>
                  </div>
                )}
                {workshop.startDate && (
                  <div className="border-border bg-surface-2 flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm">
                    <Calendar className="text-primary size-4" />
                    <span className="text-foreground">{formatDate(workshop.startDate)}</span>
                  </div>
                )}
                {workshop.startDate && workshop.endDate && (
                  <div className="border-border bg-surface-2 flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm">
                    <Clock className="text-primary size-4" />
                    <span className="text-foreground">
                      {computeDuration(workshop.startDate, workshop.endDate)}
                    </span>
                  </div>
                )}
                <div className="border-border bg-surface-2 flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm">
                  <Users className="text-primary size-4" />
                  <span className="text-foreground">{workshop.maxSeats ?? "∞"} seats total</span>
                </div>
                <div className="border-border bg-surface-2 flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm">
                  <span className="text-foreground font-semibold">
                    {getLevelName(workshop.level)}
                  </span>
                </div>
                <div className="border-border bg-surface-2 flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm">
                  <span className="text-foreground font-semibold">
                    {formatCurrency(workshop.price ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* About This Workshop */}
            <section>
              <h2 className="font-display text-foreground mb-4 text-2xl font-bold">
                About This Workshop
              </h2>
              <Separator className="mb-4" />
              <div className="text-foreground leading-relaxed">{workshop.description}</div>
            </section>

            {/* What You'll Learn */}
            {workshop.whatYouLearn?.length > 0 && (
              <section>
                <h2 className="font-display text-foreground mb-4 text-2xl font-bold">
                  What You&apos;ll Learn
                </h2>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {workshop.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="bg-success-subtle flex size-5 shrink-0 items-center justify-center rounded-full">
                        <CheckCircle className="text-success size-3" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Prerequisites */}
            {workshop.prerequisites?.length > 0 && (
              <section>
                <h2 className="font-display text-foreground mb-4 text-2xl font-bold">
                  Prerequisites
                </h2>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {workshop.prerequisites.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="bg-foreground-muted mt-2 size-1.5 shrink-0 rounded-full" />
                      <span className="text-foreground-subtle">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Benefits */}
            {workshop.benefits?.length > 0 && (
              <section>
                <h2 className="font-display text-foreground mb-4 text-2xl font-bold">Benefits</h2>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {workshop.benefits.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="bg-accent-subtle flex size-5 shrink-0 items-center justify-center rounded-full">
                        <Star className="text-accent-foreground size-3" />
                      </div>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Syllabus */}
            {workshop.syllabus?.length > 0 && (
              <section>
                <h2 className="font-display text-foreground mb-4 text-2xl font-bold">Syllabus</h2>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {workshop.syllabus.map((item, i) => (
                    <div
                      key={i}
                      className="border-border flex items-start gap-3.5 border-t pt-4 first:border-0 first:pt-0"
                    >
                      <span className="font-display text-primary min-w-7 text-lg font-bold">
                        {i + 1}
                      </span>
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Instructor Card */}
            <section>
              <h2 className="font-display text-foreground mb-4 text-2xl font-bold">
                Your Instructor
              </h2>
              <Separator className="mb-4" />
              <div className="border-border bg-surface-1 rounded-2xl border p-7">
                <div className="flex items-start gap-5">
                  <Avatar className="size-20">
                    {typeof workshop.createdBy === "object" &&
                      "picture" in workshop.createdBy &&
                      (workshop.createdBy as { picture?: string }).picture && (
                        <AvatarImage
                          src={(workshop.createdBy as { picture?: string }).picture as string}
                          alt={getCreatorName(workshop.createdBy)}
                        />
                      )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                      {getInitials(getCreatorName(workshop.createdBy) || "IN")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-display text-foreground text-xl font-bold">
                      {getCreatorName(workshop.createdBy)}
                    </h3>
                    <p className="text-primary mt-1 text-sm font-medium">Expert Instructor</p>
                    {typeof workshop.createdBy === "object" && workshop.createdBy.bio && (
                      <p className="text-foreground-subtle mt-3 line-clamp-4 text-sm leading-relaxed">
                        {workshop.createdBy.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ── Section: Student Reviews ─────────────────────────────── */}
          <ReviewSection workshopId={workshop._id} />

          {/* Right Column: Sticky Sidebar - THE CONVERSION ENGINE */}
          <aside className="hidden-scrollbar hidden lg:sticky lg:top-23 lg:block lg:max-h-[calc(100vh-100px)] lg:self-start lg:overflow-y-auto">
            <div className="border-border bg-surface-1 shadow-2 rounded-3xl border p-7">
              {/* Price Block */}
              <div className="mb-6">
                <p className="text-foreground-muted mb-1 text-[13px] font-semibold tracking-wider uppercase">
                  Price
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-foreground font-display text-5xl font-extrabold tracking-[-0.03em]">
                    {workshop.price
                      ? formatCurrency(workshop.price)
                          .replace(/BDT|\$/g, "")
                          .trim()
                      : "Free"}
                  </span>
                  {workshop.price && (
                    <span className="text-foreground-subtle text-base font-semibold">৳</span>
                  )}
                </div>
                <p className="text-foreground-muted mt-1 text-[13px]">per student</p>
              </div>

              <Separator className="mb-6" />

              {/* Seats Block */}
              <div className="mb-6">
                <p className="text-foreground-muted mb-3 text-[13px] font-semibold tracking-[0.04em] uppercase">
                  Seats Available
                </p>
                {(() => {
                  const percentEnrolled = workshop.maxSeats
                    ? workshop.currentEnrollments / workshop.maxSeats
                    : 0;
                  const bgClass =
                    percentEnrolled <= 0.5
                      ? "bg-success"
                      : percentEnrolled <= 0.75
                        ? "bg-warning"
                        : "bg-danger";
                  return (
                    <>
                      <div className="bg-border h-2 w-full overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full transition-all ${bgClass}`}
                          style={{
                            width: `${Math.min(100, percentEnrolled * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-3 text-[14px] font-medium">
                        {seatsAvailable > 0 ? (
                          <>
                            <span className="text-foreground">
                              {seatsAvailable} of {workshop.maxSeats}
                            </span>{" "}
                            <span className="text-foreground-muted">seats remaining</span>
                          </>
                        ) : (
                          <span className="text-danger font-bold">WORKSHOP FULL</span>
                        )}
                        {seatsAvailable > 0 && seatsAvailable <= 5 && (
                          <span className="text-danger ml-2 animate-pulse font-medium">
                            ⚠ Almost full!
                          </span>
                        )}
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Enroll Button - THE MOST IMPORTANT ELEMENT */}
              <div className="mb-6">
                <EnrollButton
                  workshopId={workshop._id}
                  slug={slug}
                  price={workshop.price ?? 0}
                  seatsAvailable={seatsAvailable}
                  variant="default"
                  size="lg"
                  className="h-13 w-full rounded-xl text-base font-semibold transition-all hover:-translate-y-0.5"
                />
              </div>

              {/* Trust Signals */}
              <div className="mb-6 space-y-2.5 pt-2">
                <div className="text-foreground-subtle flex items-center gap-2 text-[13px]">
                  <Shield className="text-primary size-4" />
                  <span>Secure payment via SSLCommerz</span>
                </div>
                <div className="text-foreground-subtle flex items-center gap-2 text-[13px]">
                  <span className="text-success text-base leading-none">↩</span>
                  <span>7-day money-back guarantee</span>
                </div>
                <div className="text-foreground-subtle flex items-center gap-2 text-[13px]">
                  <span className="text-primary text-base leading-none">📧</span>
                  <span>Instant confirmation email</span>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Dates Block */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-foreground-muted text-[13px] font-semibold tracking-[0.04em] uppercase">
                    Starts
                  </p>
                  <p className="text-foreground text-sm font-bold">
                    {workshop.startDate ? formatDate(workshop.startDate) : "TBA"}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-foreground-muted text-[13px] font-semibold tracking-[0.04em] uppercase">
                    Ends
                  </p>
                  <p className="text-foreground text-sm font-medium">
                    {workshop.endDate ? formatDate(workshop.endDate) : "TBA"}
                  </p>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Share Section */}
              <div>
                <p className="text-foreground-muted mb-3 text-xs font-bold tracking-[0.04em] uppercase">
                  Share this workshop
                </p>
                <div className="flex gap-2">
                  <ShareButtons />
                </div>
              </div>
            </div>
          </aside>
        </div>

        <Separator className="my-10" />

        {/* Similar Workshops */}
        {finalSimilar.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-foreground mb-6 text-2xl font-bold">
              You Might Also Like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {finalSimilar.map((w) => (
                <WorkshopCard
                  key={w._id}
                  workshop={w}
                  showDescription={false}
                  imageHeight="h-45"
                  iconSize={10}
                />
              ))}
            </div>
          </section>
        )}

        {/* Back to Workshops Link */}
        <div className="mb-12">
          <Button variant="ghost" asChild>
            <Link href="/workshops" className="flex items-center gap-2">
              <ArrowLeft />
              Back to Workshops
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Fixed Enroll Bar — visible only on mobile */}
      <div className="border-border bg-background/95 fixed right-0 bottom-0 left-0 z-50 border-t px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-4">
          {/* Price */}
          <div>
            <p className="text-foreground-muted text-xs font-medium">Price</p>
            <p className="font-display text-foreground text-xl font-extrabold">
              {workshop.price ? formatCurrency(workshop.price) : "Free"}
            </p>
          </div>
          {/* Enroll Button */}
          <div className="max-w-50 flex-1">
            <EnrollButton
              workshopId={workshop._id}
              slug={slug}
              price={workshop.price ?? 0}
              seatsAvailable={seatsAvailable}
              size="default"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
