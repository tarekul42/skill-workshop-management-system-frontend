import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Become an Instructor | Skill Workshop",
  },
  description:
    "Join Skill Workshop as an instructor. Share your expertise, create workshops, and earn by teaching skills you are passionate about.",
};

export default function InstructorRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
