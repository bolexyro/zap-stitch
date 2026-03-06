import Navbar from "@/components/Navbar";
import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Stitch — Payment Aggregation",
  description:
    "Combine funds from multiple bank accounts into a single outbound payment. A Paystack POC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${caveat.variable} font-sans antialiased`}>
        <Navbar />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
