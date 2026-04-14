import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowLeft,
  Clock,
  Shield,
  Share2,
  ChevronRight,
  Home,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BACKEND_API_URL } from "@/lib/constants";
import { enrichWorkshop, enrichWorkshops, getLevelName, getCategoryName, getCreatorName } from "@/lib/api/services";
import { formatCurrency, formatDate, getInitials } from "@/lib/formatters";
import type { IWorkshop, ICategory, ILevel } from "@/types/workshop.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getLevelBadgeVariant(
  level: string
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

function computeDuration(start: string, end: string): string {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const diffDays = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffDays / 7);
  const remainingDays = diffDays % 7;

  if (weeks > 0 && remainingDays > 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""} ${remainingDays} day${remainingDays > 1 ? "s" : ""}`;
  }
  if (weeks > 0) {
    return `${weeks} week${weeks > 1 ? "s" : ""}`;
  }
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}

function WorkshopSimilarCard({ workshop }: { workshop: IWorkshop }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative flex aspect-[16/10] items-center justify-center bg-muted">
        <BookOpen className="size-10 text-muted-foreground/50" />
        <Badge
          variant={getLevelBadgeVariant(getLevelName(workshop.level))}
          className="absolute top-2 right-2"
        >
          {getLevelName(workshop.level)}
        </Badge>
      </div>
      <CardContent className="flex flex-col gap-2 pt-4">
        <Badge variant="outline" className="w-fit text-xs">
          {getCategoryName(workshop.category)}
        </Badge>
        <Link href={`/workshops/${workshop.slug}`} className="group/title">
          <h4 className="line-clamp-1 text-sm font-semibold text-foreground group-hover/title:text-primary transition-colors">
            {workshop.title}
          </h4>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
        <p className="text-sm font-bold text-foreground">
          {formatCurrency(workshop.price ?? 0)}
        </p>
      </CardContent>
    </Card>
  );
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
      fetch(`${BACKEND_API_URL}/workshop/${slug}`, { next: { revalidate: 60 } }),
      fetch(`${BACKEND_API_URL}/category`, { next: { revalidate: 60 } }),
      fetch(`${BACKEND_API_URL}/workshop/levels`, { next: { revalidate: 60 } }),
      fetch(`${BACKEND_API_URL}/workshop?limit=4`, { next: { revalidate: 60 } }),
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
      const wCatId = typeof w.category === 'string' ? w.category : w.category?._id;
      const wsCatId = typeof workshop.category === 'string' ? workshop.category : workshop.category?._id;
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
                !similarWorkshops.some((s) => s._id === w._id)
            )
            .slice(0, 3 - similarWorkshops.length),
        ];

  const seatsAvailable = (workshop.maxSeats ?? 0) - workshop.currentEnrollments;
  const enrollmentPercentage =
    workshop.maxSeats
      ? (workshop.currentEnrollments / workshop.maxSeats) * 100
      : 0;

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Home className="size-3.5" />
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link
                href="/workshops"
                className="hover:text-foreground transition-colors"
              >
                Workshops
              </Link>
            </li>
            <li>
              <ChevronRight className="size-3.5" />
            </li>
            <li className="font-medium text-foreground line-clamp-1">
              {workshop.title}
            </li>
          </ol>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Top Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {workshop.title}
            </h1>

            {/* Level + Category Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant={getLevelBadgeVariant(getLevelName(workshop.level))}>
                {getLevelName(workshop.level)}
              </Badge>
              <Badge variant="outline">{getCategoryName(workshop.category)}</Badge>
            </div>

            {/* Info Pills */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {workshop.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-muted-foreground" />
                  {workshop.location}
                </span>
              )}
              {workshop.startDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-muted-foreground" />
                  {formatDate(workshop.startDate)}
                </span>
              )}
              {workshop.startDate && workshop.endDate && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4 text-muted-foreground" />
                  {computeDuration(workshop.startDate, workshop.endDate)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="size-4 text-muted-foreground" />
                {seatsAvailable} seat{seatsAvailable !== 1 ? "s" : ""} available
              </span>
              <span className="font-semibold text-foreground">
                {formatCurrency(workshop.price ?? 0)}
              </span>
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Main Content + Sidebar */}
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            {/* Left Column: Main Content */}
            <div className="space-y-10">
              {/* About This Workshop */}
              <section>
                <h2 className="mb-4 text-xl font-semibold text-foreground">
                  About This Workshop
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {workshop.description}
                </p>
              </section>

              {/* What You'll Learn */}
              {workshop.whatYouLearn?.length > 0 && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    What You&apos;ll Learn
                  </h2>
                  <ul className="space-y-3">
                    {workshop.whatYouLearn.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Prerequisites */}
              {workshop.prerequisites?.length > 0 && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Prerequisites
                  </h2>
                  <ul className="space-y-3">
                    {workshop.prerequisites.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Benefits */}
              {workshop.benefits?.length > 0 && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Benefits
                  </h2>
                  <ul className="space-y-3">
                    {workshop.benefits.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Star className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Syllabus */}
              {workshop.syllabus?.length > 0 && (
                <section>
                  <h2 className="mb-4 text-xl font-semibold text-foreground">
                    Syllabus
                  </h2>
                  <ol className="space-y-4">
                    {workshop.syllabus.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>

            {/* Right Column: Sidebar */}
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-foreground">
                    {formatCurrency(workshop.price ?? 0)}
                  </CardTitle>
                  <CardDescription>
                    {seatsAvailable > 0 ? (
                      <>
                        <span className="font-medium text-foreground">
                          {seatsAvailable}
                        </span>{" "}
                        seat{seatsAvailable !== 1 ? "s" : ""} available
                      </>
                    ) : (
                      <span className="text-destructive font-medium">
                        Workshop is full
                      </span>
                    )}
                  </CardDescription>
                  {/* Progress indicator */}
                  {workshop.maxSeats && (
                    <div className="mt-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${enrollmentPercentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {workshop.currentEnrollments} of {workshop.maxSeats}{" "}
                        enrolled
                      </p>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <Button className="w-full" size="lg" disabled={seatsAvailable <= 0} asChild>
                    <Link href={`/login?redirect=/workshops/${slug}`}>Enroll Now</Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Share2 />
                    Share Workshop
                  </Button>

                  <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                    <Shield className="size-4 text-primary" />
                    <span>Money-back guarantee</span>
                  </div>

                  <Separator />

                  {/* Instructor Info */}
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarFallback>
                        {getInitials(getCreatorName(workshop.createdBy) || "IN")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {getCreatorName(workshop.createdBy)}
                      </p>
                      <p className="text-xs text-muted-foreground">Instructor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>

          <Separator className="my-10" />

          {/* Similar Workshops */}
          {finalSimilar.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                Similar Workshops
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
      </div>
    </div>
  );
}
