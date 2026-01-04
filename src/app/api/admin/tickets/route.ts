
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== 'infoinfolinfo@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }

        const tickets = await prisma.supportTicket.findMany({
            where,
            orderBy: { updatedAt: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        return NextResponse.json({ tickets });
    } catch (error) {
        console.error('Error fetching admin tickets:', error);
        return NextResponse.json({ error: 'Error fetching tickets' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.email !== 'infoinfolinfo@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, status, priority } = await req.json();

        const data: any = {};
        if (status) data.status = status;
        if (priority) data.priority = priority;

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data
        });

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error('Error updating ticket:', error);
        return NextResponse.json({ error: 'Error updating ticket' }, { status: 500 });
    }
}
