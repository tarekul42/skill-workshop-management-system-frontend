"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const LOCALES = {
  en: "English",
  bn: "বাংলা",
} as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const localeKey = locale as keyof typeof LOCALES;
  const toggleLocale = () => {
    const nextLocale = locale === "en" ? "bn" : "en";
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    startTransition(() => {
      router.replace(newPath);
      router.refresh();
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      disabled={isPending}
      aria-label={`Switch language to ${locale === "en" ? "Bengali" : "English"}`}
      className="gap-1.5 text-xs font-semibold"
    >
      <Globe className="size-3.5" />
      {LOCALES[localeKey]}
    </Button>
  );
}
