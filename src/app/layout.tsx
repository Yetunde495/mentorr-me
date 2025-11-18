import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import ReduxProvider from "./ReduxProvider";

const dmsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-default",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CurateLearn PivotLab – Learn, Build Skills, and Grow with Guided Mentorship",
  description:
    "PivotLab by CurateLearn helps learners build real skills through structured lessons, mentor guidance, hands-on tasks, and interactive assessments.",
  generator: "Next.js",
  applicationName: "CurateLearn PivotLab",
  referrer: "origin-when-cross-origin",
  keywords: [
    "CurateLearn",
    "PivotLab",
    "learning platform",
    "mentorship",
    "assessments",
    "skill development",
    "interactive learning",
    "edtech",
    "projects",
    "hands-on learning",
  ],
  authors: [{ name: "CurateLearn" }],
  creator: "CurateLearn",
  publisher: "CurateLearn",
  formatDetection: {
    email: true,
    telephone: true,
  },
  metadataBase: new URL("https://curatelearn.com"),
  openGraph: {
    title: "CurateLearn PivotLab – Learn with Mentors, Build Skills with Projects",
    description:
      "A new way to learn: structured lessons, mentor support, task labeling, assessments, and progress tracking — all in one powerful platform.",
    url: "https://curatelearn.com",
    type: "website",
    images: [
      {
        url: "https://curatelearn.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CurateLearn PivotLab – Learn, Build, and Grow",
    description:
      "Skill-building with structure: lessons, tasks, mentorship, and assessments — all in one place.",
    images: ["https://curatelearn.com/og-image.png"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dmsans.className}>
        <ReduxProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <main className="">{children}</main>
           
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
