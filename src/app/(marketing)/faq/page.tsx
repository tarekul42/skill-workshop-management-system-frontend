"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
      "Anyone with a passion for learning can join! Most workshops have a minimum age requirement (usually 14–18 depending on the topic) and some may require basic prerequisites, which are clearly listed on each workshop page.",
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
      "Yes, you can cancel your enrollment up to 7 days before the workshop start date for a full refund minus a processing fee of ৳200. Cancellations within 7 days are not eligible for a refund, but you may transfer your seat to another person.",
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
      "All listed prices are inclusive of applicable taxes and VAT. There are no hidden charges — the price you see on the workshop page is what you pay.",
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

// ─── Tabs Config ───────────────────────────────────────────────────────────

const tabItems: { value: string; label: string; filter?: FAQCategory }[] = [
  { value: "all", label: "All" },
  { value: "general", label: "General", filter: "general" },
  { value: "enrollment", label: "Enrollment", filter: "enrollment" },
  { value: "payment", label: "Payment", filter: "payment" },
  { value: "workshops", label: "Workshops", filter: "workshops" },
];

// ─── FAQ Accordion ────────────────────────────────────────────────────────

function FAQAccordion({ faqs: faqList }: { faqs: IFAQ[] }) {
  if (faqList.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No questions found for this category.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqList.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>
            <p>{faq.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// ─── FAQ Page ─────────────────────────────────────────────────────────────

export default function FAQPage() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      {/* Page Header */}
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-muted-foreground">
          Find answers to common questions about our workshops
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-center">
          <TabsList>
            {tabItems.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* All Tab */}
        <TabsContent value="all">
          <Card>
            <CardContent className="p-4 md:p-6">
              <FAQAccordion faqs={faqs} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardContent className="p-4 md:p-6">
              <FAQAccordion
                faqs={faqs.filter((f) => f.category === "general")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment">
          <Card>
            <CardContent className="p-4 md:p-6">
              <FAQAccordion
                faqs={faqs.filter((f) => f.category === "enrollment")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment">
          <Card>
            <CardContent className="p-4 md:p-6">
              <FAQAccordion
                faqs={faqs.filter((f) => f.category === "payment")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workshops Tab */}
        <TabsContent value="workshops">
          <Card>
            <CardContent className="p-4 md:p-6">
              <FAQAccordion
                faqs={faqs.filter((f) => f.category === "workshops")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom CTA */}
      <div className="mx-auto mt-12 max-w-md rounded-lg border bg-muted/50 p-8 text-center md:mt-16">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <HelpCircle className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">Still have questions?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Can&apos;t find the answer you&apos;re looking for? Our team is here
          to help.
        </p>
        <Button asChild className="mt-5" size="lg">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </section>
  );
}
