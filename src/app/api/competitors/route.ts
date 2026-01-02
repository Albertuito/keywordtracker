import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Types
interface CompetitorData {
    id: string;
    domain: string;
    isManual: boolean;
    keywordsInCommon: number;
    overlap: number;
    avgPosition: number | null;
    topKeywords: string[];
    createdAt?: Date;
}

interface KeywordPositionData {
    position: number;
    topDomains: string | null;
}

interface KeywordWithPosition {
    term: string;
    positions: KeywordPositionData[];
}

// GET - Fetch all competitors (manual + detected)
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

    try {
        // 1. Get manual competitors
        const manualCompetitors = await prisma.competitor.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Get all keywords with positions for analysis
        const keywords = await prisma.keyword.findMany({
            where: { projectId },
            include: {
                positions: {
                    take: 1,
                    orderBy: { date: 'desc' }
                }
            }
        }) as KeywordWithPosition[];

        // 3. Build domain analysis from topDomains data
        const domainAnalysis: Record<string, {
            count: number;
            positions: number[];
            keywords: string[];
        }> = {};

        let totalKeywordsWithData = 0;

        keywords.forEach(kw => {
            const latest = kw.positions[0];
            if (latest?.topDomains) {
                try {
                    const domains = JSON.parse(latest.topDomains) as string[];
                    if (Array.isArray(domains)) {
                        totalKeywordsWithData++;
                        domains.forEach((d, idx) => {
                            if (!domainAnalysis[d]) {
                                domainAnalysis[d] = { count: 0, positions: [], keywords: [] };
                            }
                            domainAnalysis[d].count++;
                            domainAnalysis[d].positions.push(idx + 1); // Position in top 5
                            if (domainAnalysis[d].keywords.length < 5) {
                                domainAnalysis[d].keywords.push(kw.term);
                            }
                        });
                    }
                } catch (e) { /* ignore parse error */ }
            }
        });

        // 4. Map manual competitors with their analysis data
        const manualDomains = new Set(manualCompetitors.map(c => c.domain.toLowerCase()));

        const manualWithStats: CompetitorData[] = manualCompetitors.map(comp => {
            const analysis = domainAnalysis[comp.domain.toLowerCase()] ||
                domainAnalysis[comp.domain] ||
                { count: 0, positions: [], keywords: [] };

            const avgPos = analysis.positions.length > 0
                ? analysis.positions.reduce((a, b) => a + b, 0) / analysis.positions.length
                : null;

            return {
                id: comp.id,
                domain: comp.domain,
                isManual: true,
                keywordsInCommon: analysis.count,
                overlap: totalKeywordsWithData > 0
                    ? Math.round((analysis.count / totalKeywordsWithData) * 100)
                    : 0,
                avgPosition: avgPos ? Math.round(avgPos * 10) / 10 : null,
                topKeywords: analysis.keywords,
                createdAt: comp.createdAt
            };
        });

        // 5. Get detected competitors (not in manual list)
        const detectedCompetitors: CompetitorData[] = Object.entries(domainAnalysis)
            .filter(([domain]) => !manualDomains.has(domain.toLowerCase()))
            .map(([domain, data]) => {
                const avgPos = data.positions.reduce((a, b) => a + b, 0) / data.positions.length;
                return {
                    id: `detected-${domain}`,
                    domain,
                    isManual: false,
                    keywordsInCommon: data.count,
                    overlap: totalKeywordsWithData > 0
                        ? Math.round((data.count / totalKeywordsWithData) * 100)
                        : 0,
                    avgPosition: Math.round(avgPos * 10) / 10,
                    topKeywords: data.keywords
                };
            })
            .sort((a, b) => b.keywordsInCommon - a.keywordsInCommon)
            .slice(0, 15); // Top 15 detected

        return NextResponse.json({
            competitors: [...manualWithStats, ...detectedCompetitors],
            manual: manualWithStats,
            detected: detectedCompetitors,
            metadata: {
                totalKeywordsWithData,
                totalKeywords: keywords.length,
                manualCount: manualCompetitors.length,
                detectedCount: detectedCompetitors.length
            }
        });

    } catch (error) {
        console.error("Error fetching competitors:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST - Add a manual competitor
export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { projectId, domain } = await request.json();

        if (!projectId || !domain) {
            return NextResponse.json({ error: 'Project ID and domain required' }, { status: 400 });
        }

        // Clean domain
        let cleanDomain = domain.toLowerCase().trim();
        cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
        cleanDomain = cleanDomain.split('/')[0]; // Remove paths

        // Verify project belongs to user
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                user: { email: session.user.email }
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check if domain is same as project domain
        if (cleanDomain === project.domain.toLowerCase()) {
            return NextResponse.json({ error: 'Cannot add your own domain as competitor' }, { status: 400 });
        }

        // Create competitor (unique constraint will prevent duplicates)
        const competitor = await prisma.competitor.create({
            data: {
                domain: cleanDomain,
                projectId
            }
        });

        return NextResponse.json({
            success: true,
            competitor,
            message: `${cleanDomain} añadido como competidor`
        });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Este competidor ya existe' }, { status: 409 });
        }
        console.error("Error adding competitor:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE - Remove a manual competitor
export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('id');

    if (!competitorId) {
        return NextResponse.json({ error: 'Competitor ID required' }, { status: 400 });
    }

    try {
        // Verify competitor belongs to user's project
        const competitor = await prisma.competitor.findFirst({
            where: {
                id: competitorId,
                project: {
                    user: { email: session.user.email }
                }
            }
        });

        if (!competitor) {
            return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
        }

        await prisma.competitor.delete({
            where: { id: competitorId }
        });

        return NextResponse.json({
            success: true,
            message: 'Competidor eliminado'
        });

    } catch (error) {
        console.error("Error deleting competitor:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
