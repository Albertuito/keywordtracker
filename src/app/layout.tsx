import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "KeywordTracker - Monitoriza tus Rankings en Google",
    description: "Track your keyword rankings with real-time data from Google | keywordtracker.es",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${inter.className} bg-gray-50 text-gray-900`}>
                <AuthProvider>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1 w-full">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </AuthProvider>
                <Toaster position="top-right" richColors />
            </body>
        </html>
    );
}
