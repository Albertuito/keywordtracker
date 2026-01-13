import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma'; // Ensure this uses the singleton

// Helper to get admin email
async function getAdminEmail(): Promise<string> {
    if (process.env.ADMIN_EMAIL) return process.env.ADMIN_EMAIL;

    // Fallback: Fetch first admin from DB
    try {
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { email: true }
        });
        if (admin?.email) return admin.email;
    } catch (e) {
        console.error("Failed to fetch admin email from DB", e);
    }

    return 'infoinfolinfo@gmail.com'; // Last resort fallback
}

// Helper to send email
async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    const { EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM } = process.env;

    // Dev Mode Fallback
    if (!EMAIL_SERVER_HOST || !EMAIL_SERVER_USER || !EMAIL_SERVER_PASSWORD) {
        console.warn("⚠️ Email credentials not found. Logging email.");
        console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_SERVER_HOST,
            port: Number(EMAIL_SERVER_PORT) || 587,
            secure: Number(EMAIL_SERVER_PORT) === 465,
            auth: {
                user: EMAIL_SERVER_USER,
                pass: EMAIL_SERVER_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: EMAIL_FROM || '"KeywordTracker" <info@keywordtracker.es>',
            to,
            subject,
            html,
        });
        console.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    } catch (error) {
        console.error("[EMAIL ERROR] Failed to send email:", error);
    }
}

export async function sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    await sendEmail({
        to,
        subject: 'Verifica tu email - KeywordTracker',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #3B82F6;">Bienvenido a KeywordTracker</h2>
                <p>Gracias por registrarte. Para verificar tu cuenta (opcional), haz clic aquí:</p>
                <div style="margin: 30px 0;">
                    <a href="${verifyUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verificar Email</a>
                </div>
                <p style="color: #666; font-size: 14px;">O usa este enlace: ${verifyUrl}</p>
            </div>
        `
    });
}

export async function notifyNewUser(email: string, name: string) {
    const adminEmail = await getAdminEmail();
    await sendEmail({
        to: adminEmail,
        subject: '🆕 Nuevo Usuario en KeywordTracker',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Nuevo Usuario Registrado</h2>
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
        `
    });
}

export async function notifyNewRecharge(email: string, amount: number, method: string) {
    const adminEmail = await getAdminEmail();
    await sendEmail({
        to: adminEmail,
        subject: '💰 Nueva Recarga Recibida',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2 style="color: #10b981;">Nueva Recarga: ${amount}€</h2>
                <p><strong>Usuario:</strong> ${email}</p>
                <p><strong>Método:</strong> ${method}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
            </div>
        `
    });
}

export async function notifyNewTicket(email: string, ticketSubject: string, id: string) {
    const adminEmail = await getAdminEmail();
    await sendEmail({
        to: adminEmail,
        subject: '🎫 Nuevo Ticket de Soporte',
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Nuevo Ticket Creado</h2>
                <p><strong>Usuario:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${ticketSubject}</p>
                <p><strong>ID Ticket:</strong> ${id}</p>
                <p><a href="${process.env.NEXTAUTH_URL}/admin/tickets/${id}">Ver en Panel Admin</a></p>
            </div>
        `
    });
}

// ============== USER EMAIL NOTIFICATIONS ==============

/**
 * Email to user when their balance drops below €1
 */
export async function emailLowBalance(to: string, currentBalance: number) {
    const dashboardUrl = `${process.env.NEXTAUTH_URL || 'https://keywordtracker.es'}/settings/billing`;
    await sendEmail({
        to,
        subject: '⚠️ Tu saldo está bajo - KeywordTracker',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1e293b; color: white; border-radius: 12px;">
                <h2 style="color: #fbbf24;">⚠️ Saldo bajo</h2>
                <p>Tu saldo actual es <strong style="color: #f97316;">€${currentBalance.toFixed(2)}</strong>.</p>
                <p>Recarga tu cuenta para seguir monitorizando tus keywords y recibir actualizaciones automáticas.</p>
                <div style="margin: 30px 0;">
                    <a href="${dashboardUrl}" style="background: linear-gradient(to right, #3b82f6, #6366f1); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Recargar Ahora</a>
                </div>
                <p style="color: #94a3b8; font-size: 12px;">KeywordTracker - Monitorización SEO al mejor precio</p>
            </div>
        `
    });
}

/**
 * Email to user when admin replies to their ticket
 */
export async function emailTicketReply(to: string, ticketSubject: string, ticketId: string) {
    const ticketUrl = `${process.env.NEXTAUTH_URL || 'https://keywordtracker.es'}/support/${ticketId}`;
    await sendEmail({
        to,
        subject: '💬 Respuesta a tu ticket - KeywordTracker',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1e293b; color: white; border-radius: 12px;">
                <h2 style="color: #3b82f6;">💬 Nueva respuesta</h2>
                <p>Hemos respondido a tu ticket:</p>
                <p style="background: #334155; padding: 12px 16px; border-radius: 8px; margin: 16px 0;"><strong>"${ticketSubject}"</strong></p>
                <div style="margin: 30px 0;">
                    <a href="${ticketUrl}" style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ver Respuesta</a>
                </div>
                <p style="color: #94a3b8; font-size: 12px;">KeywordTracker - Soporte</p>
            </div>
        `
    });
}

/**
 * Email to user when their keyword intelligence report is ready
 */
export async function emailReportReady(to: string, seedKeyword: string) {
    const reportsUrl = `${process.env.NEXTAUTH_URL || 'https://keywordtracker.es'}/reports`;
    await sendEmail({
        to,
        subject: '✨ Tu análisis está listo - KeywordTracker',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1e293b; color: white; border-radius: 12px;">
                <h2 style="color: #10b981;">✨ Reporte completado</h2>
                <p>Tu análisis de Keyword Intelligence para:</p>
                <p style="background: linear-gradient(to right, #6366f1, #8b5cf6); padding: 12px 16px; border-radius: 8px; margin: 16px 0; font-size: 18px;"><strong>"${seedKeyword}"</strong></p>
                <p>Ya está listo con:</p>
                <ul style="color: #94a3b8;">
                    <li>Keywords relacionadas con métricas</li>
                    <li>Recomendaciones SEO personalizadas</li>
                    <li>Estructura de contenido sugerida</li>
                </ul>
                <div style="margin: 30px 0;">
                    <a href="${reportsUrl}" style="background: linear-gradient(to right, #10b981, #059669); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Ver Reporte</a>
                </div>
                <p style="color: #94a3b8; font-size: 12px;">KeywordTracker - Keyword Intelligence</p>
            </div>
        `
    });
}
