
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 400 });
        }

        // Find user by verification token
        const user = await prisma.user.findFirst({
            where: { verificationToken: token }
        });

        if (!user) {
            return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
        }

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null // Consume token
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Link verification error:", error);
        return NextResponse.json({ error: 'Error verificando email' }, { status: 500 });
    }
}
