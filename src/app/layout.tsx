import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { MagneticCursor } from "@/components/cursor/magnetic-cursor";
import { ClickRipple } from "@/components/click-ripple";
import { CommandMenu } from "@/components/command-menu";
import { HelloIntro } from "@/components/hello-intro";
import { SectionIndex } from "@/components/section-index";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getNavItems, getProfile, getSocials } from "@/lib/content";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const fontSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
  metadataBase: new URL(profile.url || "https://jeetbhuptani.tech"),
  title: {
    default: profile.name,
    template: `%s | ${profile.name}`,
  },
  description: profile.description,
  openGraph: {
    title: profile.name,
    description: profile.description,
    url: profile.url,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    title: profile.name,
    card: "summary_large_image",
  },
  verification: {
    google: "",
    yandex: "",
  },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [profile, navItems, socials] = await Promise.all([
    getProfile(),
    getNavItems(),
    getSocials(),
  ]);
  const socialNavItems = socials
    .filter((s) => s.navbar)
    .map((s) => ({ href: s.url, icon: s.icon, label: s.name }));
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#100e0c" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: profile.name,
              url: profile.url,
              sameAs: socials.map((s) => s.url),
              jobTitle: "Software Engineer",
              worksFor: { "@type": "Organization", name: "Ignosis" },
              description: profile.description,
            }),
          }}
        />
      </head>

      <body
        className={cn(
          "min-h-screen bg-background font-mono antialiased max-w-2xl mx-auto py-12 sm:py-24 px-6",
          GeistSans.variable,
          GeistMono.variable,
          fontSerif.variable
        )}
      >
        {/* Ambient layers sit behind everything at negative z-index and never
            repaint with content. Both are pure CSS — no image request. */}
        <div className="ambient-wash" aria-hidden />
        <div className="grain" aria-hidden />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>
            <LenisProvider>
              {children}
              <Navbar
                navItems={navItems.map((n) => ({ href: n.href, icon: n.icon, label: n.label }))}
                socialNavItems={socialNavItems}
              />
            </LenisProvider>
            <MagneticCursor />
            <ClickRipple />
            <CommandMenu socials={socialNavItems.map((s) => ({ label: s.label, href: s.href }))} />
            <SectionIndex />
            <HelloIntro />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
