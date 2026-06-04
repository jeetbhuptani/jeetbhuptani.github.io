import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { MagneticCursor } from "@/components/cursor/magnetic-cursor";
import { ClickRipple } from "@/components/click-ripple";
import { CommandMenu } from "@/components/command-menu";
import { HelloIntro } from "@/components/hello-intro";
import { SectionIndex } from "@/components/section-index";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
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

export const metadata: Metadata = {
  metadataBase: new URL(DATA.url),
  title: {
    default: DATA.name,
    template: `%s | ${DATA.name}`,
  },
  description:
    "Computer Engineer who is all about building real-world software products and experimenting with modern technologies.",
  openGraph: {
    title: `${DATA.name}`,
    description:
      "Computer Engineer who is all about building real-world software products and experimenting with modern technologies.",
    url: DATA.url,
    siteName: `${DATA.name}`,
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
    title: `${DATA.name}`,
    card: "summary_large_image",
  },
  verification: {
    google: "",
    yandex: "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              name: DATA.name,
              url: DATA.url,
              sameAs: [
                DATA.contact.social.GitHub.url,
                DATA.contact.social.LinkedIn.url,
                DATA.contact.social.X.url,
              ],
              jobTitle: "Software Engineer",
              worksFor: { "@type": "Organization", name: "Ignosis" },
              description:
                "Jeet Bhuptani is a Computer Engineer passionate about building real-world software products and experimenting with new technologies.",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={0}>
            <LenisProvider>
              {children}
              <Navbar />
            </LenisProvider>
            <MagneticCursor />
            <ClickRipple />
            <CommandMenu />
            <SectionIndex />
            <HelloIntro />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
