import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./info-modal-shortcuts.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/components/theme-provider";
import { EditModeProvider } from "@/contexts/edit-mode-context";
import { PageLoadingProvider } from "@/contexts/page-loading-context";
import { EditModeLoading } from "@/components/edit-mode-loading";
import { PageLoading } from "@/components/page-loading";
import { Toaster } from "@/components/ui/sonner";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { DeviceOptimizer } from "@/components/device-optimizer";
import { ThemeColor } from "@/components/theme-color";

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
  themeColor: "#fafbfc",
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "VM Route Manager",
  description: "Vending Machine Route Management System",
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background h-full transitions-enabled`}
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
              <DeviceOptimizer />
              <ThemeColor />
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
