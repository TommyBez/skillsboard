import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: { default: "Skillbase — Team skills, always current", template: "%s · Skillbase" },
  description: "Discover, save, and share GitHub-native agent skills with your team and MCP clients.",
}

export const viewport: Viewport = { themeColor: "#f7f7f4", userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>{children}<Toaster />{process.env.NODE_ENV === "production" ? <Analytics /> : null}</body></html>
}
