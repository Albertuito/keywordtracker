import { NextResponse } from 'next/server';
import { triggerDailyChecks, enqueueDailyChecks, syncPendingChecks, processKeywordCheck, processAutoTracking } from '@/lib/worker';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action'); // 'queue' or 'sync'
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
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
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
            for (const id of keywordIds) {
                // processKeywordCheck handles balance deduction and API call
                await processKeywordCheck(id, true); // Force check
                processed++;
            }
            result = { success: true, count: processed, mode: 'live' };
        } else {
            return NextResponse.json({ success: false, error: 'Invalid action for POST' }, { status: 400 });
        }

        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
