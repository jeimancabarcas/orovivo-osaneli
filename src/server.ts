import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, child } from 'firebase/database';
import { environment } from './environments/environment';
import nodemailer from 'nodemailer';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Parse body payloads for webhook
app.use(express.json());

// Initialize Firebase for Server-Side Webhook handling
const firebaseApp = initializeApp(environment.firebase);
const db = getDatabase(firebaseApp);

// Configuración del transporte SMTP de Nodemailer (Hostinger)
const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] || 'smtp.hostinger.com',
  port: Number(process.env['SMTP_PORT'] || '587'),
  secure: Number(process.env['SMTP_PORT'] || '587') === 465,
  auth: {
    user: process.env['SMTP_USER'] || 'admin@osaneli.com',
    pass: process.env['SMTP_PASS'] || 'Osaneli01+',
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Envía un correo electrónico transaccional responsivo y de altísima calidad visual (dark lux).
 */
async function sendOrderEmail(order: any, status: string): Promise<void> {
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';
  const isCreated = status === 'CREATED';
  const isVoided = status === 'VOIDED';

  let subject = '';
  let statusText = '';
  let statusColor = '';
  let previewText = '';

  if (isCreated) {
    subject = `Reserva Iniciada: Código ${order.id} - OSANELI`;
    statusText = 'RESERVA INICIADA';
    statusColor = '#C5A854';
    previewText = 'Tu preventa de edición limitada ha comenzado. Completa tu pago para asegurar tu pieza.';
  } else if (isApproved) {
    subject = `¡Reserva Confirmada! Tu Ticket Drop 01 - OSANELI`;
    statusText = 'RESERVA CONFIRMADA';
    statusColor = '#4ADE80';
    previewText = '¡Felicidades! Eres dueño del Oro. Tu pieza está oficialmente reservada con éxito.';
  } else if (isRejected) {
    subject = `Pago Rechazado: Reserva ${order.id} - OSANELI`;
    statusText = 'PAGO RECHAZADO';
    statusColor = '#EF4444';
    previewText = 'Hubo un inconveniente al procesar tu transacción. Reintenta tu pago para no perder tu reserva.';
  } else if (isVoided) {
    subject = `Reserva Anulada: Código ${order.id} - OSANELI`;
    statusText = 'RESERVA ANULADA';
    statusColor = '#6B7280';
    previewText = 'Lamentamos informarte que tu reserva ha sido cancelada.';
  } else {
    subject = `Actualización de tu Reserva ${order.id} - OSANELI`;
    statusText = `ESTADO: ${status}`;
    statusColor = '#C5A854';
    previewText = `Tu reserva ha cambiado al estado ${status}.`;
  }

  const productName = order.version === 'oro_vivo' ? 'Oro Vivo (Oro)' : 'Edición Secreta (Negra)';
  const productPrice = Number(process.env['PRODUCT_PRICE']) || environment.productPrice || 280000;
  const totalAmount = order.quantity * productPrice;
  const totalFormatted = `$${totalAmount.toLocaleString('es-CO')} COP`;
  const paymentLink = `https://orovivo.osaneli.com/order?id=${order.id}`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b131a;
      font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0b131a;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #111111;
      border: 1px solid rgba(197, 168, 84, 0.2);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .header {
      padding: 40px 0 20px 0;
      text-align: center;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .logo {
      height: 28px;
      width: auto;
      filter: brightness(0.9) invert(1);
    }
    .content {
      padding: 40px;
    }
    .badge-container {
      text-align: center;
      margin-bottom: 24px;
    }
    .badge {
      display: inline-block;
      padding: 6px 16px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.15em;
      border-radius: 50px;
      border: 1px solid ${statusColor};
      color: ${statusColor};
      background-color: rgba(197, 168, 84, 0.05);
      text-transform: uppercase;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 16px 0;
      line-height: 1.2;
      letter-spacing: -0.02em;
      text-align: center;
    }
    .intro-text {
      font-size: 14px;
      line-height: 1.6;
      color: #94a3b8;
      margin: 0 0 32px 0;
      text-align: center;
    }
    .ticket {
      background-color: #1a1a1a;
      border: 1px dashed rgba(197, 168, 84, 0.3);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .ticket-title {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.2em;
      color: #C5A854;
      margin: 0 0 16px 0;
      text-transform: uppercase;
      text-align: center;
    }
    .ticket-table {
      width: 100%;
    }
    .ticket-cell {
      padding: 8px 0;
      font-size: 12px;
      vertical-align: top;
      width: 50%;
    }
    .ticket-label {
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.05em;
    }
    .ticket-value {
      color: #ffffff;
      font-weight: 700;
    }
    .ticket-value.serial {
      color: #C5A854;
      font-size: 15px;
      letter-spacing: 0.05em;
    }
    .btn-container {
      text-align: center;
      margin-top: 16px;
    }
    .btn {
      display: inline-block;
      background-color: #C5A854;
      color: #111111;
      text-align: center;
      padding: 16px 36px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.1em;
      text-decoration: none;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(197, 168, 84, 0.25);
    }
    .footer {
      background-color: #0d0d0d;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid rgba(255,255,255,0.03);
    }
    .footer-text {
      font-size: 11px;
      color: #475569;
      line-height: 1.6;
    }
    .divider {
      height: 1px;
      background-color: rgba(255,255,255,0.05);
      margin: 16px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="https://orovivo.osaneli.com/logo.png" alt="OSANELI" class="logo">
      </div>
      <div class="content">
        <div class="badge-container">
          <div class="badge">${statusText}</div>
        </div>
        
        ${isCreated ? `
          <h1 class="title">Tu preventa ha comenzado</h1>
          <p class="intro-text">
            ¡Hola, <strong>${order.fullName}</strong>! Tu solicitud para el <strong>Drop 01: Oro Vivo</strong> de OSANELI ha sido registrada exitosamente. Para asegurar tu pieza de edición limitada y numerada, por favor completa tu pago a través de la pasarela oficial de Bold haciendo clic abajo.
          </p>
        ` : ''}

        ${isApproved ? `
          <h1 class="title">¡Eres Dueño del Oro!</h1>
          <p class="intro-text">
            ¡Hola, <strong>${order.fullName}</strong>! Tu pago ha sido aprobado exitosamente. Tu pieza de alta costura streetwear de OSANELI está asegurada. A continuación tienes los detalles y el número de serie de tu ticket digital exclusivo.
          </p>
        ` : ''}

        ${isRejected ? `
          <h1 class="title">Tu pago no pudo ser procesado</h1>
          <p class="intro-text">
            ¡Hola, <strong>${order.fullName}</strong>! Queremos informarte que la pasarela de pagos Bold ha rechazado la transacción de tu reserva. Tu código de reserva sigue activo. Puedes intentar realizar el pago nuevamente de inmediato utilizando el botón de abajo.
          </p>
        ` : ''}

        ${isVoided ? `
          <h1 class="title">Reserva Anulada</h1>
          <p class="intro-text">
            ¡Hola, <strong>${order.fullName}</strong>! Te informamos que tu reserva con el código <strong>${order.id}</strong> ha sido anulada. Si deseas volver a iniciar una preventa, no dudes en visitar nuestra tienda web.
          </p>
        ` : ''}

        ${!isCreated && !isApproved && !isRejected && !isVoided ? `
          <h1 class="title">Actualización de tu Reserva</h1>
          <p class="intro-text">
            ¡Hola, <strong>${order.fullName}</strong>! El estado de tu reserva con el código <strong>${order.id}</strong> ha cambiado a: <strong>${status}</strong>.
          </p>
        ` : ''}

        <!-- Ticket Info -->
        <div class="ticket">
          <div class="ticket-title">Resumen de Reserva</div>
          
          <table class="ticket-table">
            <tr>
              <td class="ticket-cell">
                <div class="ticket-label">Código de Orden</div>
                <div class="ticket-value" style="font-family: monospace; letter-spacing: 0.05em;">${order.id}</div>
              </td>
              <td class="ticket-cell">
                <div class="ticket-label">Cliente</div>
                <div class="ticket-value">${order.fullName}</div>
              </td>
            </tr>
            <tr>
              <td class="ticket-cell">
                <div class="ticket-label">Pieza</div>
                <div class="ticket-value">${productName}</div>
              </td>
              <td class="ticket-cell">
                <div class="ticket-label">Talla (Boxy Fit)</div>
                <div class="ticket-value" style="color: #C5A854;">${order.size}</div>
              </td>
            </tr>
            <tr>
              <td class="ticket-cell">
                <div class="ticket-label">Cantidad</div>
                <div class="ticket-value">${order.quantity} ${order.quantity === 1 ? 'unidad' : 'unidades'}</div>
              </td>
              <td class="ticket-cell">
                <div class="ticket-label">Valor Total</div>
                <div class="ticket-value">${totalFormatted}</div>
              </td>
            </tr>
            ${isApproved && order.serialNumber ? `
              <tr>
                <td colspan="2">
                  <div class="divider"></div>
                  <div class="ticket-label">Número de Serie Exclusivo</div>
                  <div class="ticket-value serial">${order.serialNumber}</div>
                </td>
              </tr>
            ` : ''}
          </table>
        </div>

        <!-- Acciones -->
        <div class="btn-container">
          ${isCreated ? `
            <a href="${paymentLink}" class="btn">Proceder al Pago Seguro</a>
          ` : ''}

          ${isApproved ? `
            <a href="${paymentLink}" class="btn">Ver mi Ticket de Lujo</a>
          ` : ''}

          ${isRejected ? `
            <a href="${paymentLink}" class="btn" style="background-color: #EF4444; color: #ffffff; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25);">Volver a Intentar Pago</a>
          ` : ''}

          ${isVoided ? `
            <a href="https://orovivo.osaneli.com" class="btn">Volver al Inicio</a>
          ` : ''}

          ${!isCreated && !isApproved && !isRejected && !isVoided ? `
            <a href="${paymentLink}" class="btn">Ver Detalles de Reserva</a>
          ` : ''}
        </div>
        
      </div>
      <div class="footer">
        <p class="footer-text">
          Diseñado y confeccionado éticamente bajo los más altos estándares de alta costura streetwear en Cartagena, Colombia.<br>
          Este correo es automático. Si tienes alguna duda, contáctanos a <a href="mailto:admin@osaneli.com" style="color: #C5A854; text-decoration: none;">admin@osaneli.com</a>.
        </p>
        <p class="footer-text" style="margin-top: 20px; font-size: 10px; color: #334155;">
          © ${new Date().getFullYear()} OSANELI. Todos los derechos reservados.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const mailOptions = {
    from: process.env['SMTP_FROM'] || '"OSANELI" <admin@osaneli.com>',
    to: order.email,
    bcc: 'admin@osaneli.com',
    subject: subject,
    html: htmlContent,
    text: `${subject}\n\nCódigo: ${order.id}\nCliente: ${order.fullName}\nPieza: ${productName}\nTalla: ${order.size}\nCantidad: ${order.quantity}\nTotal: ${totalFormatted}\n\nVer detalles y gestionar: ${paymentLink}`
  };

  try {
    console.log(`Sending email for order ${order.id} with status ${status} to ${order.email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent for order ${order.id}:`, info.messageId);
  } catch (error) {
    console.error(`Failed to send email for order ${order.id}:`, error);
  }
}

/**
 * Webhook POST Endpoint for Bold payment events.
 * Simple handler: updates the order status and merges all fields sent by Bold.
 */
app.post('/api/bold-webhook', async (req, res) => {
  console.log('Bold Webhook received angular:', JSON.stringify(req.body));
  
  try {
    const { type, data } = req.body;
    const orderId = data?.metadata?.reference || data?.reference || req.body.reference;
    
    if (!orderId) {
      console.warn(`Webhook ${type}: no orderId found in payload.`);
      // Respondemos 400 porque el payload no es válido para nosotros
      return res.status(400).json({ error: 'No orderId found' });
    }
    
    const statusMap: Record<string, string> = {
      'SALE_APPROVED': 'APPROVED',
      'SALE_REJECTED': 'REJECTED',
      'VOID_APPROVED': 'VOIDED',
      'VOID_REJECTED': 'VOID_REJECTED'
    };
    
    const newStatus = statusMap[type];
    if (!newStatus) {
      console.warn(`Webhook: unhandled event type "${type}" for order ${orderId}.`);
      return res.status(200).json({ received: true, message: 'Unhandled event' });
    }
    
    const orderRef = child(ref(db, 'orders'), orderId);
    const snapshot = await get(orderRef);
    const existing = snapshot.exists() ? snapshot.val() : {};
    
    const updatedOrder = {
      ...existing,
      ...data,
      id: orderId,
      status: newStatus,
      boldEventType: type,
      boldUpdatedAt: new Date().toISOString()
    };

    await set(orderRef, updatedOrder);
    
    console.log(`Order ${orderId} updated to ${newStatus}.`);
    
    // Disparar envío de correo asíncronamente en segundo plano
    sendOrderEmail(updatedOrder, newStatus).catch(err => {
      console.error(`Failed to trigger email from Bold webhook for order ${orderId}:`, err);
    });
    
    // Responder con éxito
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error processing Bold webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint para notificar cambios de estado o creación de pedido desde el cliente.
 */
app.post('/api/notify-order', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ error: 'Missing orderId or status' });
    }

    const orderRef = child(ref(db, 'orders'), orderId);
    const snapshot = await get(orderRef);
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Order not found in database' });
    }

    const order = snapshot.val();
    order.id = order.id || orderId;

    // Disparar envío de correo
    await sendOrderEmail(order, status);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error notifying order status change:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
