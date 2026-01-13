import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';



// GET /api/admin/domain-locks - List all domain locks
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';

    const locks = await prisma.globalDomainLock.findMany({
        where: search ? {
            domain: { contains: search }
        } : undefined,
        orderBy: { createdAt: 'desc' },
        take: 100
    });

    // Get user info for each lock
    const userIds = Array.from(new Set(locks.map(l => l.addedBy)));
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, email: true }
    });
    const userMap = new Map(users.map(u => [u.id, u.email]));

    const locksWithEmail = locks.map(lock => ({
        ...lock,
        userEmail: userMap.get(lock.addedBy) || 'Usuario eliminado'
    }));

    return NextResponse.json(locksWithEmail);
}

// DELETE /api/admin/domain-locks?domain=xxx - Remove a domain lock
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
        return NextResponse.json({ error: 'Falta parámetro domain' }, { status: 400 });
    }

    try {
        await prisma.globalDomainLock.delete({
            where: { domain }
        });
        return NextResponse.json({ success: true, message: `Dominio ${domain} liberado` });
    } catch (error) {
        return NextResponse.json({ error: 'Dominio no encontrado' }, { status: 404 });
    }
}
