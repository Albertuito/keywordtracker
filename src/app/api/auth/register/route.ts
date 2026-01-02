import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
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

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
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

        // 4. Create User
        const user = await prisma.user.create({
            data: {
                name: userName,
                email,
                password: hashedPassword,
                companyName: companyName || null,
                role: 'USER',
                plan: 'PREPAID', // Default plan
                emailVerified: new Date(), // Auto-verify email for now to bypass check
                // Initialize balance entry automatically
                balance: {
                    create: {
                        balance: 1.00, // Welcome bonus 1€
                        totalRecharged: 0,
                        totalSpent: 0
                    }
                }
            },
        });

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
