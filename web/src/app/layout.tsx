import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MHT-CET Engineering Admissions | Find Your College",
  description: "Search and compare MHT-CET First Year Engineering colleges based on 2 years of admission data. Find your ideal institute by percentile, category, and seat type.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
