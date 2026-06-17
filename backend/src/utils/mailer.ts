import nodemailer from 'nodemailer';

function createTransport() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const transport = createTransport();

    await transport.sendMail({
        from: process.env.SMTP_FROM || 'NeoVault <noreply@linkvault.app>',
        to,
        subject: 'Reset your NeoVault password',
        html: `
<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0f1117;color:#e2e8f0;margin:0;padding:32px 16px;">
  <div style="max-width:480px;margin:0 auto;background:#1a1d27;border:1px solid #2a2d3a;border-radius:12px;padding:36px 32px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <span style="font-size:20px;font-weight:700;color:#e2e8f0;letter-spacing:-0.02em;">NeoVault</span>
    </div>
    <h2 style="font-size:22px;font-weight:700;color:#e2e8f0;margin:0 0 8px;">Reset your password</h2>
    <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;">
      We received a request to reset the password for your account. Click the button below to choose a new password. This link expires in <strong style="color:#e2e8f0;">1 hour</strong>.
    </p>
    <a href="${resetUrl}"
       style="display:inline-block;background:#06b6d4;color:#fff;font-weight:600;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:8px;margin-bottom:24px;">
      Reset Password
    </a>
    <p style="color:#64748b;font-size:12px;margin:0;">
      If you didn't request this, you can safely ignore this email. Your password won't change.
    </p>
    <hr style="border:none;border-top:1px solid #2a2d3a;margin:24px 0 16px;" />
    <p style="color:#64748b;font-size:11px;margin:0;">
      If the button doesn't work, copy and paste this link into your browser:<br/>
      <a href="${resetUrl}" style="color:#06b6d4;word-break:break-all;">${resetUrl}</a>
    </p>
  </div>
</body>
</html>`,
    });
}
