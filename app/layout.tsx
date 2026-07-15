import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: { default: "Skills Board, one trusted skill library for your product team", template: "%s · Skills Board" },
  description: "Curate the skills your product, design, and engineering teams use with AI agents. Free, open source, and connected to GitHub.",
}

export const viewport: Viewport = { themeColor: "#101711", userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${bricolage.variable} ${geistMono.variable} bg-background`}><body className="font-sans antialiased">{children}<Toaster />{process.env.VERCEL === "1" ? <Analytics /> : null}</body></html>
}
