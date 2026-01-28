import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { PageLoadingProvider } from "@/contexts/page-loading-context";
import { EditModeLoading } from "@/components/edit-mode-loading";
import { PageLoading } from "@/components/page-loading";
import { Toaster } from "@/components/ui/sonner";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" }
  ],
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: {
    default: "VM Route Manager",
    template: "%s | VM Route Manager"
  },
  description: "Professional Vending Machine Route Management System - Manage routes, locations, power modes, and service operations efficiently",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VM Route",
    startupImage: [
      {
        url: "/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)"
      }
    ]
  },
  applicationName: "VM Route Manager",
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ]
  },
  other: {
    "mobile-web-app-capable": "yes"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <meta name="theme-color" content="#3b82f6" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1e3a8a" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-background`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PageLoadingProvider>
            <EditModeProvider>
              {children}
              <EditModeLoading />
              <PageLoading />
              <Toaster />
              <PWAInstallPrompt />
            </EditModeProvider>
          </PageLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
