import nodemailer from 'nodemailer';

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
    const adminEmail = process.env.ADMIN_EMAIL || 'martinalbertoblog@gmail.com';
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
    const adminEmail = process.env.ADMIN_EMAIL || 'martinalbertoblog@gmail.com';
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
    const adminEmail = process.env.ADMIN_EMAIL || 'martinalbertoblog@gmail.com';
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
