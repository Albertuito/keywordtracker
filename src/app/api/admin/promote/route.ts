
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    }

    const email = session.user.email;

    // Emergency promotion for specific email
    if (email === 'infoinfolinfo@gmail.com') { // Hardcoded for safety recovery
        await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });
        return NextResponse.json({
            success: true,
            message: `User ${email} promoted to ADMIN. PLEASE LOGOUT AND LOGIN AGAIN inside the app to refresh your session.`
        });
    }

    return NextResponse.json({ error: 'Not authorized for promotion' }, { status: 403 });
}
