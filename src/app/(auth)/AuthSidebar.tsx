"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote: "The React workshop completely changed how I build web apps. Highly recommended!",
    author: "Sarah J.",
    role: "Frontend Developer"
  },
  {
    quote: "I landed my first job after completing the Full Stack track. The instructors are amazing.",
    author: "Ahmed R.",
    role: "Software Engineer"
  },
  {
    quote: "Practical, hands-on learning that you just don't get from standard online courses.",
    author: "Priya M.",
    role: "UX Designer"
  }
];

export function AuthSidebar() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative hidden w-2/5 flex-col justify-between overflow-hidden bg-primary px-12 py-16 lg:flex">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.15),transparent)]" />
      <div className="absolute inset-0 z-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

      {/* Top Section */}
      <div className="relative z-10">
        <Link href="/" className="flex items-center gap-2 text-primary-foreground mb-16 w-fit">
          <BookOpen className="size-8" />
          <span className="font-display text-xl font-bold">Skill Workshop</span>
        </Link>

        <h2 className="font-display text-[36px] font-bold leading-tight text-primary-foreground">
          Learn. Grow. Succeed.
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/80 max-w-sm">
          Join 500+ students building their futures with verified experts.
        </p>

        <div className="mt-10 space-y-4">
          {["Real workshops", "Expert instructors", "BDT payments"].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-primary-foreground/90">
              <CheckCircle className="size-5 text-primary-foreground" />
              <span className="font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section - Testimonials */}
      <div className="relative z-10 h-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <p className="text-lg font-medium italic text-primary-foreground/90">
              "{testimonials[currentIdx].quote}"
            </p>
            <div>
              <p className="font-bold text-primary-foreground">{testimonials[currentIdx].author}</p>
              <p className="text-sm text-primary-foreground/70">{testimonials[currentIdx].role}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
