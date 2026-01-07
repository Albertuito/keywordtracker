import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import AuthProvider from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "KeywordTracker - Monitoriza tus Rankings en Google | SEO Rank Tracker",
    description: "Herramienta SEO para monitorizar posiciones en Google. Seguimiento de keywords, informes automáticos y análisis de competencia. Desde €0.003/keyword. ¡Empieza gratis!",
    keywords: "rank tracker, posicionamiento SEO, monitorizar keywords, seguimiento Google, herramienta SEO, keywordtracker",
    authors: [{ name: "KeywordTracker" }],
    creator: "KeywordTracker",
    publisher: "KeywordTracker",
    robots: "index, follow",
    icons: {
        icon: "/favicon.png",
        apple: "/favicon.png",
    },
    openGraph: {
        type: "website",
        locale: "es_ES",
        url: "https://keywordtracker.es",
        siteName: "KeywordTracker",
        title: "KeywordTracker - Monitoriza tus Rankings en Google",
        description: "Herramienta SEO para monitorizar posiciones en Google. Seguimiento de keywords, informes automáticos y análisis de competencia. Desde €0.003/keyword.",
        images: [
            {
                url: "https://keywordtracker.es/og-image.png",
                width: 1200,
                height: 630,
                alt: "KeywordTracker - SEO Rank Tracker",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "KeywordTracker - Monitoriza tus Rankings en Google",
        description: "Herramienta SEO para monitorizar posiciones en Google. Desde €0.003/keyword. ¡Empieza gratis!",
        images: ["https://keywordtracker.es/og-image.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${inter.className} bg-slate-900 text-white`}>
                {/* Google Analytics 4 */}
                <Script
                    src="https://www.googletagmanager.com/gtag/js?id=G-KMJQX5BLEB"
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', 'G-KMJQX5BLEB');
                    `}
                </Script>

                <AuthProvider>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1 w-full">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </AuthProvider>
                <CookieBanner />
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
