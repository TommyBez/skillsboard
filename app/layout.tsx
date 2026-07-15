import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: { default: "Skillbase, the shared skill registry for agent teams", template: "%s · Skillbase" },
  description: "Discover, save, and share GitHub-native agent skills with your team and MCP clients.",
}

export const viewport: Viewport = { themeColor: "#101711", userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className={`${bricolage.variable} ${geistMono.variable} font-sans antialiased`}>{children}<Toaster />{process.env.NODE_ENV === "production" ? <Analytics /> : null}</body></html>
}
