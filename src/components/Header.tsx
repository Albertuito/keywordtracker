'use client';

import { useSession, signOut, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BalanceWidget from "./BalanceWidget";
import NotificationsBell from "./NotificationsBell";

export default function Header() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;
    const isAdmin = session?.user?.email === 'infoinfolinfo@gmail.com';

    return (
        <header className="bg-slate-900 border-b border-slate-700/50 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">KeywordTracker</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex gap-1">
                        {!session && (
                            <Link
                                href="/"
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/')
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                Inicio
                            </Link>
                        )}
                        {session && (
                            <>
                                <Link
                                    href="/dashboard"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/dashboard')
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/reports"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/reports')
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    Reportes
                                </Link>
                                <Link
                                    href="/content-generator"
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/content-generator')
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    🎯 Generador
                                </Link>
                            </>
                        )}
                        <Link
                            href="/como-funciona"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive('/como-funciona')
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            Cómo funciona
                        </Link>
                    </nav>

                    <div className="hidden sm:ml-6 sm:flex sm:items-center gap-4">
                        {status === 'loading' ? (
                            <div className="w-24 h-9 bg-slate-700 rounded-lg animate-pulse"></div>
                        ) : session ? (
                            <div className="flex items-center gap-3">
                                <NotificationsBell />
                                <BalanceWidget />
                                <div className="h-6 w-px bg-slate-700"></div>
                                <div className="relative group">
                                    <button className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm shadow-sm">
                                            {session.user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="text-left hidden lg:block">
                                            <div className="text-sm font-medium text-slate-100">{session.user?.name || 'Usuario'}</div>
                                            <div className="text-xs text-slate-400 truncate max-w-[140px]">{session.user?.email}</div>
                                        </div>
                                        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-slate-800 border border-slate-700 ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
                                        <div className="py-1">
                                            <div className="px-4 py-3 border-b border-slate-700">
                                                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                                                <p className="text-xs text-slate-400 truncate">{session.user?.email}</p>
                                            </div>

                                            {isAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-blue-400 hover:bg-slate-700 transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                    Panel Admin
                                                </Link>
                                            )}

                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Configuración
                                            </Link>
                                            <Link
                                                href="/support"
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                                            >
                                                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                Soporte
                                            </Link>
                                            <button
                                                onClick={() => signOut({ callbackUrl: '/' })}
                                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-slate-700 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors border border-slate-600"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Registrarse Gratis
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="sm:hidden bg-slate-900 border-t border-slate-700">
                    <div className="py-2 space-y-1">
                        {!session && (
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-3 text-base font-medium ${isActive('/') ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
                            >
                                Inicio
                            </Link>
                        )}
                        {session && (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 text-base font-medium ${isActive('/dashboard') ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/reports"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 text-base font-medium ${isActive('/reports') ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
                                >
                                    Reportes
                                </Link>
                                <Link
                                    href="/content-generator"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 text-base font-medium ${isActive('/content-generator') ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
                                >
                                    🎯 Generador
                                </Link>
                            </>
                        )}
                        <Link
                            href="/como-funciona"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-3 text-base font-medium ${isActive('/como-funciona') ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
                        >
                            Cómo funciona
                        </Link>
                        {session && (
                            <Link
                                href="/settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-3 text-base font-medium ${isActive('/settings') ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}
                            >
                                Configuración
                            </Link>
                        )}
                    </div>
                </div>
            )
            }
        </header >
    );
}

