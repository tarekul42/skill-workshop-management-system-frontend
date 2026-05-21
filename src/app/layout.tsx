import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import "./globals.css";
import QueryProviders from "../providers/QueryProvider";
import { FRONTEND_URL } from "@/lib/constants";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(FRONTEND_URL),
  title: {
    default: "Skill Workshop Management System",
    template: "%s | Skill Workshop",
  },
  description:
    "Master new skills with expert-led workshops. Browse, enroll, and learn from industry professionals across Bangladesh. Affordable, hands-on training in web development, digital marketing, graphic design, and more.",
  keywords: [
    "skill workshop",
    "workshop management system",
    "online workshops",
    "skill development",
    "learn new skills",
    "expert-led workshops",
    "Bangladesh workshops",
    "web development courses",
    "digital marketing training",
    "graphic design workshops",
    "professional development",
    "career growth",
  ],
  authors: [{ name: "Skill Workshop" }],
  creator: "Skill Workshop",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Skill Workshop Management System",
    title: "Skill Workshop Management System",
    description:
      "Master new skills with expert-led workshops across Bangladesh. Affordable, hands-on training in web development, digital marketing, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Workshop Management System",
    description:
      "Master new skills with expert-led workshops across Bangladesh.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProviders>
            {children}
            <Toaster position="top-right" richColors />
          </QueryProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
