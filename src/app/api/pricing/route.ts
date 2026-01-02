import { NextResponse } from 'next/server';
import { PRICING } from '@/lib/pricing';

export async function GET() {
    return NextResponse.json({
        actions: PRICING,
    });
}
