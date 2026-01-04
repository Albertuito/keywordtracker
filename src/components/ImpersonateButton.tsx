'use client';

import { useState } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ImpersonateButton({ userId, email }: { userId: string, email: string | null }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleImpersonate = async () => {
        if (!confirm(`¿Estás seguro de que quieres entrar como ${email}?`)) return;

        setIsLoading(true);
        try {
            // 1. Get Token from Admin API
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // 2. Sign In using the Token as Password
            const result = await signIn('credentials', {
                username: data.email,
                password: data.token,
                redirect: false
            });

            if (result?.error) {
                alert('Error al iniciar sesión como usuario: ' + result.error);
            } else {
                // 3. Redirect to Dashboard
                router.push('/dashboard');
                router.refresh();
            }

        } catch (error) {
            alert('Error de conexión o permisos');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleImpersonate}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors text-xs font-medium border border-amber-200"
            title="Iniciar sesión como este usuario"
        >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <LogIn className="w-3 h-3" />}
            Entrar como usuario
        </button>
    );
}

