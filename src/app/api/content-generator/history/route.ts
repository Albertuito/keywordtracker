import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const history = await prisma.generatedContent.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(history);

    } catch (error) {
        console.error('Error fetching content history:', error);
        return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 });
    }
}
