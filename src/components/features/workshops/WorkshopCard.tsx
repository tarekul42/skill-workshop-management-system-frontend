import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, computeDuration } from "@/lib/formatters";
import { getLevelName, getCategoryName } from "@/lib/api/services";
import type { IWorkshop } from "@/types";

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

interface WorkshopCardProps {
  workshop: IWorkshop;
  showDescription?: boolean;
  imageHeight?: string;
  iconSize?: number;
}

export default function WorkshopCard({
  workshop,
  showDescription = true,
  imageHeight = "h-50",
  iconSize = 12,
}: WorkshopCardProps) {
  const percentEnrolled = workshop.currentEnrollments / (workshop.maxSeats ?? 1);
  const bgClass =
    percentEnrolled <= 0.5 ? "bg-success" : percentEnrolled <= 0.75 ? "bg-warning" : "bg-danger";
  const textClass =
    percentEnrolled <= 0.5
      ? "text-success"
      : percentEnrolled <= 0.75
        ? "text-warning"
        : "text-danger";

  return (
    <div className="group flex flex-col">
      <div className="border-border bg-surface-1 shadow-raised hover:shadow-float flex flex-1 flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.75">
        <div className={`relative ${imageHeight} shrink-0 overflow-hidden`}>
          {workshop.images && workshop.images.length > 0 ? (
            <Image
              src={workshop.images[0]}
              alt={workshop.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-104"
              loading="lazy"
            />
          ) : (
            <div className="bg-surface-3 flex h-full w-full items-center justify-center">
              <BookOpen
                className="text-foreground-disabled"
                style={{ width: iconSize * 4, height: iconSize * 4 }}
              />
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge variant={getLevelBadgeVariant(getLevelName(workshop.level))}>
              {getLevelName(workshop.level)}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <div className="bg-background/90 font-display text-foreground rounded-lg px-3 py-1.5 text-sm font-bold backdrop-blur-md">
              {formatCurrency(workshop.price ?? 0)}
            </div>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex items-center gap-2">
            <div className="bg-primary size-2 rounded-full" />
            <span className="text-primary text-[12px] font-semibold tracking-[0.02em] uppercase">
              {getCategoryName(workshop.category)}
            </span>
          </div>

          <Link href={`/workshops/${workshop.slug}`}>
            <h3 className="font-display text-foreground group-hover:text-primary line-clamp-2 text-lg font-bold transition-colors">
              {workshop.title}
            </h3>
          </Link>

          {showDescription && (
            <p className="text-foreground-subtle mt-2 line-clamp-3 text-sm">
              {workshop.description}
            </p>
          )}

          <div className="text-foreground-subtle mt-4 flex flex-wrap items-center gap-4 text-xs">
            {workshop.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="text-primary size-3.5" />
                <span>{workshop.location}</span>
              </div>
            )}
            {workshop.startDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="text-primary size-3.5" />
                <span>{formatDate(workshop.startDate)}</span>
              </div>
            )}
            {workshop.startDate && workshop.endDate && (
              <div className="flex items-center gap-1.5">
                <Clock className="text-primary size-3.5" />
                <span>{computeDuration(workshop.startDate, workshop.endDate)}</span>
              </div>
            )}
          </div>

          <div className="mt-auto" />

          <div className="border-border my-4 border-t" />

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="bg-border mb-1 h-1.5 w-full rounded-full">
                <div
                  className={`h-full rounded-full ${bgClass}`}
                  style={{ width: `${Math.min(100, percentEnrolled * 100)}%` }}
                />
              </div>
              <p className={`text-[12px] font-semibold ${textClass}`}>
                {workshop.maxSeats ? workshop.maxSeats - workshop.currentEnrollments : "∞"} seats
                left
              </p>
            </div>
            <Link
              href={`/workshops/${workshop.slug}`}
              className="text-primary ml-4 text-sm font-semibold transition-colors group-hover:underline"
            >
              Enroll Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
