import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/projects - Listar proyectos del usuario
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('id');

    const where: any = {
        user: {
            email: session.user.email
        }
    };

    if (projectId) {
        where.id = projectId;
    }

    const projects = await prisma.project.findMany({
        where,
        include: {
            keywords: {
                include: {
                    positions: {
                        orderBy: { date: 'desc' },
                        take: 5 // Get last 5 checks for history/cannibalization
                    }
                }
            }
        }
    });

    if (projectId && projects.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // If querying single project, return object? Frontend expects array or object?
    // Looking at previous code, it returned array.
    // However, page.tsx does `const [project, setProject] ...`
    // Let's keep returning array to avoid breaking list view, but if ID is present, frontend likely takes [0].

    return NextResponse.json(projects);
}

// POST /api/projects - Crear nuevo proyecto
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email || !session.user.id) { // Ensure session.user.id is available
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, domain, country } = await req.json();

    if (!domain || !name) {
        return NextResponse.json({ error: 'Faltan campos (domain, name)' }, { status: 400 });
    }

    // 1. CLEAN DOMAIN (Simple regex for hostname)
    let cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    // 2. CHECK GLOBAL LOCK
    const existingLock = await prisma.globalDomainLock.findUnique({
        where: { domain: cleanDomain }
    });

    if (existingLock) {
        // Check if it belongs to current user? User said: "contacta con soporte". Implies strict lock even if user matches?
        // Actually, if I delete my account and register new one, it SHOULD fail.
        // But if I delete PROJECT and re-add in SAME account, it should pass?
        // The request said: "aunque lo eliminen y creen otro usuario".
        // So if I am the SAME user, I should probably be allowed?
        // "paco.com ya pertenece a otro usuario" -> Implies checking owner.

        // Let's check if lock.addedBy === session.user.id
        if (existingLock.addedBy !== session.user.id) {
            return NextResponse.json({
                error: `El dominio ${cleanDomain} ya está registrado en nuestro sistema por otro usuario. Contacta con soporte.`
            }, { status: 409 });
        }
        // If it matches session.user.id, we allow RE-adding it (maybe they deleted the project but lock remains).
    } else {
        // Create Lock
        await prisma.globalDomainLock.create({
            data: {
                domain: cleanDomain,
                addedBy: session.user.id
            }
        });
    }

    const project = await prisma.project.create({
        data: {
            name,
            domain: cleanDomain,
            country: country || 'ES', // Default to Spain if not provided
            userId: session.user.id
        }
    });

    return NextResponse.json(project);
}
