import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                name: true,
                email: true,
                image: true,
                plan: true,
                companyName: true,
                taxId: true,
                address: true,
                city: true,
                zipcode: true,
                country: true
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user settings:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, companyName, taxId, address, city, zip, country } = body;

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                companyName,
                taxId,
                address,
                city,
                zipcode: zip, // Map frontend 'zip' to database 'zipcode'
                country
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user settings:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
