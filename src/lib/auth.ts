import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
    // adapter: PrismaAdapter(prisma), // No adapter needed for purely Credentials + JWT flow without Account tables
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Username", type: "text", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials?.username) return null

                // 1. Find User (No more Auto-Create)
                const user = await prisma.user.findUnique({
                    where: { email: credentials.username }
                });

                // 2. Check if user exists
                if (!user) {
                    throw new Error("No existe una cuenta con este email. Por favor, regístrate.");
                }

                // 3. Verify Password
                if (!user.password) throw new Error("Por favor, configura tu contraseña.");
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) throw new Error("Contraseña incorrecta");

                // 4. Check Verification (Bypass for Admin/Dev)
                if (!user.emailVerified && user.email !== 'infoinfolinfo@gmail.com') {
                    throw new Error("Debes verificar tu email antes de entrar.");
                }

                // Update Login Stats
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLogin: new Date() }
                });

                return { id: user.id, name: user.name, email: user.email, role: user.role }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.sub = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
                session.user.role = token.role as string
            }
            return session
        }
    },
    pages: {
        signIn: '/login',
    }
}
