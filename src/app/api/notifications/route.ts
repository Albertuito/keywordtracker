import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET: My Notifications
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return NextResponse.json(notifications);
    } catch (e) {
        return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 });
    }
}

// PUT: Mark As Read
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await req.json();
        if (id === 'ALL') {
            await prisma.notification.updateMany({
                where: { userId: session.user.id, read: false },
                data: { read: true }
            });
        } else {
            await prisma.notification.update({
                where: { id: id, userId: session.user.id },
                data: { read: true }
            });
        }
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Error updating notification' }, { status: 500 });
    }
}
