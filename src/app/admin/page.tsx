import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/pricing';
import AdminHealthWidget from '@/components/AdminHealthWidget';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    // Calculate Metrics
    const [
        totalUsers,
        totalBalance,
        totalRecharged,
        totalSpent,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.userBalance.aggregate({ _sum: { balance: true } }),
        prisma.userBalance.aggregate({ _sum: { totalRecharged: true } }),
        prisma.userBalance.aggregate({ _sum: { totalSpent: true } }),
    ]);

    const revenue = totalRecharged._sum.totalRecharged || 0;
    const usageValue = totalSpent._sum.totalSpent || 0;
    const liability = totalBalance._sum.balance || 0;

    const estimatedCost = usageValue * 0.15;
    const netProfit = revenue - estimatedCost;

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Resumen del Negocio</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Usuarios Totales</h3>
                    <div className="text-3xl font-bold text-gray-900">{totalUsers}</div>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Ingresos Totales</h3>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(revenue)}</div>
                    <p className="text-xs text-gray-400 mt-2">Total Recargado</p>
                </div>
                <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Valor de Uso</h3>
                    <div className="text-3xl font-bold text-blue-600">{formatCurrency(usageValue)}</div>
                    <p className="text-xs text-gray-400 mt-2">Consumido por usuarios</p>
                </div>
                <div className="bg-white border-l-4 border-l-green-500 border border-gray-200 p-6 rounded-xl shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Beneficio Neto Est.</h3>
                    <div className="text-3xl font-bold text-gray-900">{formatCurrency(netProfit)}</div>
                    <p className="text-xs text-gray-400 mt-2">Ingresos - Costes API</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Financial Summary */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Pasivo (Saldo Usuarios)</h3>
                    <div className="flex items-center gap-4">
                        <span className="text-2xl font-mono text-amber-600">{formatCurrency(liability)}</span>
                        <span className="text-gray-500 text-sm">Crédito pendiente de uso</span>
                    </div>
                </div>

                {/* API Health */}
                <AdminHealthWidget />
            </div>
        </div>
    );
}
