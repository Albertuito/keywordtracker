
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notifyNewTicket } from '@/lib/email';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tickets = await prisma.supportTicket.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        return NextResponse.json({ tickets });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ error: 'Error fetching tickets' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { subject, message, priority = 'MEDIUM' } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: session.user.id,
                subject,
                priority,
                status: 'OPEN',
                messages: {
                    create: {
                        userId: session.user.id,
                        message,
                        isAdmin: false
                    }
                }
            },
            include: {
                messages: true
            }
        });

        // Notify Admin
        if (session.user.email) {
            // Non-blocking notification
            notifyNewTicket(session.user.email, subject, ticket.id).catch(err => console.error("Email notification failed", err));
        }

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ error: 'Error creating ticket' }, { status: 500 });
    }
}
