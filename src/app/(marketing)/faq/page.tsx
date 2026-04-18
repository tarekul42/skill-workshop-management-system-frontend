"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Headphones,
  BookOpen,
  CreditCard,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

// ─── Inline FAQ Data ─────────────────────────────────────────────────────

type FAQCategory = "general" | "enrollment" | "payment" | "workshops";

interface IFAQ {
  id: string;
  question: string;
  answer: string;
  category: FAQCategory;
}

const faqs: IFAQ[] = [
  {
    id: "faq-001",
    question: "What is this platform about?",
    answer:
      "Our platform connects skilled instructors with learners across Bangladesh through hands-on workshops. We cover a wide range of topics including web development, digital marketing, graphic design, programming, photography, and data science.",
    category: "general",
  },
  {
    id: "faq-002",
    question: "Who can attend the workshops?",
    answer:
      "Anyone with a passion for learning can join! Most workshops have a minimum age requirement (usually 14\u201318 depending on the topic) and some may require basic prerequisites, which are clearly listed on each workshop page.",
    category: "general",
  },
  {
    id: "faq-003",
    question: "Where are the workshops held?",
    answer:
      "Our workshops are held in major cities across Bangladesh including Dhaka, Chittagong, Sylhet, and Rajshahi. Venue details are provided after enrollment. We also plan to introduce online workshops in the near future.",
    category: "general",
  },
  {
    id: "faq-004",
    question: "Will I receive a certificate after completing a workshop?",
    answer:
      "Yes! All participants who successfully complete a workshop receive a certificate of completion. Some workshops also offer industry-recognized certifications as part of the curriculum.",
    category: "general",
  },
  {
    id: "faq-005",
    question: "How do I enroll in a workshop?",
    answer:
      "Simply browse our available workshops, select the one you are interested in, and click the 'Enroll Now' button. You will need to create an account or log in, fill in your details, and confirm your seat by completing the payment.",
    category: "enrollment",
  },
  {
    id: "faq-006",
    question: "Can I cancel my enrollment and get a refund?",
    answer:
      "Yes, you can cancel your enrollment up to 7 days before the workshop start date for a full refund minus a processing fee of \u09F3200. Cancellations within 7 days are not eligible for a refund, but you may transfer your seat to another person.",
    category: "enrollment",
  },
  {
    id: "faq-007",
    question: "Is there a limit on how many workshops I can enroll in?",
    answer:
      "There is no limit! You can enroll in as many workshops as you like, as long as the schedules do not overlap and seats are available.",
    category: "enrollment",
  },
  {
    id: "faq-008",
    question: "What happens if a workshop is full?",
    answer:
      "If a workshop reaches its maximum capacity, you can join the waitlist. We will notify you via email and SMS if a seat becomes available before the workshop begins.",
    category: "enrollment",
  },
  {
    id: "faq-009",
    question: "Do I need to bring my own laptop or equipment?",
    answer:
      "For technical workshops such as web development, programming, and graphic design, you will need to bring your own laptop. Equipment requirements are listed on each workshop page. For photography workshops, you will need a camera (DSLR, mirrorless, or smartphone with manual mode).",
    category: "enrollment",
  },
  {
    id: "faq-010",
    question: "What payment methods do you accept?",
    answer:
      "We accept bKash, Nagad, Rocket, bank transfers, and major credit/debit cards (Visa, Mastercard). All online payments are secured with SSL encryption.",
    category: "payment",
  },
  {
    id: "faq-011",
    question: "Is there an EMI or installment option available?",
    answer:
      "Currently, we do not offer EMI or installment plans. Full payment is required at the time of enrollment. However, we frequently run seasonal discounts and early-bird promotions that can help reduce the cost.",
    category: "payment",
  },
  {
    id: "faq-012",
    question: "Can I get a corporate discount for group enrollments?",
    answer:
      "Yes, we offer special group and corporate discounts for organizations enrolling 5 or more participants. Please contact us at support@example.com or call our hotline for customized pricing.",
    category: "payment",
  },
  {
    id: "faq-013",
    question: "Are the workshop prices inclusive of VAT and taxes?",
    answer:
      "All listed prices are inclusive of applicable taxes and VAT. There are no hidden charges \u2014 the price you see on the workshop page is what you pay.",
    category: "payment",
  },
  {
    id: "faq-014",
    question: "What is the typical duration of a workshop?",
    answer:
      "Most of our workshops run between 2 to 4 weeks, with sessions held on weekends or weekday evenings. The exact schedule is mentioned on each workshop's detail page, including session times and any fieldwork components.",
    category: "workshops",
  },
  {
    id: "faq-015",
    question: "Are the instructors experienced professionals?",
    answer:
      "Absolutely. All our instructors are verified professionals with years of industry experience in their respective fields. Many of them have worked with top companies in Bangladesh and internationally. Instructor profiles are available on each workshop page.",
    category: "workshops",
  },
  {
    id: "faq-016",
    question: "Will I get access to workshop materials after it ends?",
    answer:
      "Yes, all enrolled participants receive lifetime access to recorded sessions, slide decks, source code, and any supplementary materials shared during the workshop. This ensures you can revisit and reinforce your learning at any time.",
    category: "workshops",
  },
];

// ─── Category Config ─────────────────────────────────────────────────────

const categories: {
  value: FAQCategory | "all";
  label: string;
  icon: React.ElementType;
  description: string;
  count: number;
}[] = [
  {
    value: "all",
    label: "All Questions",
    icon: HelpCircle,
    description: "Browse all frequently asked questions",
    count: faqs.length,
  },
  {
    value: "general",
    label: "General",
    icon: MessageCircle,
    description: "Platform info, locations, and certificates",
    count: faqs.filter((f) => f.category === "general").length,
  },
  {
    value: "enrollment",
    label: "Enrollment",
    icon: ClipboardList,
    description: "How to enroll, cancel, and transfer seats",
    count: faqs.filter((f) => f.category === "enrollment").length,
  },
  {
    value: "payment",
    label: "Payment",
    icon: CreditCard,
    description: "Payment methods, pricing, and refunds",
    count: faqs.filter((f) => f.category === "payment").length,
  },
  {
    value: "workshops",
    label: "Workshops",
    icon: BookOpen,
    description: "Duration, instructors, and materials",
    count: faqs.filter((f) => f.category === "workshops").length,
  },
];

// ─── FAQ Accordion ────────────────────────────────────────────────────────

function FAQAccordion({ faqs: faqList }: { faqs: IFAQ[] }) {
  if (faqList.length === 0) {
    return (
      <div className="py-12 text-center">
        <HelpCircle className="mx-auto mb-3 size-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          No questions found for this category.
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqList.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="px-6 py-4 text-left text-sm font-medium leading-relaxed hover:no-underline sm:text-base">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// ─── FAQ Page ─────────────────────────────────────────────────────────────

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory | "all">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFAQs = useMemo(() => {
    let results =
      activeCategory === "all"
        ? faqs
        : faqs.filter((f) => f.category === activeCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(
        (f) =>
          f.question.toLowerCase().includes(query) ||
          f.answer.toLowerCase().includes(query),
      );
    }

    return results;
  }, [activeCategory, searchQuery]);

  return (
    <section className="site-container py-12 md:py-16 lg:py-20">
      {/* Page Header */}
      <div className="mb-10 md:mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Find answers to common questions about our workshops, enrollment,
          payments, and more.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:gap-12">
        {/* ── Left Sidebar ───────────────────────────────────────── */}
        <aside className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Cards */}
          <div className="space-y-2">
            <p className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.value;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {cat.label}
                      </span>
                      {!isActive && (
                        <span className="block truncate text-xs text-muted-foreground/70">
                          {cat.description}
                        </span>
                      )}
                    </div>
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* CTA Card */}
          <div className="rounded-xl border bg-muted/40 p-6">
            <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Headphones className="size-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold">Still have questions?</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Can&apos;t find the answer you&apos;re looking for? Our support
              team is here to help.
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          </div>
        </aside>

        {/* ── Right Content ───────────────────────────────────────── */}
        <div>
          {/* Active filter indicator */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredFAQs.length}
              </span>{" "}
              question{filteredFAQs.length !== 1 ? "s" : ""}
              {activeCategory !== "all" && (
                <>
                  {" "}
                  in{" "}
                  <span className="font-medium text-foreground">
                    {categories.find((c) => c.value === activeCategory)?.label}
                  </span>
                </>
              )}
              {searchQuery.trim() && (
                <>
                  {" "}
                  matching &ldquo;
                  <span className="font-medium text-foreground">
                    {searchQuery}
                  </span>
                  &rdquo;
                </>
              )}
            </p>
            {(activeCategory !== "all" || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* FAQ Accordion */}
          <div className="rounded-xl border bg-card">
            <FAQAccordion faqs={filteredFAQs} />
          </div>
        </div>
      </div>
    </section>
  );
}
