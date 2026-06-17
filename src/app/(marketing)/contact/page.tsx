"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle, Loader2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { contactSchema, type ContactInput } from "@/lib/validations/contact";
import { submitContact } from "@/lib/api/services";

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: "info@skillworkshop.com",
    href: "mailto:info@skillworkshop.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+880 1712-345678",
    href: "tel:+8801712345678",
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Dhaka, Bangladesh",
    href: undefined,
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Saturday - Thursday, 9:00 AM - 6:00 PM",
    href: undefined,
  },
];

export default function ContactPage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: ContactInput) {
    try {
      await submitContact(values);
      setSubmitSuccess(true);
      form.reset();
      toast.success("Message sent successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send message. Please try again.";
      toast.error(message);
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="from-primary/10 via-primary/5 to-background relative overflow-hidden bg-linear-to-br py-24">
        <div className="bg-primary/5 pointer-events-none absolute -top-24 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="site-container text-center">
          <span className="text-primary mb-4 block text-xs font-bold tracking-[0.2em] uppercase">
            Contact
          </span>
          <h1 className="text-foreground font-display mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="text-foreground-subtle mx-auto mt-6 max-w-2xl text-lg">
            We&apos;d love to hear from you. Reach out and let us know how we can help.
          </p>
        </div>
      </section>

      <section className="site-container py-24">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Left Column — Contact Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-foreground font-display text-2xl font-bold tracking-tight">
                Get in Touch
              </h2>
              <p className="text-foreground-subtle mt-3">
                Have a question about our workshops, need help with enrollment, or just want to say
                hello? We&apos;re here to help. Reach out through any of the channels below or fill
                out the contact form.
              </p>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              {contactDetails.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Card key={item.label} size="sm">
                    <CardContent className="flex items-start gap-3">
                      <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                        <IconComponent className="text-primary size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-foreground-muted hover:text-foreground text-sm hover:underline"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-foreground-muted text-sm">{item.value}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Right Column — Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Send us a message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Success State */}
              {submitSuccess && (
                <div className="border-border bg-success-subtle mb-6 flex items-start gap-3 rounded-xl border p-5">
                  <CheckCircle className="text-success mt-0.5 size-5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-success text-sm font-bold">Message sent successfully!</p>
                    <p className="text-success/80 mt-1 text-sm">
                      Thank you for reaching out. We&apos;ll get back to you within 24–48 hours.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="text-success/60 hover:text-success shrink-0 transition-colors"
                    aria-label="Dismiss success message"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel>
                          Name <span className="text-danger">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your name"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel>
                          Email <span className="text-danger">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subject */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel>
                          Subject <span className="text-danger">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="What is this about?"
                            disabled={form.formState.isSubmitting}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel>
                          Message <span className="text-danger">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more..."
                            disabled={form.formState.isSubmitting}
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <div className="flex items-center justify-between">
                          <FormMessage />
                          <span className="text-foreground-muted text-xs">
                            {field.value.length}/5000
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
