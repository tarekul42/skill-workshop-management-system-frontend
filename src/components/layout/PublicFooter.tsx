import Link from "next/link";
import { GraduationCap, Mail, Phone, MapPin, Globe, MessageSquare, Share2, Play } from "lucide-react";

const platformLinks = [
  { label: "Browse Workshops", href: "/workshops" },
  { label: "Categories", href: "/categories" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "FAQ", href: "/faq" },
] as const;

const instructorLinks = [
  { label: "Become an Instructor", href: "/register?role=instructor" },
  { label: "Instructor Dashboard", href: "/instructor/dashboard" },
  { label: "Teaching Resources", href: "/resources" },
  { label: "Support", href: "/support" },
] as const;

const socialLinks = [
  { label: "Facebook", href: "#", icon: Globe },
  { label: "Twitter", href: "#", icon: MessageSquare },
  { label: "LinkedIn", href: "#", icon: Share2 },
  { label: "YouTube", href: "#", icon: Play },
] as const;

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-sidebar-bg text-sidebar-text">
      <div className="site-container py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <GraduationCap className="size-8 text-primary transition-transform group-hover:scale-110" />
              <span className="font-display text-2xl font-extrabold tracking-tight">
                Skill<span className="text-primary">Workshop</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-sidebar-text-muted max-w-xs">
              Empowering the next generation of Bangladeshi professionals through high-impact, hands-on skill training led by industry experts.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-xl bg-sidebar-hover text-sidebar-text-muted transition-all hover:bg-primary hover:text-white"
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="mb-6 font-display text-lg font-bold text-white">Platform</h3>
            <ul className="space-y-4">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Instructors */}
          <div>
            <h3 className="mb-6 font-display text-lg font-bold text-white">For Instructors</h3>
            <ul className="space-y-4">
              {instructorLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sidebar-text-muted transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="mb-6 font-display text-lg font-bold text-white">Contact Info</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-hover">
                  <Mail className="size-5 text-primary" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase tracking-wider text-sidebar-text-muted">Email Us</span>
                   <a href="mailto:info@skillworkshop.com" className="text-sm font-medium transition-colors hover:text-primary">
                     info@skillworkshop.com
                   </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-hover">
                   <Phone className="size-5 text-primary" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase tracking-wider text-sidebar-text-muted">Call Us</span>
                   <a href="tel:+8801234567890" className="text-sm font-medium transition-colors hover:text-primary">
                     +880 1234-567890
                   </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-hover">
                   <MapPin className="size-5 text-primary" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase tracking-wider text-sidebar-text-muted">Office</span>
                   <span className="text-sm font-medium text-sidebar-text">
                     Dhaka, Bangladesh
                   </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 border-t border-white/5 pt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-sidebar-text-muted">
            &copy; {new Date().getFullYear()} Skill Workshop. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-xs font-medium text-sidebar-text-muted hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs font-medium text-sidebar-text-muted hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
