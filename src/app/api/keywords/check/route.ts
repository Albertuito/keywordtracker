import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processKeywordCheck, enqueueDailyChecks } from '@/lib/worker';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // 1. Verify Authentication
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { keywordIds, mode = 'queue' } = body;

        if (!keywordIds || !Array.isArray(keywordIds)) {
            return NextResponse.json({ success: false, error: 'keywordIds array required' }, { status: 400 });
        }

        if (keywordIds.length === 0) {
            return NextResponse.json({ success: true, count: 0, failed: 0 });
        }

        // 2. Verify User & Ownership
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Filter valid keywords ensuring they belong to the user
        const safeKeywords = await prisma.keyword.findMany({
            where: {
                id: { in: keywordIds },
                project: { userId: user.id }
            },
            select: { id: true }
        });

        const safeIds = safeKeywords.map(k => k.id);
        const skipped = keywordIds.length - safeIds.length;

        // 3. Process based on Mode
        if (mode === 'queue') {
            // Queue Mode (Standard Check - €0.02)
            // enqueueDailyChecks utilizes batch deduction and Logic
            const result = await enqueueDailyChecks(undefined, safeIds);

            return NextResponse.json({
                success: true,
                enqueued: result.enqueued,
                debug: result.debug,
                skipped
            });

        } else {
            // Live Mode (Instant Check - €0.05)
            // Process individually using Live check logic
            let processed = 0;
            let failed = 0;

            for (const id of safeIds) {
                const checkResult = await processKeywordCheck(id, true); // true implies force=live deduction
                if (checkResult.success) {
                    processed++;
                } else {
                    failed++;
                }
            }

            return NextResponse.json({
                success: true,
                count: processed,
                failed,
                skipped
            });
        }

    } catch (error) {
        console.error('Manual check error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
