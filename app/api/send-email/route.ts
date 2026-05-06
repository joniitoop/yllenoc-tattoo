import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    console.log("📧 Enviando email a:", to);
    console.log("🔑 API Key existe:", !!RESEND_API_KEY);

    if (!RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY no está configurada en .env.local");
      return NextResponse.json(
        { error: "API key no configurada en el servidor" },
        { status: 500 }
      );
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [to],
        subject: subject,
        html: html
      })
    });

    const data = await res.json();
    console.log("📧 Respuesta de Resend:", data);

    if (!res.ok) {
      return NextResponse.json(
        { error: data },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("❌ Error interno en la API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}