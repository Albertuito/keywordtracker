import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataForSEO } from '@/lib/dataforseo';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get DataForSEO balance
        const balance = await DataForSEO.getAccountBalance();

        // For now, just return balance without error tracking
        // (lastUpdateError field doesn't exist in schema yet)
        return NextResponse.json({
            balance: balance,
            errors24h: 0,
            recentErrors: []
        });

    } catch (e) {
        console.error('Health API Error:', e);
        return NextResponse.json({
            balance: null,
            errors24h: 0,
            recentErrors: [],
            error: 'Error fetching health stats'
        }, { status: 200 }); // Return 200 with null values instead of error
    }
}
