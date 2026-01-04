import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || "";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error("Email credentials are not configured");
    }

    const transporter = getTransporter();

    const info = await transporter.sendMail({
      from: EMAIL_USER,
      to,
      subject,
      text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Email send error:", error);
    return { success: false, error: error?.message || "Email failed" };
  }
}

export default { sendEmail };
