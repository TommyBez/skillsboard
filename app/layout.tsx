import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Geist_Mono } from "next/font/google"

import { DeferredToaster } from "@/components/deferred-toaster"
import { PrivacySafeVercelAnalytics } from "@/components/privacy-safe-vercel-analytics"
import { ThemeProvider } from "@/components/theme-provider"
import { WebMcpTools } from "@/components/web-mcp"
import { siteConfig } from "@/lib/site"
import { webMcpPages } from "@/lib/web-mcp-pages"

import "./globals.css"

// The opsz axis is unused in the codebase — only wdth is declared, since the
// hero headline's font-stretch: 93% needs it. Fewer axes, smaller files.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  axes: ["wdth"],
})
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Skills Board, the agent-native skills registry for teams",
    template: "%s | Skills Board",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  keywords: [
    "AI skills",
    "team skill library",
    "shared AI skills",
    "Claude skills",
    "Cursor skills",
    "Codex skills",
    "agent skills",
    "team AI skills",
  ],
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: "Skills Board, the agent-native skills registry for teams",
    description: siteConfig.ogDescription,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Skills Board, the agent-native skills registry for teams",
    description: siteConfig.ogDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
          <WebMcpTools pages={webMcpPages} />
          <DeferredToaster />
          {process.env.VERCEL_ENV === "production" ? <PrivacySafeVercelAnalytics /> : null}
        </ThemeProvider>
      </body>
    </html>
  )
}
