import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/reports - List all reports for current user
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get('id');

        // If ID provided, return single report
        if (reportId) {
            const report = await prisma.keywordReport.findFirst({
                where: {
                    id: reportId,
                    userId: session.user.id
                }
            });

            if (!report) {
                return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                report: {
                    id: report.id,
                    seedKeyword: report.seedKeyword,
                    keywords: report.keywords,
                    analysis: report.analysis,
                    country: report.country,
                    createdAt: report.createdAt
                }
            });
        }

        // Otherwise, return list of reports
        const reports = await prisma.keywordReport.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                seedKeyword: true,
                country: true,
                createdAt: true,
                projectId: true,
                // Count keywords (stored as JSON array)
                keywords: true
            }
        });

        // Format response with keyword counts
        const formattedReports = reports.map(r => ({
            id: r.id,
            seedKeyword: r.seedKeyword,
            country: r.country,
            createdAt: r.createdAt,
            projectId: r.projectId,
            keywordCount: Array.isArray(r.keywords) ? r.keywords.length : 0
        }));

        return NextResponse.json({
            success: true,
            reports: formattedReports,
            count: formattedReports.length
        });

    } catch (error: any) {
        console.error('[Reports API] Error:', error.message);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// DELETE /api/reports?id=xxx - Delete a report
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const reportId = searchParams.get('id');

        if (!reportId) {
            return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
        }

        // Verify ownership
        const report = await prisma.keywordReport.findFirst({
            where: {
                id: reportId,
                userId: session.user.id
            }
        });

        if (!report) {
            return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
        }

        await prisma.keywordReport.delete({
            where: { id: reportId }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[Reports API] Delete error:', error.message);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
