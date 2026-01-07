import prisma from './prisma';
import { emailLowBalance, emailTicketReply, emailReportReady } from './email';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface CreateNotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
}

/**
 * Helper to create in-app notifications
 */
export async function createNotification({
    userId,
    title,
    message,
    type = 'info'
}: CreateNotificationParams) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });
    } catch (error) {
        console.error('[Notification] Error creating notification:', error);
    }
}

/**
 * Get user email by userId
 */
async function getUserEmail(userId: string): Promise<string | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });
        return user?.email || null;
    } catch {
        return null;
    }
}

/**
 * Notify user about low balance (< €1)
 * Sends both in-app notification AND email
 */
export async function notifyLowBalance(userId: string, currentBalance: number) {
    // In-app notification
    await createNotification({
        userId,
        title: '⚠️ Saldo bajo',
        message: `Tu saldo actual es €${currentBalance.toFixed(2)}. Recarga para seguir monitorizando tus keywords.`,
        type: 'warning'
    });

    // Email notification
    const email = await getUserEmail(userId);
    if (email) {
        emailLowBalance(email, currentBalance);
    }
}

/**
 * Notify user that their keyword positions have been updated
 * In-app only (no email to avoid spam)
 */
export async function notifyKeywordUpdated(userId: string, keywordTerm: string, projectName: string) {
    await createNotification({
        userId,
        title: '📊 Keyword actualizada',
        message: `La posición de "${keywordTerm}" en ${projectName} ha sido actualizada.`,
        type: 'info'
    });
}

/**
 * Notify user that their keyword report is ready
 * Sends both in-app notification AND email
 */
export async function notifyReportReady(userId: string, seedKeyword: string) {
    // In-app notification
    await createNotification({
        userId,
        title: '✨ Reporte listo',
        message: `Tu análisis de Keyword Intelligence para "${seedKeyword}" está listo.`,
        type: 'success'
    });

    // Email notification
    const email = await getUserEmail(userId);
    if (email) {
        emailReportReady(email, seedKeyword);
    }
}

/**
 * Notify user that admin replied to their ticket
 * Sends both in-app notification AND email
 */
export async function notifyTicketReply(userId: string, ticketSubject: string, ticketId?: string) {
    // In-app notification
    await createNotification({
        userId,
        title: '💬 Respuesta en tu ticket',
        message: `Hemos respondido a tu ticket: "${ticketSubject}".`,
        type: 'info'
    });

    // Email notification
    const email = await getUserEmail(userId);
    if (email && ticketId) {
        emailTicketReply(email, ticketSubject, ticketId);
    }
}

/**
 * Notify admin about important events (using hardcoded admin userId)
 */
export async function notifyAdmin(title: string, message: string, type: NotificationType = 'info') {
    try {
        // Find admin user
        const adminUser = await prisma.user.findFirst({
            where: { email: 'infoinfolinfo@gmail.com' },
            select: { id: true }
        });

        if (adminUser) {
            await createNotification({
                userId: adminUser.id,
                title,
                message,
                type
            });
        }
    } catch (error) {
        console.error('[Notification] Error notifying admin:', error);
    }
}
