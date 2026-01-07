
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notifyTicketReply } from '@/lib/notifications';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        if (ticket.userId !== session.user.id && session.user.email !== 'infoinfolinfo@gmail.com') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json({ error: 'Error fetching ticket' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { message } = await req.json();

        // Check ownership
        const ticket = await prisma.supportTicket.findUnique({
            where: { id }
        });

        if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const isAdmin = session.user.email === 'infoinfolinfo@gmail.com';
        if (ticket.userId !== session.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Create message
        const newMessage = await prisma.ticketMessage.create({
            data: {
                ticketId: id,
                userId: session.user.id,
                message,
                isAdmin: isAdmin
            }
        });

        // Update ticket status if needed
        await prisma.supportTicket.update({
            where: { id },
            data: {
                status: isAdmin ? 'ANSWERED' : 'OPEN',
                updatedAt: new Date()
            }
        });

        // Notify user if admin replied
        if (isAdmin && ticket.userId !== session.user.id) {
            notifyTicketReply(ticket.userId, ticket.subject);
        }

        return NextResponse.json({ message: newMessage });
    } catch (error) {
        console.error('Error replying to ticket:', error);
        return NextResponse.json({ error: 'Error replying' }, { status: 500 });
    }
}
