import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: { default: "Skills Board, your team’s recommended AI skills", template: "%s | Skills Board" },
  description: "Build a shared library of AI skills your team recommends. Give teammates the source, command, or ZIP so they can choose what fits their setup.",
  openGraph: {
    type: "website",
    title: "Skills Board — One shared library. Different agents.",
    description: "Keep your team’s recommended AI skills in one searchable place.",
    siteName: "Skills Board",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skills Board — One shared library. Different agents.",
    description: "Keep your team’s recommended AI skills in one searchable place.",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#101711" },
  ],
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          {process.env.VERCEL === "1" ? <Analytics /> : null}
        </ThemeProvider>
      </body>
    </html>
  )
}
