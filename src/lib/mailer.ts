import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

export async function sendWelcomeEmail(to: string, name: string) {
    const mailOptions = {
        from: `"JeevVeda" <${process.env.MAIL_USER}>`,
        to,
        subject: "Welcome to JeevVeda",
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background:#f6f8f9; padding:40px 20px;">
            
            <div style="max-width:600px; margin:auto; background:#ffffff; padding:40px; border-radius:10px; box-shadow:0 4px 14px rgba(0,0,0,0.05);">
            
            <h2 style="margin-top:0; color:#0f766e;">
                Welcome to JeevVeda, ${name}
            </h2>

            <p style="font-size:15px; color:#374151; line-height:1.6;">
                We're excited to have you join us.
                Your account has been successfully created and you're ready to start exploring
                everything JeevVeda has to offer.
            </p>

            <div style="text-align:center; margin:30px 0;">
                <a href="${process.env.PUBLIC_APP_URL}/login"
                style="background:#0f766e;
                        color:#ffffff;
                        padding:12px 26px;
                        border-radius:8px;
                        font-weight:600;
                        text-decoration:none;
                        display:inline-block;">
                Go to Dashboard
                </a>
            </div>

            <p style="font-size:14px; color:#4b5563; line-height:1.6;">
                If you have any questions or need help getting started,
                feel free to reply to this email. We're always happy to help.
            </p>

            <hr style="border:none; border-top:1px solid #e5e7eb; margin:30px 0;" />

            <p style="font-size:12px; color:#9ca3af;">
                If you didn't create this account, you can safely ignore this email.
            </p>

            <p style="font-size:12px; color:#9ca3af; margin-top:10px;">
                © ${new Date().getFullYear()} JeevVeda
            </p>

            </div>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}