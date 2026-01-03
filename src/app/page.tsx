'use client';

import { useSession } from "next-auth/react";
import Link from 'next/link';
import { LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Hero from '@/components/landing/Hero';
import Logos from '@/components/landing/Logos';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push('/dashboard');
        }
    }, [session, router]);

    // If session exists, we are redirecting, so we can return null or a loading state 
    // to avoid flashing the landing page content briefly.
    // However, showing the landing page briefly is also fine as a fallback.

    return (
        <main className="min-h-screen bg-gray-50 text-gray-900 selection:bg-blue-500/20">

            {/* Session User Floating Action Button (Still keeping it just in case JS is slow to redirect) */}
            {session && (
                <div className="fixed bottom-8 right-8 z-50 animate-fade-in-up">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-1"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Ir al Dashboard
                    </Link>
                </div>
            )}

            <Hero />
            <Logos />
            <Features />
            <HowItWorks />
            <Testimonials />
            <CTASection />

            {/* Simple footer for landing page */}
            <footer className="py-12 bg-white border-t border-gray-200 text-center text-gray-500 text-sm">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center gap-8 mb-8">
                        <Link href="#" className="hover:text-gray-900 transition-colors">Términos</Link>
                        <Link href="#" className="hover:text-gray-900 transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-gray-900 transition-colors">Cookies</Link>
                        <Link href="#" className="hover:text-gray-900 transition-colors">Contacto</Link>
                    </div>
                    <p>© {new Date().getFullYear()} KeywordTracker. Todos los derechos reservados.</p>
                </div>
            </footer>
        </main>
    );
}
