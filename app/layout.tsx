import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ImplantCheck — Expert Implant Planning Review",
  description:
    "Submit your implant treatment plans for expert review. Get feedback from Dr. Avik Dandapat. Plan better. Place better. Confidence in every case.",
  keywords: [
    "implant planning",
    "dental implant review",
    "treatment plan evaluation",
    "implantology",
    "CBCT review",
    "STL review",
    "Dr Avik Dandapat",
  ],
  openGraph: {
    title: "ImplantCheck — Expert Implant Planning Review",
    description:
      "Submit your implant treatment plans for expert review. Plan better. Place better.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ebGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
