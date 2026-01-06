import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { term, country, device, projectId } = body;

        console.log("Creating keyword:", { term, projectId, user: session.user.email });

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { user: true }
        });

        if (!project || project.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
        }

        const keyword = await prisma.keyword.create({
            data: {
                term,
                country,
                device,
                projectId
            }
        });

        return NextResponse.json(keyword);
    } catch (error) {
        console.error("Error creating keyword:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
    }

    // Verify ownership
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { user: true }
    });

    if (!project || project.user.email !== session.user.email) {
        return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    const keywords = await prisma.keyword.findMany({
        where: { projectId },
        include: {
            positions: {
                orderBy: { date: 'desc' },
                take: 365 // Get up to 1 year of history
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(keywords);
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { keywordIds, projectId } = body;

        // Verify project ownership
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { user: true }
        });

        if (!project || project.user.email !== session.user.email) {
            return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
        }

        await prisma.keyword.deleteMany({
            where: {
                id: { in: keywordIds },
                projectId: projectId
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting keywords:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
