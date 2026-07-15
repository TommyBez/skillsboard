import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"

import "./globals.css"

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: { default: "Skills Board, your team’s recommended AI skills", template: "%s | Skills Board" },
  description: "Build a shared library of AI skills your team recommends. Give teammates the source, command, or ZIP so they can choose what fits their setup.",
}

export const viewport: Viewport = { themeColor: "#101711", userScalable: true }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${bricolage.variable} ${geistMono.variable} bg-background`}><body className="font-sans antialiased">{children}{process.env.VERCEL === "1" ? <Analytics /> : null}</body></html>
}
