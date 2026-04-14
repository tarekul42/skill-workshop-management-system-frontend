import Link from "next/link";
import { Users, Star, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";

// ─── Static Data ──────────────────────────────────────────────────────────

const coreValues = [
  {
    icon: Globe,
    title: "Accessibility",
    description:
      "We believe everyone deserves access to quality education, regardless of their background or location. Our workshops are designed to be affordable and available across Bangladesh.",
  },
  {
    icon: Star,
    title: "Quality",
    description:
      "Every workshop is vetted and curated by our team to ensure it meets the highest standards. We work only with verified instructors who have proven industry experience.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Learning is better together. Our platform fosters a supportive community of learners, mentors, and professionals who help each other grow and succeed.",
  },
];

const team = [
  {
    name: "Rafiq Ahmed",
    role: "Founder & Lead Instructor",
    bio: "With over 12 years of experience in web development and tech education, Rafiq founded Skill Workshop to bridge the skills gap in Bangladesh's growing tech industry.",
  },
  {
    name: "Tasnim Rahman",
    role: "Head of Curriculum",
    bio: "A digital marketing strategist and former university lecturer, Tasnim designs workshop curricula that blend academic rigor with practical, job-ready skills.",
  },
  {
    name: "Sadia Islam",
    role: "Creative Director",
    bio: "An award-winning graphic designer and creative professional, Sadia leads our design workshops and ensures every learning experience is visually engaging.",
  },
  {
    name: "Imran Hossain",
    role: "Technology Lead",
    bio: "A full-stack engineer and open-source contributor, Imran manages the platform infrastructure and teaches programming and data science workshops.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden `bg-linear-to-br from-primary/10 via-primary/5 to-background">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              About <span className="text-primary">Skill Workshop</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              We are on a mission to empower individuals across Bangladesh with
              practical, industry-ready skills through expert-led workshops that
              inspire confidence and unlock new career opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Story ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Our Story
          </h2>
          <div className="mt-6 space-y-4">
            <p className="leading-relaxed text-muted-foreground">
              Skill Workshop was founded in 2023 with a simple but powerful
              vision: to make high-quality skill education accessible to
              everyone in Bangladesh. What started as a small series of coding
              bootcamps in Dhaka quickly grew into a thriving community of
              learners, instructors, and industry professionals united by a
              shared passion for growth.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Today, we operate workshops in multiple cities across the country,
              covering everything from web development and digital marketing to
              graphic design and data science. Our graduates have gone on to
              land roles at top tech companies, launch their own businesses, and
              contribute meaningfully to Bangladesh&apos;s rapidly evolving
              digital economy. We are proud of every milestone, but we are even
              more excited about the journey ahead.
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Mission ───────────────────────────────────────────── */}
      <section className="bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Our Mission
            </h2>
            <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-muted-foreground">
              We aim to democratize skill education in Bangladesh by providing
              affordable, hands-on workshops led by industry experts. Whether
              you are a student, a working professional, or an aspiring
              entrepreneur, we are here to help you build the skills that matter
              — no matter where you are starting from.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {coreValues.map((value) => (
              <Card key={value.title}>
                <CardContent className="flex flex-col items-center text-center">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                    <value.icon className="size-7 text-primary" />
                  </div>
                  <CardTitle className="mt-4 font-semibold">
                    {value.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Team ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Meet Our Team
          </h2>
          <p className="mt-2 text-muted-foreground">
            The passionate people behind Skill Workshop
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <Card key={member.name}>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4 font-semibold">
                  {member.name}
                </CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {member.role}
                </Badge>
                <CardDescription className="mt-3">{member.bio}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
              Join Our Growing Community
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Start your learning journey today and become part of a network
              that&apos;s transforming careers across Bangladesh.
            </p>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="mt-8 bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/workshops">
                Browse Workshops
                <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
