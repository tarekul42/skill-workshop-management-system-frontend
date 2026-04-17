"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  BookOpen,
  PenLine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { storeOTPEmail } from "@/lib/auth-helpers";
import { apiClient } from "@/lib/api-client";
import { isPasswordValid } from "@/lib/validation/password";
import { PasswordChecklist } from "@/components/shared/PasswordChecklist";



export default function InstructorRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [expertise, setExpertise] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordValid = isPasswordValid(password);
  const passwordsMatch = password.length > 0 && confirmPassword === password;
  const bioValid = bio.trim().length > 0 && bio.length <= 300;
  const formValid =
    name.trim().length >= 2 &&
    name.trim().length <= 50 &&
    email.trim().length > 0 &&
    passwordValid &&
    passwordsMatch &&
    expertise.trim().length > 0 &&
    bioValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formValid) return;

    setLoading(true);
    try {
      await apiClient("/user/register", {
        method: "POST",
        body: {
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
        },
      });
      await apiClient("/otp/send", {
        method: "POST",
        body: {
          email: email.trim(),
          name: name.trim(),
        },
      });
      storeOTPEmail(email.trim());
      router.push("/verify-otp");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="text-center">
        <Link href="/" className="mx-auto mb-2 flex items-center gap-2">
          <GraduationCap className="size-6 text-primary" />
          <span className="text-lg font-semibold">Skill Workshop</span>
        </Link>
        <CardTitle className="text-xl">Register as Instructor</CardTitle>
        <CardDescription>Share your expertise with students</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Full Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="name">
              <User className="size-3.5" />
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              required
              placeholder="Enter your full name"
              minLength={2}
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div className="grid gap-1.5">
            <Label htmlFor="email">
              <Mail className="size-3.5" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Phone (recommended) */}
          <div className="grid gap-1.5">
            <Label htmlFor="phone">
              <Phone className="size-3.5" />
              Phone{" "}
              <span className="text-muted-foreground font-normal">
                (recommended)
              </span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+8801XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Bangladesh format</p>
          </div>

          {/* Password */}
          <div className="grid gap-1.5">
            <Label htmlFor="password">
              <Lock className="size-3.5" />
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="pr-9"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            <PasswordChecklist password={password} />
          </div>

          {/* Confirm Password */}
          <div className="grid gap-1.5">
            <Label htmlFor="confirmPassword">
              <Lock className="size-3.5" />
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="pr-9"
                aria-invalid={confirmPassword.length > 0 && !passwordsMatch}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          {/* Expertise */}
          <div className="grid gap-1.5">
            <Label htmlFor="expertise">
              <BookOpen className="size-3.5" />
              Expertise / Specialization
            </Label>
            <Input
              id="expertise"
              type="text"
              required
              placeholder="e.g., Web Development, Digital Marketing"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Bio */}
          <div className="grid gap-1.5">
            <Label htmlFor="bio">
              <PenLine className="size-3.5" />
              Short Bio
            </Label>
            <Textarea
              id="bio"
              required
              placeholder="Tell us about your experience and teaching background"
              maxLength={300}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              className="min-h-20 resize-y"
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/300
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!formValid || loading}
          >
            {loading && <Loader2 className="animate-spin" />}
            Submit Application
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          Just want to learn?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Register as Student
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
