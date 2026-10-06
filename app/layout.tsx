import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SUPPLEMENT FACTORY LK | Premium Hardcore Nutrition Sri Lanka",
  description:
    "Sri Lanka's premier importer of lab-tested whey isolates, hardcore stim pre-workouts, and Creapure creatine. 4-hour Available-To-Promise stock lock with instant WhatsApp bank transfer checkout.",
  keywords: [
    "Supplements Sri Lanka",
    "Whey Protein Colombo",
    "Pre Workout Sri Lanka",
    "Creatine Monohydrate LK",
    "Gym Supplements Kandy",
    "Supplement Factory LK",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100">{children}</body>
    </html>
  );
}
