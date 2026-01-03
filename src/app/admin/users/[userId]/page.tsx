import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/pricing';
import Link from 'next/link';
import { ArrowLeft, User, Mail, Calendar, CreditCard, Shield, Clock, Search, ExternalLink } from 'lucide-react';
import ImpersonateButton from '@/components/ImpersonateButton';

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
                <Link href="/admin/users" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Volver a Usuarios
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            {user.name || 'Sin Nombre'}
                            <span className={`text-sm px-2.5 py-0.5 rounded-full font-medium border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                {user.role}
                            </span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                        <div className="text-sm text-gray-500 mb-1">ID Usuario</div>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono select-all text-gray-600">
                            {user.id}
                        </code>
                    </div>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Saldo Actual</div>
                    <div className={`text-3xl font-bold font-mono ${balance < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatCurrency(balance)}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total Gastado (Lifetime)</div>
                    <div className="text-3xl font-bold font-mono text-gray-900">
                        {formatCurrency(totalSpent)}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm font-medium text-gray-500 mb-1">Total Recargado</div>
                    <div className="text-3xl font-bold font-mono text-blue-600">
                        {formatCurrency(totalRecharged)}
                    </div>
                </div>
            </div>

            {/* Projects & Keywords */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Search className="w-5 h-5 text-gray-400" />
                        Proyectos y Keywords
                    </h2>
                    <span className="text-sm font-medium bg-white px-3 py-1 rounded-full border border-gray-200 text-gray-600">
                        {user.projects.length} Proyectos · {totalKeywords} Keywords
                    </span>
                </div>

                <div className="divide-y divide-gray-100">
                    {user.projects.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 italic">No hay proyectos creados.</div>
                    ) : (
                        user.projects.map(project => (
                            <div key={project.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            {project.name}
                                            <a href={`https://${project.domain}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        </h3>
                                        <p className="text-sm text-gray-500">{project.domain} · {project.country} · {project.language}</p>
                                    </div>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        ID: {project.id}
                                    </span>
                                </div>

                                {/* Keywords Table */}
                                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-2 font-medium">Keyword</th>
                                                <th className="px-4 py-2 font-medium">Tracking</th>
                                                <th className="px-4 py-2 font-medium">Último Check Auto</th>
                                                <th className="px-4 py-2 font-medium">Último Check Live</th>
                                                <th className="px-4 py-2 font-medium text-right">DataForSEO Task</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {project.keywords.length === 0 ? (
                                                <tr><td colSpan={5} className="px-4 py-3 text-center text-gray-400 italic">Sin keywords</td></tr>
                                            ) : (
                                                project.keywords.map(kw => ( // @ts-ignore - Prisma types inference
                                                    <tr key={kw.id} className="hover:bg-gray-50/50">
                                                        <td className="px-4 py-2 font-medium text-gray-900">{kw.term}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${kw.trackingFrequency === 'daily' ? 'bg-green-100 text-green-700' :
                                                                kw.trackingFrequency === 'every_2_days' ? 'bg-blue-100 text-blue-700' :
                                                                    kw.trackingFrequency === 'weekly' ? 'bg-purple-100 text-purple-700' :
                                                                        'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {kw.trackingFrequency || 'manual'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-500">
                                                            {kw.lastAutoCheck ? new Date(kw.lastAutoCheck).toLocaleString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-gray-500">
                                                            {kw.lastLiveCheck ? new Date(kw.lastLiveCheck).toLocaleString() : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-right font-mono text-xs text-gray-400">
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
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        Últimos 50 Movimientos de Saldo
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left">Fecha</th>
                                <th className="px-6 py-3 text-left">Tipo</th>
                                <th className="px-6 py-3 text-left">Descripción</th>
                                <th className="px-6 py-3 text-right">Importe</th>
                                <th className="px-6 py-3 text-right">Saldo Final</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {!user.balance || user.balance.transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">
                                        No hay movimientos registrados.
                                    </td>
                                </tr>
                            ) : (
                                user.balance.transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'recharge' ? 'bg-green-100 text-green-700' :
                                                tx.type === 'refund' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {tx.type === 'recharge' && '+ '}
                                                {tx.type === 'refund' && '↩ '}
                                                {tx.type.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-gray-600 max-w-xs truncate" title={tx.description || JSON.stringify(tx.metadata)}>
                                            {tx.description || (
                                                <span className="text-gray-400 font-mono text-xs">{tx.metadata}</span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-3 text-right font-mono font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-gray-900'
                                            }`}>
                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono text-gray-500">
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
