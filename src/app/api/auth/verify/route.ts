
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { token } = await request.json();

        // In a real app, verify JWT token. 
        // Here we simulate by extracting userId from "fancy_token_{userId}"

        if (!token || !token.startsWith('fancy_token_')) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
        }

        const userId = token.replace('fancy_token_', '');

        await prisma.user.update({
            where: { id: userId },
            data: { emailVerified: new Date() }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Error verificando email' }, { status: 500 });
    }
}
