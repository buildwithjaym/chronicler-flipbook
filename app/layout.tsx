import type { Metadata, Viewport } from "next"
import { Toaster } from "sonner"
import "./globals.css"

const siteName = "The Chronicler - Digital Publication System"
const shortName = "The Chronicler"

const siteDescription =
  "A digital flipbook publication system for official student newspaper issues."

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"

const ogImage = "/logo.jpg"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: `${shortName} | Digital Publication System`,
    template: `%s | ${shortName}`,
  },

  description: siteDescription,
  applicationName: siteName,

  keywords: [
    "The Chronicler",
    "Digital Publication System",
    "Student Publication",
    "Flipbook",
    "Newsletter",
  ],

  authors: [{ name: "Jaymar Maruji" }],
  creator: "Jaymar Maruji",
  publisher: "The Chronicler",
  category: "education",

  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteUrl,
    siteName,
    title: `${shortName} | Digital Publication System`,
    description: siteDescription,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "The Chronicler Digital Publication System",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: `${shortName} | Digital Publication System`,
    description: siteDescription,
    images: [ogImage],
  },

  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
}

export const viewport: Viewport = {
  themeColor: "#0F5132",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary">
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          visibleToasts={4}
          duration={3200}
          toastOptions={{
            classNames: {
              toast:
                "rounded-2xl border border-border bg-white shadow-xl",
              title: "text-sm font-semibold text-foreground",
              description: "text-sm text-muted-foreground",
              actionButton:
                "rounded-xl bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90",
              cancelButton:
                "rounded-xl bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80",
              success: "border-green-200 bg-green-50 text-green-900",
              error: "border-red-200 bg-red-50 text-red-900",
              warning: "border-amber-200 bg-amber-50 text-amber-900",
              info: "border-blue-200 bg-blue-50 text-blue-900",
            },
          }}
        />
      </body>
    </html>
  )
}