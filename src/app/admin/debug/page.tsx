'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function AdminDebugPage() {
    const { data: session, status } = useSession();
    const [ticketsResult, setTicketsResult] = useState<any>(null);
    const [apiError, setApiError] = useState<string>('');

    useEffect(() => {
        if (session) {
            checkTickets();
        }
    }, [session]);

    const checkTickets = async () => {
        try {
            const res = await fetch('/api/admin/tickets');
            const data = await res.json();
            setTicketsResult({ status: res.status, data });
        } catch (e: any) {
            setApiError(e.message);
        }
    };

    return (
        <div className="p-8 text-white space-y-8">
            <h1 className="text-2xl font-bold text-red-400">🚨 ADMIN DEBUG PANEL</h1>

            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <h2 className="font-bold mb-2">1. Session Status</h2>
                <pre className="bg-black p-2 rounded text-xs">
                    {JSON.stringify({ status, user: session?.user }, null, 2)}
                </pre>
                <div className="mt-2 text-sm">
                    {session?.user?.role === 'ADMIN'
                        ? <span className="text-green-400">✅ ROL DETECTADO: ADMIN</span>
                        : <span className="text-red-400">❌ ROL DETECTADO: {session?.user?.role || 'NONE'}</span>
                    }
                </div>
            </div>

            <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <h2 className="font-bold mb-2">2. Tickets API Response (/api/admin/tickets)</h2>
                {apiError && <div className="text-red-500">Error: {apiError}</div>}
                <pre className="bg-black p-2 rounded text-xs overflow-auto max-h-96">
                    {JSON.stringify(ticketsResult, null, 2)}
                </pre>
            </div>

            <div className="text-sm text-slate-400">
                <p>Si el ROL no es ADMIN, cierra sesión y vuelve a entrar.</p>
                <p>Si la API da 401 Unauthorized, es problema de permisos en el backend.</p>
                <p>Si la API devuelve tickets vacíos [], es que no hay tickets en la base de datos.</p>
            </div>
        </div>
    );
}
