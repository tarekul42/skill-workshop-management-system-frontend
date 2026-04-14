import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, Globe } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Workshops", href: "/workshops" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

const supportLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Help Center", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
] as const;

const socialLinks = [
  { label: "Facebook", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "YouTube", href: "#" },
] as const;

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Branding */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <GraduationCap className="size-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                Skill Workshop
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Empowering learners with practical skills through expert-led
              workshops across Bangladesh.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Globe className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <a
                  href="mailto:info@skillworkshop.com"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  info@skillworkshop.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <a
                  href="tel:+8801XXXXXXXXX"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  +880 1XXX-XXXXXX
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Dhaka, Bangladesh
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <Separator className="my-8" />
        <p className="text-center text-sm text-muted-foreground">
          &copy; 2025 Skill Workshop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
