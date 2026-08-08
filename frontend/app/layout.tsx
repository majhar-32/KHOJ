import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/RoleContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Khoj — Discover Events & Contests",
  description:
    "A centralized platform to discover, search, and track events and contests in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-50">
        <RoleProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </RoleProvider>
      </body>
    </html>
  );
}
