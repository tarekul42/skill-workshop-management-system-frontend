"use client";

import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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
    value: "+880 1XXX-XXXXXX",
    href: "tel:+8801XXXXXXXXX",
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    toast.success("Message sent successfully!");
    setFormData({ name: "", email: "", subject: "", message: "" });
  }

  return (
    <section className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      {/* Page Header */}
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-muted-foreground">
          We&apos;d love to hear from you. Reach out and let us know how we can
          help.
        </p>
      </div>

      {/* Two-column Layout */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left Column — Contact Info */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Get in Touch
            </h2>
            <p className="mt-2 text-muted-foreground">
              Have a question about our workshops, need help with enrollment, or
              just want to say hello? We&apos;re here to help. Reach out through
              any of the channels below or fill out the contact form.
            </p>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            {contactDetails.map((item) => {
              const IconComponent = item.icon;
              return (
                <Card key={item.label} size="sm">
                  <CardContent className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <IconComponent className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {item.value}
                        </p>
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
              Fill out the form below and we&apos;ll get back to you as soon as
              possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What is this about?"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more..."
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full" size="lg">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
