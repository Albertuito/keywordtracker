import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST: Send Notification (Admin Only)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, message, type, targetUserId } = body;

        if (!title || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (targetUserId === 'ALL') {
            // Broadcast to all users
            const users = await prisma.user.findMany({ select: { id: true } });
            await prisma.notification.createMany({
                data: users.map(u => ({
                    userId: u.id,
                    title,
                    message,
                    type: type || 'info'
                }))
            });
        } else if (targetUserId) {
            // Specific User
            await prisma.notification.create({
                data: {
                    userId: targetUserId,
                    title,
                    message,
                    type: type || 'info'
                }
            });
        } else {
            return NextResponse.json({ error: 'Target missing' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Error sending notification' }, { status: 500 });
    }
}
