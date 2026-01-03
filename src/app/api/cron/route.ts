import { NextResponse } from 'next/server';
import { triggerDailyChecks, enqueueDailyChecks, syncPendingChecks, processKeywordCheck, processAutoTracking } from '@/lib/worker';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Verify cron secret for external cron services (cron-job.org, etc.)
function verifyCronSecret(req: Request): boolean {
    const secret = process.env.CRON_SECRET_CRON;

    // If no secret is configured, allow all requests (development)
    if (!secret) {
        console.warn('CRON_SECRET not configured - cron endpoint is unprotected');
        return true;
    }

    // Check Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader === `Bearer ${secret}`) {
        return true;
    }

    // Check query parameter (for services that don't support headers)
    const url = new URL(req.url);
    const querySecret = url.searchParams.get('secret');
    if (querySecret === secret) {
        return true;
    }

    return false;
}

export async function GET(req: Request) {
    // Verify cron secret
    if (!verifyCronSecret(req)) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action'); // 'queue', 'sync', 'auto-tracking'
        const projectId = searchParams.get('projectId') || undefined;

        let result;
        if (action === 'sync') {
            result = await syncPendingChecks(); // Retrieve results for pending tasks
        } else if (action === 'live') {
            // Manual "Refresh Rankings" button -> Live check (with rate limits)
            const kwWhere = projectId ? { projectId } : {};
            const keywords = await prisma.keyword.findMany({ where: kwWhere, select: { id: true } });
            let processed = 0;
            for (const k of keywords) {
                // Force=true if we wanted to bypass, but we stick to limits for safety.
                // We let processKeywordCheck handle the 24h limit check.
                await processKeywordCheck(k.id);
                processed++;
            }
            result = { success: true, count: processed, mode: 'live' };
        } else if (action === 'auto-tracking') {
            // Auto-tracking cron: Process keywords based on frequency
            result = await processAutoTracking();
        } else {
            // Default: Queue new tasks (Standard Queue)
            // Or 'queue' explicit action
            result = await enqueueDailyChecks(projectId);
        }

        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    // Verify cron secret
    if (!verifyCronSecret(req)) {
        return NextResponse.json(
            { success: false, error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const body = await req.json();
        const { action, projectId, keywordIds } = body;

        let result;
        if (action === 'queue') {
            result = await enqueueDailyChecks(projectId, keywordIds);
        } else if (action === 'live') {
            // Live Check for specific keywords
            if (!keywordIds || !Array.isArray(keywordIds)) {
                return NextResponse.json({ success: false, error: 'keywordIds array required for live check' }, { status: 400 });
            }

            let processed = 0;
            let failed = 0;
            for (const id of keywordIds) {
                // processKeywordCheck handles balance deduction and API call
                const checkResult = await processKeywordCheck(id, true); // Force check
                if (checkResult.success) {
                    processed++;
                } else {
                    failed++;
                }
            }
            result = { success: true, count: processed, failed, mode: 'live' };
        } else {
            return NextResponse.json({ success: false, error: 'Invalid action for POST' }, { status: 400 });
        }

        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        console.error('Cron POST error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
