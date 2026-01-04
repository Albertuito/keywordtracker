import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/pricing';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Calendar, CreditCard, Shield, Clock, Search, ExternalLink } from 'lucide-react';
import ImpersonateButton from '@/components/ImpersonateButton';
import UserActions from '@/components/admin/UserActions';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    if (!userId) {
        return <div className="p-8 text-center text-red-500">ID de usuario no proporcionado</div>;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            balance: {
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 50 // Limit to last 50 transactions for performance
                    }
                }
            },
            projects: {
                include: {
                    keywords: {
                        orderBy: { updatedAt: 'desc' }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!user) {
        return <div className="p-8 text-center text-red-500">Usuario no encontrado</div>;
    }

    // Stats
    const totalKeywords = user.projects.reduce((acc, p) => acc + p.keywords.length, 0);
    const balance = user.balance?.balance || 0;
    const totalSpent = user.balance?.totalSpent || 0;
    const totalRecharged = user.balance?.totalRecharged || 0;

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div>
                <Link href="/admin/users" className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver a Usuarios
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {user.name || 'Sin Nombre'}
                            <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium border ${user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400 border-purple-200' : 'bg-slate-700 text-slate-300 border-slate-600'
                                }`}>
                                {user.role}
                            </span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Mail className="w-4 h-4" /> {user.email}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" /> Registrado: {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" /> Último Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-400 mb-1">ID Usuario</div>
                        <code className="bg-slate-700 px-2 py-1 rounded text-xs font-mono select-all text-slate-300">
                            {user.id}
                        </code>
                    </div>
                </div>
            </div>

            {/* Admin Actions */}
            <UserActions userId={user.id} userName={user.name || user.email || ''} currentBalance={balance} />

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-sm">
                    <div className="text-sm font-medium text-slate-400 mb-1">Saldo Actual</div>
                    <div className={`text-3xl font-bold font-mono ${balance < 0 ? 'text-red-500' : 'text-green-400'}`}>
                        {formatCurrency(balance)}
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-sm">
                    <div className="text-sm font-medium text-slate-400 mb-1">Total Gastado (Lifetime)</div>
                    <div className="text-3xl font-bold font-mono text-white">
                        {formatCurrency(totalSpent)}
                    </div>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-sm">
                    <div className="text-sm font-medium text-slate-400 mb-1">Total Recargado</div>
                    <div className="text-3xl font-bold font-mono text-blue-400">
                        {formatCurrency(totalRecharged)}
                    </div>
                </div>
            </div>

            {/* Projects & Keywords */}
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-slate-500" />
                        Proyectos y Keywords
                    </h2>
                    <span className="text-sm font-medium bg-slate-800 px-3 py-1 rounded-full border border-slate-600 text-slate-300">
                        {user.projects.length} Proyectos · {totalKeywords} Keywords
                    </span>
                </div>

                <div className="divide-y divide-slate-700">
                    {user.projects.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 italic">No hay proyectos creados.</div>
                    ) : (
                        user.projects.map(project => (
                            <div key={project.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2">
                                            {project.name}
                                            <a href={`https://${project.domain}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-500">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </h3>
                                        <p className="text-sm text-slate-400">{project.domain} · {project.country} · {project.language}</p>
                                    </div>
                                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                                        ID: {project.id}
                                    </span>
                                </div>

                                {/* Keywords Table */}
                                <div className="overflow-x-auto border border-slate-700 rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-900 text-xs text-slate-400 uppercase">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Keyword</th>
                                                <th className="px-4 py-2 font-medium">Tracking</th>
                                                <th className="px-4 py-2 font-medium">Último Check Auto</th>
                                                <th className="px-4 py-2 font-medium">Último Check Live</th>
                                                <th className="px-4 py-2 font-medium text-right">DataForSEO Task</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700">
                                            {project.keywords.length === 0 ? (
                                                <tr><td colSpan={5} className="px-4 py-3 text-center text-slate-500 italic">Sin keywords</td></tr>
                                            ) : (
                                                project.keywords.map(kw => ( // @ts-ignore - Prisma types inference
                                                    <tr key={kw.id} className="hover:bg-slate-900/50">
                                                        <td className="px-4 py-2 font-medium text-white">{kw.term}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${kw.trackingFrequency === 'daily' ? 'bg-green-500/20 text-green-400' :
                                                                kw.trackingFrequency === 'every_2_days' ? 'bg-blue-500/20 text-blue-400' :
                                                                    kw.trackingFrequency === 'weekly' ? 'bg-purple-500/20 text-purple-400' :
                                                                        'bg-slate-700 text-slate-300'
                                                                }`}>
                                                                {kw.trackingFrequency || 'manual'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-slate-400">
                                                            {kw.lastAutoCheck ? new Date(kw.lastAutoCheck).toLocaleString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-slate-400">
                                                            {kw.lastLiveCheck ? new Date(kw.lastLiveCheck).toLocaleString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-right font-mono text-xs text-slate-500">
                                                            {kw.dataforseoTaskId || '-'}
                                                            {(kw as any).lastUpdateError && (
                                                                <span className="block text-red-500 text-[10px] mt-0.5" title={(kw as any).lastUpdateError}>
                                                                    Error
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700 bg-slate-900">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-slate-500" />
                        Últimos 50 Movimientos de Saldo
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-900 text-xs text-slate-400 uppercase border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left">Fecha</th>
                                <th className="px-6 py-3 text-left">Tipo</th>
                                <th className="px-6 py-3 text-left">Descripción</th>
                                <th className="px-6 py-3 text-right">Importe</th>
                                <th className="px-6 py-3 text-right">Saldo Final</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {!user.balance || user.balance.transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                                        No hay movimientos registrados.
                                    </td>
                                </tr>
                            ) : (
                                user.balance.transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-slate-900">
                                        <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'recharge' ? 'bg-green-500/20 text-green-400' :
                                                tx.type === 'refund' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-slate-700 text-slate-200'
                                                }`}>
                                                {tx.type === 'recharge' && '+ '}
                                                {tx.type === 'refund' && '↩ '}
                                                {tx.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-300 max-w-xs truncate" title={tx.description || JSON.stringify(tx.metadata)}>
                                            {tx.description || (
                                                <span className="text-slate-500 font-mono text-xs">{tx.metadata}</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-3 text-right font-mono font-medium ${tx.amount > 0 ? 'text-green-400' : 'text-white'
                                            }`}>
                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-slate-400">
                                            {formatCurrency(tx.balanceAfter)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
