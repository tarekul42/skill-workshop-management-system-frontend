import { BackButton } from "@/components/ui/back-button";

export default function TermsPage() {
  return (
    <div className="site-container max-w-3xl space-y-6 py-16">
      <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
      <p className="text-foreground-subtle leading-relaxed">
        Welcome to Skill Workshop. By accessing or using our platform, you agree to comply with and
        be bound by these terms and conditions.
      </p>
      <h2 className="mt-6 text-xl font-bold">Enrollment & Fees</h2>
      <p className="text-foreground-subtle leading-relaxed">
        All workshop fees are paid in full at the time of enrollment unless stated otherwise.
        Workshop seats are allocated on a first-come, first-served basis.
      </p>
      <h2 className="mt-6 text-xl font-bold">Code of Conduct</h2>
      <p className="text-foreground-subtle leading-relaxed">
        Participants are expected to maintain professional behavior during workshops and in
        interaction with instructors and other students. We reserve the right to revoke access to
        any participant violating these guidelines.
      </p>
      <div className="pt-8">
        <BackButton />
      </div>
    </div>
  );
}
