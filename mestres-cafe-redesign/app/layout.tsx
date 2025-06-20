import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider" // Assuming you have this or will add it

const carenaRegular = localFont({
  src: [
    {
      path: "../public/fonts/Carena-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-carena-regular",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
})

const allRoundGothic = localFont({
  src: [
    {
      path: "../public/fonts/AllRoundGothic-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    // Add other weights/styles if you have them
    // e.g., { path: '../public/fonts/AllRoundGothic-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: "--font-all-round-gothic",
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
})

export const metadata: Metadata = {
  title: "Mestres do Café - Torrefação Artesanal",
  description: "Descubra cafés especiais direto do produtor. Qualidade e sabor incomparáveis.",
  keywords: "café especial, torrefação artesanal, café gourmet, café arábica, mestres do café, comprar café online",
  authors: [{ name: "Mestres do Café" }],,
  // Example OpenGraph and Icons metadata (customize with your actual URLs and assets)
  // openGraph: {
  //   title: "Mestres do Café",
  //   description: "Sua fonte de cafés especiais com torra artesanal.",
  //   url: "https://www.yourdomain.com", // Replace with actual URL
  //   siteName: "Mestres do Café",
  //   images: [
  //     {
  //       url: "/og-image.png", // Replace with actual OG image path
  //       width: 1200,
  //       height: 630,
  //       alt: "Mestres do Café - Cafés Especiais",
  //     },
  //   ],
  //   locale: "pt_BR",
  //   type: "website",
  // },
  // icons: {
  //   icon: "/favicon.ico", // Replace with actual favicon
  //   apple: "/apple-touch-icon.png", // Replace
  // },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background text-foreground font-sans antialiased",
          carenaRegular.variable,
          allRoundGothic.variable,
        )}
      >
        {/* Ensure ThemeProvider is set up in your project, typically in components/theme-provider.tsx */}
        {/* If you don't have it from shadcn/ui, you'll need to add it or remove dark mode functionality. */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
