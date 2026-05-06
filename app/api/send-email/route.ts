import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'norokzxkpo22@gmail.com',
        pass: 'wxdc gclj gzza onoi'
      }
    });

    const mailOptions = {
      from: '"Yllenoc Tattoo" <norokzxkpo22@gmail.com>',
      to: to,
      subject: subject,
      html: html,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Entity-Ref-ID': crypto.randomUUID(),
        'Message-ID': `<${crypto.randomUUID()}@yllenoc-tattoo.local>`
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.messageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}