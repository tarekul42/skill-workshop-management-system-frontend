import Image from "next/image";
import Link from "next/link";
import { Users, Star, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/formatters";

const coreValues = [
  {
    icon: Globe,
    title: "Accessibility",
    description:
      "We believe everyone deserves access to quality education, regardless of their background or location. Our workshops are priced affordably, held in multiple cities across Bangladesh, and offered in hybrid formats so that no one is left behind — whether you are in Dhaka or a remote district.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
  },
  {
    icon: Star,
    title: "Quality",
    description:
      "Every workshop on our platform goes through a rigorous vetting process. We partner only with verified instructors who have proven industry track records, and each curriculum is reviewed by subject matter experts to ensure you are learning the most current, job-ready skills available.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Learning is better together. Our platform isn't just a marketplace — it's a growing network of learners, mentors, and employers. Join study groups, attend networking events, and connect with peers and alumni who are building the future of Bangladesh's tech industry side by side.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
  },
];

const team = [
  {
    name: "Rafiq Ahmed",
    role: "Founder & Lead Instructor",
    bio: "With over 12 years of experience in web development and tech education, Rafiq founded Skill Workshop to bridge the skills gap in Bangladesh's growing tech industry. He has trained over 2,000 students and built teams at multiple startups.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&q=60&fit=crop",
  },
  {
    name: "Tasnim Rahman",
    role: "Head of Curriculum",
    bio: "A digital marketing strategist and former university lecturer, Tasnim designs workshop curricula that blend academic rigor with practical, job-ready skills. She holds an MBA from IBA and has consulted for 15+ organizations.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&q=60&fit=crop",
  },
  {
    name: "Sadia Islam",
    role: "Creative Director",
    bio: "An award-winning graphic designer and creative professional, Sadia leads our design workshops and ensures every learning experience is visually engaging. Her work has been featured in 3 international design publications.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&q=60&fit=crop",
  },
  {
    name: "Imran Hossain",
    role: "Technology Lead",
    bio: "A full-stack engineer and open-source contributor, Imran manages the platform infrastructure and teaches programming and data science workshops. He has contributed to 12+ open-source projects used by thousands of developers.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&q=60&fit=crop",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="from-primary/10 via-primary/5 to-background relative overflow-hidden bg-linear-to-br">
        <div className="bg-primary/5 pointer-events-none absolute -top-24 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="site-container relative grid items-center gap-16 pt-24 pb-16 sm:pt-32 lg:grid-cols-2">
          <div className="mx-auto max-w-3xl text-center lg:text-left">
            <span className="text-primary mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
              About Us
            </span>
            <h1 className="text-foreground font-display text-4xl font-bold tracking-tight sm:text-5xl">
              About <span className="text-primary">Skill Workshop</span>
            </h1>
            <p className="text-foreground-subtle mx-auto mt-6 max-w-2xl text-lg lg:mx-0">
              We are on a mission to empower individuals across Bangladesh with practical,
              industry-ready skills through expert-led workshops that inspire confidence and unlock
              new career opportunities.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                alt="Team collaborating at Skill Workshop"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="text-foreground font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Our Story
            </h2>
            <div className="mt-6 space-y-4">
              <p className="text-foreground-subtle leading-relaxed">
                Skill Workshop was founded in 2023 with a simple but powerful vision: to make
                high-quality skill education accessible to everyone in Bangladesh. What started as a
                small series of coding bootcamps in Dhaka quickly grew into a thriving community of
                learners, instructors, and industry professionals united by a shared passion for
                growth.
              </p>
              <p className="text-foreground-subtle leading-relaxed">
                Today, we operate workshops in multiple cities across the country, covering
                everything from web development and digital marketing to graphic design and data
                science. Our graduates have gone on to land roles at top tech companies, launch
                their own businesses, and contribute meaningfully to Bangladesh&apos;s rapidly
                evolving digital economy. We are proud of every milestone, but we are even more
                excited about the journey ahead.
              </p>
            </div>
          </div>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
              alt="Skill Workshop classroom session"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="bg-surface-1">
        <div className="site-container py-24">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-primary mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
              Mission
            </span>
            <h2 className="text-foreground font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Our Mission
            </h2>
            <p className="text-foreground-subtle mx-auto mt-6 max-w-2xl leading-relaxed">
              We aim to democratize skill education in Bangladesh by providing affordable, hands-on
              workshops led by industry experts. Whether you are a student, a working professional,
              or an aspiring entrepreneur, we are here to help you build the skills that matter — no
              matter where you are starting from.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {coreValues.map((value) => (
              <Card key={value.title}>
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={value.image}
                    alt={value.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="bg-background/90 flex size-10 items-center justify-center rounded-lg backdrop-blur-sm">
                      <value.icon className="text-primary size-5" />
                    </div>
                  </div>
                </div>
                <CardContent className="pt-5">
                  <CardTitle className="font-bold">{value.title}</CardTitle>
                  <CardDescription className="mt-2">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-24">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-primary mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
            Team
          </span>
          <h2 className="text-foreground font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Meet Our Team
          </h2>
          <p className="text-foreground-subtle mt-6">The passionate people behind Skill Workshop</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member) => (
            <Card key={member.name}>
              <CardContent className="flex flex-col items-center pt-6 text-center">
                <Avatar className="size-20">
                  <AvatarImage src={member.image} alt={member.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4 font-bold">{member.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {member.role}
                </Badge>
                <CardDescription className="mt-3">{member.bio}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary">
        <div className="site-container py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-primary-foreground font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Join Our Growing Community
            </h2>
            <p className="text-primary-foreground/80 mt-4">
              Start your learning journey today and become part of a network that&apos;s
              transforming careers across Bangladesh.
            </p>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="bg-background text-foreground hover:bg-background/90 mt-8"
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
