'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: string;
}

export default function NotificationsBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) setNotifications(await res.json());
        } catch (e) { }
    };

    const markAsRead = async (id: string) => {
        await fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        setNotifications(prev =>
            id === 'ALL'
                ? prev.map(n => ({ ...n, read: true }))
                : prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
                title="Notificaciones"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-50 overflow-hidden">
                        <div className="p-3 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">Notificaciones</span>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAsRead('ALL')}
                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                >
                                    Marcar todo leído
                                </button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-700">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">Sin notificaciones</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n.id} className={`p-4 hover:bg-slate-900 transition-colors ${!n.read ? 'bg-indigo-500/20/50' : ''}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm ${!n.read ? 'font-bold text-indigo-900' : 'font-medium text-slate-100'}`}>
                                                {n.title}
                                            </h4>
                                            {!n.read && (
                                                <button onClick={() => markAsRead(n.id)} className="text-slate-500 hover:text-indigo-500">
                                                    <Check className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                                        <span className="text-[10px] text-slate-500 mt-2 block">
                                            {new Date(n.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

