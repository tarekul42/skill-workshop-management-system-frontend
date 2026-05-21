export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function computeDuration(start: string, end: string): string {
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
