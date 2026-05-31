import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AiChatbot from "@/components/AiChatbot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SCAAS — Smart Campus Attendance & Analytics System",
  description: "Next-generation real-time digital student attendance tracking, predictive deficit analytics, and intelligent campus management platform.",
  keywords: ["smart campus", "attendance system", "analytics", "education", "SaaS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        {/* Futuristic global grid matrix */}
        <div className="cyber-grid-backdrop" />
        <div className="flex-1 flex flex-col relative z-10">
          {children}
        </div>
        <AiChatbot />
      </body>
    </html>
  );
}
