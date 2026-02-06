import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

export const metadata: Metadata = {
  title: "2FA Live Auth - Real-Time TOTP Authentication | 2FA2FA",
  description:
    "Instant 2FA live authentication & secure TOTP manager. Generate real-time codes without storage or manage 100+ codes in encrypted vault. 100% browser-based, military-grade security.",
  keywords: [
    "2fa live",
    "2fa auth",
    "2FA manager",
    "TOTP",
    "two factor authentication",
    "real-time 2fa",
    "live authentication",
    "2fa authenticator",
    "totp generator",
    "otp manager",
    "authenticator app",
    "2fa codes",
    "time-based otp",
    "secure authentication",
    "client-side encryption",
  ],
  authors: [{ name: "2FA2FA" }],
  creator: "2FA2FA",
  publisher: "2FA2FA",
  applicationName: "2FA2FA",
  metadataBase: new URL("https://2fa2fa.com"),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#441d1d" },
    { media: "(prefers-color-scheme: dark)", color: "#182e63" },
  ],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      zh: "/zh",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    url: "https://2fa2fa.com",
    siteName: "2FA2FA",
    title: "2FA2FA - Real-time 2FA Authentication & TOTP Manager",
    description:
      "Professional real-time 2FA authentication and TOTP management. Live auth codes, secure manager, 100% client-side encryption.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "2FA2FA - Real-time 2FA Authentication",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "2FA2FA - Real-time 2FA Authentication & TOTP Manager",
    description:
      "Professional real-time 2FA authentication and TOTP management platform.",
    images: ["/og-image.png"],
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
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
  },
};

// Enable static rendering
export const dynamic = "force-static";

const locales = ["en", "zh"];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch messages for the locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
