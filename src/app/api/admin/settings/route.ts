import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Default settings
const DEFAULT_SETTINGS = {
    maintenanceMode: false,
    registrationEnabled: true,
    welcomeCredit: 1.00,
    minRechargeAmount: 5,
    maxRechargeAmount: 200,
};

// GET - Fetch all settings
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== 'infoinfolinfo@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const dbSettings = await prisma.systemSetting.findMany();

        // Merge DB settings with defaults
        const settings = { ...DEFAULT_SETTINGS };
        for (const s of dbSettings) {
            if (s.key in settings) {
                try {
                    (settings as any)[s.key] = JSON.parse(s.value);
                } catch {
                    (settings as any)[s.key] = s.value;
                }
            }
        }

        return NextResponse.json({ settings, defaults: DEFAULT_SETTINGS });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

// POST - Update a setting
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.email !== 'infoinfolinfo@gmail.com') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { key, value } = await req.json();

        if (!key || !(key in DEFAULT_SETTINGS)) {
            return NextResponse.json({ error: 'Invalid setting key' }, { status: 400 });
        }

        await prisma.systemSetting.upsert({
            where: { key },
            update: { value: JSON.stringify(value) },
            create: { key, value: JSON.stringify(value) }
        });

        return NextResponse.json({ success: true, key, value });
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ error: 'Error updating setting' }, { status: 500 });
    }
}
