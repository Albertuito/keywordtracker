import { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // STRICT LOCKDOWN: Only specific email allowed
    if (!session?.user?.email || session.user.email !== 'infoinfolinfo@gmail.com') {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-800 border-r border-slate-600 p-6 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-white tracking-tight">Panel Admin</h1>
                    <p className="text-xs text-slate-400">Centro de Control</p>
                </div>

                <nav className="flex-1 space-y-1">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>📊</span> Panel
                    </Link>
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>👥</span> Usuarios
                    </Link>
                    <Link
                        href="/admin/transactions"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>📜</span> Transacciones
                    </Link>
                    <Link
                        href="/admin/pricing"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>💸</span> Precios
                    </Link>
                    <Link
                        href="/admin/coupons"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>🎟️</span> Cupones
                    </Link>
                    <Link
                        href="/admin/notifications"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>📢</span> Mensajes
                    </Link>
                    <Link
                        href="/admin/finance"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>💰</span> Finanzas
                    </Link>
                    <Link
                        href="/admin/domains"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>🔒</span> Dominios
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-slate-200 hover:bg-slate-700 hover:text-white rounded-lg transition-colors font-medium"
                    >
                        <span>⚙️</span> Ajustes
                    </Link>
                </nav>

                <div className="pt-6 border-t border-slate-600">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        ← Volver al Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}

