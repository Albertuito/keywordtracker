import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma';

// PUT: Update User
export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.email !== 'infoinfolinfo@gmail.com')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const { userId, data } = body;

        if (!userId || !data) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
                role: data.role,
                plan: data.plan,
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Delete User
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || (session.user.role !== 'ADMIN' && session.user.email !== 'infoinfolinfo@gmail.com')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Prevent self-deletion
        if (session.user.email === 'infoinfolinfo@gmail.com' &&
            (await prisma.user.findUnique({ where: { id: userId } }))?.email === 'infoinfolinfo@gmail.com') {
            return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 403 });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
