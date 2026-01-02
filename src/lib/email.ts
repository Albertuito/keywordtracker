import nodemailer from 'nodemailer';

export async function sendVerificationEmail(to: string, token: string) {
    const { EMAIL_SERVER_HOST, EMAIL_SERVER_PORT, EMAIL_SERVER_USER, EMAIL_SERVER_PASSWORD, EMAIL_FROM, NEXTAUTH_URL } = process.env;

    const verifyUrl = `${NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    // Fallback if credentials are missing (Dev Mode)
    if (!EMAIL_SERVER_HOST || !EMAIL_SERVER_USER || !EMAIL_SERVER_PASSWORD) {
        console.warn("⚠️ Email credentials not found in env. Logging verification link.");
        console.log(`[EMAIL DEV] To: ${to}, Link: ${verifyUrl}`);
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: EMAIL_SERVER_HOST,
            port: Number(EMAIL_SERVER_PORT) || 587,
            secure: Number(EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: EMAIL_SERVER_USER,
                pass: EMAIL_SERVER_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: EMAIL_FROM || '"KeywordTracker" <noreply@keywordtracker.es>',
            to,
            subject: 'Verifica tu email - KeywordTracker',
            text: `Bienvenido a KeywordTracker. Verifica tu email aquí: ${verifyUrl}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #3B82F6;">Bienvenido a KeywordTracker</h2>
                    <p>Gracias por registrarte. Para comenzar a rastrear tus rankings, por favor verifica tu dirección de email.</p>
                    <div style="margin: 30px 0;">
                        <a href="${verifyUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verificar Email</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p style="color: #666; font-size: 14px; word-break: break-all;">${verifyUrl}</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px;">Si no has creado esta cuenta, puedes ignorar este mensaje.</p>
                </div>
            `,
        });
        console.log(`[EMAIL SENT] Verification email sent to ${to}`);
    } catch (error) {
        console.error("[EMAIL ERROR] Failed to send email:", error);
        // Don't crash the request, just log it.
    }
}
