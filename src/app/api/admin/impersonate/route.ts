import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // Strict Admin Check
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId } = await req.json();

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser || !targetUser.email) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate Impersonation Token
        // Format: IMPERSONATE:::SECRET:::TIMESTAMP
        // This relies on the verify logic we added to auth.ts
        const timestamp = Date.now();
        const secret = process.env.NEXTAUTH_SECRET;
        const token = `IMPERSONATE:::${secret}:::${timestamp}`;

        return NextResponse.json({
            success: true,
            email: targetUser.email,
            token: token
        });

    } catch (e) {
        return NextResponse.json({ error: 'Error generating token' }, { status: 500 });
    }
}
