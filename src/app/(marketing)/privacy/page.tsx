import { BackButton } from "@/components/ui/back-button";

export default function PrivacyPage() {
  return (
    <div className="site-container max-w-3xl space-y-6 py-16">
      <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
      <p className="text-foreground-subtle leading-relaxed">
        At Skill Workshop, we take your privacy seriously. This policy outlines how we collect, use,
        and protect your personal information when you use our platform.
      </p>
      <h2 className="mt-6 text-xl font-bold">Information Collection</h2>
      <p className="text-foreground-subtle leading-relaxed">
        We collect personal data that you provide directly to us during account creation, workshop
        enrollment, or contact submissions (such as name, email address, and phone number).
      </p>
      <h2 className="mt-6 text-xl font-bold">Data Usage</h2>
      <p className="text-foreground-subtle leading-relaxed">
        Your data is used to manage your enrollments, process payments securely, verify your
        identity via OTP, and communicate important updates regarding your workshops.
      </p>
      <div className="pt-8">
        <BackButton />
      </div>
    </div>
  );
}
