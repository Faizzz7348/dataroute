import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { PageLoadingProvider } from "@/contexts/page-loading-context";
import { EditModeLoading } from "@/components/edit-mode-loading";
import { PageLoading } from "@/components/page-loading";
import { Toaster } from "@/components/ui/sonner";

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
    { media: "(prefers-color-scheme: light)", color: "#fafbfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" }
  ]
};

export const metadata: Metadata = {
  title: "VM Route Manager - Vending Management",
  description: "Professional Vending Machine Route Management System - Manage routes, locations, power modes, and service operations efficiently",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VM Route"
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
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
            </EditModeProvider>
          </PageLoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
