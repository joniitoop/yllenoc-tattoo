const nodemailer = require('nodemailer');

async function test() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'norokzxkpo22@gmail.com',
      pass: 'wxdc gclj gzza onoi' // 👈 ACA PONÉ TU CONTRASEÑA DE 16 DÍGITOS (con o sin espacios)
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Yllenoc Tattoo" <norokzxkpo22@gmail.com>',
      to: 'carlagconelly@hotmail.com.ar', // Poné un email de Hotmail REAL para probar
      subject: 'Test con contraseña de aplicacion',
      html: '<h1>Hola</h1><p>Este email deberia llegar a Hotmail</p>'
    });
    console.log("✅ Email enviado! ID:", info.messageId);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

test();