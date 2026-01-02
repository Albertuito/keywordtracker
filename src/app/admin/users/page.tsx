import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/pricing';
import UsersTable from './UsersTable';
import { Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        include: {
            balance: true,
            _count: {
                select: { projects: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
                        <p className="text-sm text-gray-500">{users.length} usuarios registrados</p>
                    </div>
                </div>
            </div>

            <UsersTable users={users} />
        </div>
    );
}

