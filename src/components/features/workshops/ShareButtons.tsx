"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function ShareButtons() {
  const url = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        toast.error("Failed to copy link");
      });
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const shareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="icon-xs"
        className="rounded-full"
        aria-label="Copy Link"
        onClick={copyLink}
      >
        <Share2 className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="rounded-full"
        aria-label="Share on Facebook"
        onClick={shareFacebook}
      >
        <span className="text-xs font-bold">f</span>
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        className="rounded-full"
        aria-label="Share on LinkedIn"
        onClick={shareLinkedIn}
      >
        <span className="text-xs font-bold">in</span>
      </Button>
    </div>
  );
}
