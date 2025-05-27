import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { DatabaseVotingProvider } from "@/contexts/database-voting-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Plataforma de Votación Blockchain",
  description: "Sistema de votación descentralizado con tecnología blockchain",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <DatabaseVotingProvider>
            <div className="w-full">
              <Navigation />
              <main className="w-full">{children}</main>
            </div>
          </DatabaseVotingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
