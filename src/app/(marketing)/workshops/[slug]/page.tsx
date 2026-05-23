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
  Share2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnrollButton } from "@/components/workshop/EnrollButton";
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

function getLevelBadgeVariant(
  level: string,
): "default" | "secondary" | "danger" {
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

function WorkshopSimilarCard({ workshop }: { workshop: IWorkshop }) {
  return (
    <div className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-surface-1 shadow-raised transition-all duration-300 hover:shadow-float hover:-translate-y-0.75">
        {/* Image Container */}
        <div className="relative h-45 shrink-0 overflow-hidden">
          {workshop.images && workshop.images.length > 0 ? (
            <Image
              src={workshop.images[0]}
              alt={workshop.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-104"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-3">
              <BookOpen className="size-10 text-foreground-disabled" />
            </div>
          )}
          {/* Top-Left badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            <Badge variant={getLevelBadgeVariant(getLevelName(workshop.level))}>
              {getLevelName(workshop.level)}
            </Badge>
          </div>
          {/* Top-Right Price pill */}
          <div className="absolute right-3 top-3">
            <div className="rounded-lg bg-background/90 px-3 py-1.5 font-display text-sm font-bold text-foreground backdrop-blur-md">
              {formatCurrency(workshop.price ?? 0)}
            </div>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="flex flex-1 flex-col p-5">
          {/* Category dot + name */}
          <div className="mb-2 flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.02em] text-primary">
              {getCategoryName(workshop.category)}
            </span>
          </div>

          {/* Title */}
          <Link href={`/workshops/${workshop.slug}`}>
            <h3 className="font-display text-lg font-bold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
              {workshop.title}
            </h3>
          </Link>

          {/* Meta row */}
          <div className="mt-4 mb-auto flex flex-wrap items-center gap-4 text-xs text-foreground-subtle">
            {workshop.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-primary" />
                <span>{workshop.location}</span>
              </div>
            )}
            {workshop.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                <span>{formatDate(workshop.startDate)}</span>
              </div>
            )}
            {workshop.startDate && workshop.endDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                <span>
                  {computeDuration(workshop.startDate, workshop.endDate)}
                </span>
              </div>
            )}
          </div>

          <div className="my-4 border-t border-border" />

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
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
                const textClass =
                  percentEnrolled <= 0.5
                    ? "text-success"
                    : percentEnrolled <= 0.75
                      ? "text-warning"
                      : "text-danger";
                return (
                  <>
                    <div className="mb-1 h-1.5 w-full rounded-full bg-border">
                      <div
                        className={`h-full rounded-full ${bgClass}`}
                        style={{
                          width: `${Math.min(100, percentEnrolled * 100)}%`,
                        }}
                      />
                    </div>
                    <p className={`text-[12px] font-semibold ${textClass}`}>
                      {workshop.maxSeats
                        ? workshop.maxSeats - workshop.currentEnrollments
                        : "∞"}{" "}
                      seats left
                    </p>
                  </>
                );
              })()}
            </div>
            <Link
              href={`/workshops/${workshop.slug}`}
              className="text-sm font-semibold text-primary transition-colors group-hover:underline ml-4"
            >
              Enroll Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
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
    const [workshopRes, categoriesRes, levelsRes, similarRes] =
      await Promise.allSettled([
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
  } catch {
    // Non-critical errors
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
      const wCatId =
        typeof w.category === "string" ? w.category : w.category?._id;
      const wsCatId =
        typeof workshop.category === "string"
          ? workshop.category
          : workshop.category?._id;
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
            .filter(
              (w) =>
                w._id !== workshop._id &&
                !similarWorkshops.some((s) => s._id === w._id),
            )
            .slice(0, 3 - similarWorkshops.length),
        ];

  const seatsAvailable = (workshop.maxSeats ?? 0) - workshop.currentEnrollments;

  return (
    <div className="bg-background min-h-screen">
      {/* Breadcrumb Bar */}
      <div className="w-full border-b border-border bg-background py-4">
        <div className="site-container">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-[13px] font-medium text-foreground-muted">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li className="text-foreground-muted/50">/</li>
              <li>
                <Link
                  href="/workshops"
                  className="hover:text-foreground transition-colors"
                >
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
                className="relative mb-7 overflow-hidden rounded-[20px]"
                style={{ height: "440px" }}
              >
                {workshop.images && workshop.images.length > 0 ? (
                  <>
                    <Image
                      src={workshop.images[0]}
                      alt={workshop.title}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    {/* Thumbnails strip at bottom if >1 image */}
                    {workshop.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-lg bg-background/90 p-2 backdrop-blur-md">
                        {workshop.images
                          .slice(0, 5)
                          .map((img: string, idx: number) => (
                            <div
                              key={idx}
                              className="relative size-16 cursor-pointer overflow-hidden rounded-lg opacity-60 transition-opacity hover:opacity-100"
                            >
                              <Image
                                src={img}
                                alt={`${workshop.title} ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-surface-3">
                    <BookOpen className="size-16 text-primary/40" />
                  </div>
                )}
              </div>

              {/* Badges Row */}
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge
                  variant={getLevelBadgeVariant(getLevelName(workshop.level))}
                >
                  {getLevelName(workshop.level)}
                </Badge>
                <Badge variant="outline">
                  {getCategoryName(workshop.category)}
                </Badge>
              </div>

              {/* H1 Title */}
              <h1 className="font-display text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-foreground sm:text-5xl my-4">
                {workshop.title}
              </h1>

              {/* Meta Pills Row */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {workshop.location && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm">
                    <MapPin className="size-4 text-primary" />
                    <span className="text-foreground">{workshop.location}</span>
                  </div>
                )}
                {workshop.startDate && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm">
                    <Calendar className="size-4 text-primary" />
                    <span className="text-foreground">
                      {formatDate(workshop.startDate)}
                    </span>
                  </div>
                )}
                {workshop.startDate && workshop.endDate && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm">
                    <Clock className="size-4 text-primary" />
                    <span className="text-foreground">
                      {computeDuration(workshop.startDate, workshop.endDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm">
                  <Users className="size-4 text-primary" />
                  <span className="text-foreground">
                    {workshop.maxSeats ?? "∞"} seats total
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm">
                  <span className="font-semibold text-foreground">
                    {getLevelName(workshop.level)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm">
                  <span className="font-semibold text-foreground">
                    {formatCurrency(workshop.price ?? 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* About This Workshop */}
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                About This Workshop
              </h2>
              <Separator className="mb-4" />
              <div className="text-foreground leading-relaxed">
                {workshop.description}
              </div>
            </section>

            {/* What You'll Learn */}
            {workshop.whatYouLearn?.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  What You&apos;ll Learn
                </h2>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {workshop.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-success-subtle">
                        <CheckCircle className="size-3 text-success" />
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Prerequisites
                </h2>
                <Separator className="mb-4" />
                <div className="space-y-2">
                  {workshop.prerequisites.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="size-1.5 shrink-0 rounded-full bg-foreground-muted mt-2" />
                      <span className="text-foreground-subtle">{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Benefits */}
            {workshop.benefits?.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Benefits
                </h2>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {workshop.benefits.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-subtle">
                        <Star className="size-3 text-accent-foreground" />
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
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                  Syllabus
                </h2>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  {workshop.syllabus.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3.5 border-t border-border pt-4 first:border-0 first:pt-0"
                    >
                      <span className="font-display text-lg font-bold text-primary min-w-7">
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
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Your Instructor
              </h2>
              <Separator className="mb-4" />
              <div className="rounded-2xl border border-border bg-surface-1 p-7">
                <div className="flex items-start gap-5">
                  <Avatar className="size-20">
                    {typeof workshop.createdBy === "object" &&
                      "picture" in workshop.createdBy &&
                      (workshop.createdBy as { picture?: string }).picture && (
                        <AvatarImage
                          src={
                            (workshop.createdBy as { picture?: string })
                              .picture as string
                          }
                          alt={getCreatorName(workshop.createdBy)}
                        />
                      )}
                    <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                      {getInitials(getCreatorName(workshop.createdBy) || "IN")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {getCreatorName(workshop.createdBy)}
                    </h3>
                    <p className="text-sm font-medium text-primary mt-1">
                      Expert Instructor
                    </p>
                    {typeof workshop.createdBy === "object" &&
                      workshop.createdBy.bio && (
                        <p className="text-sm text-foreground-subtle leading-relaxed mt-3 line-clamp-4">
                          {workshop.createdBy.bio}
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Sidebar - THE CONVERSION ENGINE */}
          <aside className="hidden lg:sticky lg:block lg:top-23 lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto hidden-scrollbar">
            <div className="rounded-3xl border border-border bg-surface-1 p-7 shadow-2">
              {/* Price Block */}
              <div className="mb-6">
                <p className="text-[13px] font-semibold tracking-wider text-foreground-muted uppercase mb-1">
                  Price
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-extrabold tracking-[-0.03em] text-foreground font-display">
                    {workshop.price
                      ? formatCurrency(workshop.price)
                          .replace(/BDT|\$/g, "")
                          .trim()
                      : "Free"}
                  </span>
                  {workshop.price && (
                    <span className="text-base font-semibold text-foreground-subtle">
                      ৳
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-foreground-muted mt-1">
                  per student
                </p>
              </div>

              <Separator className="mb-6" />

              {/* Seats Block */}
              <div className="mb-6">
                <p className="mb-3 text-[13px] font-semibold tracking-[0.04em] uppercase text-foreground-muted">
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
                      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
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
                            <span className="text-foreground-muted">
                              seats remaining
                            </span>
                          </>
                        ) : (
                          <span className="font-bold text-danger">
                            WORKSHOP FULL
                          </span>
                        )}
                        {seatsAvailable > 0 && seatsAvailable <= 5 && (
                          <span className="ml-2 text-danger font-medium animate-pulse">
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
                  className="w-full h-13 rounded-xl text-base font-semibold hover:-translate-y-0.5 transition-all"
                />
              </div>

              {/* Trust Signals */}
              <div className="mb-6 space-y-2.5 pt-2">
                <div className="flex items-center gap-2 text-[13px] text-foreground-subtle">
                  <Shield className="size-4 text-primary" />
                  <span>Secure payment via SSLCommerz</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-foreground-subtle">
                  <span className="text-success text-base leading-none">↩</span>
                  <span>7-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-foreground-subtle">
                  <span className="text-primary text-base leading-none">
                    📧
                  </span>
                  <span>Instant confirmation email</span>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Dates Block */}
              <div className="mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[13px] font-semibold tracking-[0.04em] uppercase text-foreground-muted">
                    Starts
                  </p>
                  <p className="font-bold text-foreground text-sm">
                    {workshop.startDate
                      ? formatDate(workshop.startDate)
                      : "TBA"}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[13px] font-semibold tracking-[0.04em] uppercase text-foreground-muted">
                    Ends
                  </p>
                  <p className="font-medium text-foreground text-sm">
                    {workshop.endDate ? formatDate(workshop.endDate) : "TBA"}
                  </p>
                </div>
              </div>

              <Separator className="mb-6" />

              {/* Share Section */}
              <div>
                <p className="mb-3 text-xs font-bold tracking-[0.04em] uppercase text-foreground-muted">
                  Share this workshop
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-full"
                    aria-label="Copy Link"
                  >
                    <Share2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-full"
                    aria-label="Share on Facebook"
                  >
                    <span className="text-xs font-bold">f</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-full"
                    aria-label="Share on LinkedIn"
                  >
                    <span className="text-xs font-bold">in</span>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <Separator className="my-10" />

        {/* Similar Workshops */}
        {finalSimilar.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              You Might Also Like
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {finalSimilar.map((w) => (
                <WorkshopSimilarCard key={w._id} workshop={w} />
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
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Price */}
          <div>
            <p className="text-xs text-foreground-muted font-medium">Price</p>
            <p className="font-display text-xl font-extrabold text-foreground">
              {workshop.price ? formatCurrency(workshop.price) : "Free"}
            </p>
          </div>
          {/* Enroll Button */}
          <div className="flex-1 max-w-50">
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
