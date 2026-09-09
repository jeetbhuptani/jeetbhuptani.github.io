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
        {/* Retires the stored "system" theme from when `enableSystem` was on.
            next-themes still honours that string after the flag is removed, so
            every returning visitor on a light-mode OS would keep resolving to
            light and never see the dark default. Clearing it falls through to
            `defaultTheme`; an explicit "light"/"dark" choice is left alone.
            Must run before next-themes' own script (which renders in <body>),
            hence a blocking script here rather than an effect. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('theme')==='system')localStorage.removeItem('theme')}catch(e){}",
          }}
        />
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
        {/* Monochrome grain only — the background itself is flat. Sits at a
            negative z-index on its own layer, so it never repaints with
            content. Pure CSS, no image request. */}
        <div className="grain" aria-hidden />

        {/* No `enableSystem`. With it, next-themes resolves a first-time
            visitor to their OS preference and `defaultTheme` only applies when
            the OS expresses none — so the site rendered light on a light-mode
            machine. Dark is the design; the toggle still opts out per-visitor. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
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
