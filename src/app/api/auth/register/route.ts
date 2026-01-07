import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail, notifyNewUser } from '@/lib/email';
import { checkRateLimit, getClientIP } from '@/lib/rateLimit';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        // Rate limiting: 5 registrations per minute per IP
        const clientIP = getClientIP(req);
        const rateCheck = checkRateLimit(`register:${clientIP}`, { limit: 5, windowSeconds: 60 });

        if (!rateCheck.success) {
            return NextResponse.json(
                { error: `Demasiados intentos. Espera ${rateCheck.resetIn} segundos.` },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { name, email, password, companyName } = body;

        // 1. Basic Validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios' },
                { status: 400 }
            );
        }

        // Use email prefix as default name if not provided
        const userName = name || email.split('@')[0];

        if (password.length < 8) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 8 caracteres' },
                { status: 400 }
            );
        }

        // 2. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'El email ya está registrado' },
                { status: 409 }
            );
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Verification Token
        const verificationToken = crypto.randomUUID();

        // 4. Create User
        const user = await prisma.user.create({
            data: {
                name: userName,
                email,
                password: hashedPassword,
                companyName: companyName || null,
                role: 'USER',
                plan: 'PREPAID',
                // emailVerified: new Date(), // <-- Removed auto-verification
                verificationToken: verificationToken, // Save token

                // Initialize balance entry automatically
                balance: {
                    create: {
                        balance: 1.00,
                        totalRecharged: 0,
                        totalSpent: 0
                    }
                }
            },
        });

        // 5. Send Emails (Non-blocking)
        try {
            await Promise.all([
                sendVerificationEmail(email, verificationToken),
                notifyNewUser(email, userName)
            ]);
        } catch (emailError) {
            console.error("Failed to send welcome emails:", emailError);
            // Continue execution, don't fail registration
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            {
                message: 'Usuario creado correctamente',
                user: userWithoutPassword
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
