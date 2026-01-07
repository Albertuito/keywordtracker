import prisma from './prisma';

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
 * Notify user about low balance (< €1)
 */
export async function notifyLowBalance(userId: string, currentBalance: number) {
    await createNotification({
        userId,
        title: '⚠️ Saldo bajo',
        message: `Tu saldo actual es €${currentBalance.toFixed(2)}. Recarga para seguir monitorizando tus keywords.`,
        type: 'warning'
    });
}

/**
 * Notify user that their keyword positions have been updated
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
 */
export async function notifyReportReady(userId: string, seedKeyword: string) {
    await createNotification({
        userId,
        title: '✨ Reporte listo',
        message: `Tu análisis de Keyword Intelligence para "${seedKeyword}" está listo.`,
        type: 'success'
    });
}

/**
 * Notify user that admin replied to their ticket
 */
export async function notifyTicketReply(userId: string, ticketSubject: string) {
    await createNotification({
        userId,
        title: '💬 Respuesta en tu ticket',
        message: `Hemos respondido a tu ticket: "${ticketSubject}".`,
        type: 'info'
    });
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
