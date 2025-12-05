import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function sendOrderConfirmationEmail(
  to: string,
  order: any
) {
  const mailOptions = {
    from: `"ModaStyle" <${process.env.SMTP_FROM}>`,
    to,
    subject: `Confirmación de pedido #${order.numeroPedido}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #0ea5e9;">¡Gracias por tu compra!</h1>
        <p>Hemos recibido tu pedido #${order.numeroPedido}</p>
        
        <h2>Resumen del pedido:</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Producto</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Cantidad</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any) => `
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.nombre}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${item.cantidad}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">$${item.precio.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <p><strong>Total: $${order.total.toLocaleString()}</strong></p>
        
        <p>Te notificaremos cuando tu pedido sea enviado.</p>
        
        <p>Gracias por comprar en ModaStyle,<br>
        El equipo de ModaStyle</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}