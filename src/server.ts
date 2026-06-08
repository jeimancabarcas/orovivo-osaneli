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
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Returns tracking URL based on carrier name and guide number.
 */
function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const c = (carrier || '').toLowerCase();
  const guide = trackingNumber || '';
  if (c.includes('servientrega')) {
    return `https://www.servientrega.com/wps/portal/portal-nacional/transacciones/rastreo-envios?id=${guide}`;
  }
  if (c.includes('coordinadora')) {
    return `https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastreo-de-guias/?guia=${guide}`;
  }
  if (c.includes('interrapidisimo') || c.includes('inter')) {
    return `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${guide}`;
  }
  if (c.includes('envia') || c.includes('envía')) {
    return `https://envia.co/`;
  }
  return `https://orovivo.osaneli.com/order?id=${guide}`;
}

/**
 * Envía un correo electrónico transaccional responsivo y de altísima calidad visual (dark lux).
 */
async function sendOrderEmail(order: any, status: string): Promise<void> {
  // Do not send emails for orders in CREATED status as requested by the user
  if (status === 'CREATED') {
    console.log(`[Email Skipped] No emails are sent for order ${order.id} in CREATED status.`);
    return;
  }

  // Do not send emails for VOIDED orders if they were never approved (i.e. no serial number assigned)
  if (status === 'VOIDED' && !order.serialNumber) {
    console.log(`[Email Skipped] No cancellation emails are sent for order ${order.id} because it was never approved (no serial number).`);
    return;
  }

  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';
  const isCreated = status === 'CREATED';
  const isVoided = status === 'VOIDED';
  const isShipped = status === 'SHIPPED';

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
  } else if (isShipped) {
    subject = `¡Pedido Despachado! Tu Reserva ${order.id} está en camino - OSANELI`;
    statusText = 'PEDIDO DESPACHADO';
    statusColor = '#C5A854';
    previewText = '¡Excelentes noticias! Tu pieza de OSANELI ha sido entregada a la transportadora.';
  } else {
    subject = `Actualización de tu Reserva ${order.id} - OSANELI`;
    statusText = `ESTADO: ${status}`;
    statusColor = '#C5A854';
    previewText = `Tu reserva ha cambiado al estado ${status}.`;
  }

  const productPrice = Number(process.env['PRODUCT_PRICE']) || environment.productPrice || 280000;
  const totalAmount = order.quantity * productPrice;
  const totalFormatted = `$${totalAmount.toLocaleString('es-CO')} COP`;
  const paymentLink = `https://orovivo.osaneli.com/order?id=${order.id}`;

  let itemsHtml = '';
  const orderItems = Array.isArray(order.items) ? order.items : [
    {
      version: order.version || 'oro_vivo',
      size: order.size || 'M',
      gender: order.gender || 'Unisex',
      quantity: order.quantity || 1,
      serialNumbers: order.serialNumber ? [order.serialNumber] : []
    }
  ];
  
  orderItems.forEach((it: any) => {
    const versionLabel = it.version === 'oro_vivo' ? 'Oro Vivo' : 'Edición Negra';
    const serialsLabel = it.serialNumbers && it.serialNumbers.length > 0 ? `<br><span style="font-size: 11px; color: #C5A854; font-family: monospace;">Serial: ${it.serialNumbers.join(' | ')}</span>` : '';
    itemsHtml += `
      <tr>
        <td colspan="2" class="ticket-cell" style="width: 100%; border-bottom: 1px solid rgba(255,255,255,0.02); padding: 12px 0;">
          <div style="float: left;">
            <div class="ticket-value" style="font-weight: bold; color: #ffffff;">${versionLabel} (${it.size} / ${it.gender})</div>
            ${isApproved ? serialsLabel : ''}
          </div>
          <div style="float: right; text-align: right; padding-top: 4px;">
            <span class="ticket-value" style="color: #C5A854; font-weight: 800;">x${it.quantity}</span>
          </div>
          <div style="clear: both;"></div>
        </td>
      </tr>
    `;
  });

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

        ${isShipped ? `
          <h1 class="title">Tu Pedido está en Camino</h1>
          <p class="intro-text">
            ¡Hola, <strong>${order.fullName}</strong>! Nos complace informarte que tu pedido del <strong>Drop 01: Oro Vivo</strong> de OSANELI ha sido despachado a la transportadora. Tu número de guía de seguimiento y detalles de entrega están disponibles abajo.
          </p>
        ` : ''}

        ${!isCreated && !isApproved && !isRejected && !isVoided && !isShipped ? `
          <h1 class="title">Actualización de tu Reserva</h1>
          <p class="intro-text">
            ¡Hola, <strong>${order.fullName}</strong>! El estado de tu reserva con el código <strong>${order.id}</strong> ha cambiado a: <strong>${status}</strong>.
          </p>
        ` : ''}

        <!-- Ticket Info -->
        <div class="ticket">
          <div class="ticket-title">Resumen de Reserva</div>
          
          <table class="ticket-table" style="width: 100%;">
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
              <td colspan="2">
                <div class="divider" style="margin: 15px 0;"></div>
                <div class="ticket-label" style="margin-bottom: 8px;">Prendas Reservadas</div>
              </td>
            </tr>
            ${itemsHtml}
            <tr>
              <td class="ticket-cell" style="padding-top: 15px;">
                <div class="ticket-label">Dirección de Envío</div>
                <div class="ticket-value" style="color: #e2e8f0; font-size: 13px;">${order.address || 'No especificada'}${order.city ? ' - ' + order.city : ''}${order.country ? ', ' + order.country : ''}</div>
              </td>
              <td class="ticket-cell" style="padding-top: 15px; text-align: right;">
                <div class="ticket-label">Valor Total</div>
                <div class="ticket-value" style="color: #C5A854; font-weight: 800; font-size: 16px;">${totalFormatted}</div>
              </td>
            </tr>
            ${isShipped && order.trackingNumber ? `
              <tr>
                <td colspan="2">
                  <div class="divider" style="margin: 15px 0;"></div>
                  <div class="ticket-label">Detalles de Envío</div>
                  <div class="ticket-value" style="color: #ffffff; font-size: 13px;">
                    Transportadora: <strong>${order.carrier || 'No especificada'}</strong><br>
                    Número de Guía: <strong style="color: #C5A854; font-family: monospace;">${order.trackingNumber}</strong>
                  </div>
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

          ${isApproved && !isShipped ? `
            <a href="${paymentLink}" class="btn">Ver mi Ticket de Lujo</a>
          ` : ''}

          ${isShipped && order.trackingNumber ? `
            <a href="${getCarrierTrackingUrl(order.carrier, order.trackingNumber)}" target="_blank" class="btn">Rastrear Mi Envío</a>
          ` : ''}

          ${isRejected ? `
            <a href="${paymentLink}" class="btn" style="background-color: #EF4444; color: #ffffff; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.25);">Volver a Intentar Pago</a>
          ` : ''}

          ${isVoided ? `
            <a href="https://orovivo.osaneli.com" class="btn">Volver al Inicio</a>
          ` : ''}

          ${!isCreated && !isApproved && !isRejected && !isVoided && !isShipped ? `
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

  let itemsTxt = '';
  orderItems.forEach((it: any) => {
    const versionLabel = it.version === 'oro_vivo' ? 'Oro Vivo' : 'Edición Negra';
    const serials = it.serialNumbers && it.serialNumbers.length > 0 ? ` [Serial: ${it.serialNumbers.join(' | ')}]` : '';
    itemsTxt += `- ${it.quantity}x ${versionLabel} (${it.size} / ${it.gender})${serials}\n`;
  });
  
  const textContent = isShipped 
    ? `${subject}\n\nCódigo: ${order.id}\nCliente: ${order.fullName}\n\nPrendas:\n${itemsTxt}\nTotal: ${totalFormatted}\nTransportadora: ${order.carrier || 'No especificada'}\nNúmero de Guía: ${order.trackingNumber}\nRastrear envío: ${getCarrierTrackingUrl(order.carrier, order.trackingNumber)}`
    : `${subject}\n\nCódigo: ${order.id}\nCliente: ${order.fullName}\n\nPrendas:\n${itemsTxt}\nTotal: ${totalFormatted}\nDirección de Envío: ${order.address || 'No especificada'}${order.city ? ' - ' + order.city : ''}${order.country ? ', ' + order.country : ''}\n\nVer detalles y gestionar: ${paymentLink}`;

  const mailOptions = {
    from: process.env['SMTP_FROM'] || '"OSANELI" <admin@osaneli.com>',
    to: order.email,
    bcc: 'admin@osaneli.com',
    subject: subject,
    html: htmlContent,
    text: textContent
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
  console.log('[Webhook] ===================================================');
  console.log('[Webhook] Recepción de evento de Bold iniciada.');
  console.log('[Webhook] Cuerpo del payload:', JSON.stringify(req.body, null, 2));
  
  try {
    const { type, data } = req.body;
    let orderId = data?.metadata?.reference || data?.reference || req.body.reference || req.body.orderId || req.body.order_id || data?.order_id || data?.orderId;
    
    if (!orderId) {
      console.warn(`[Webhook WARNING] Evento "${type}": No se encontró referencia/orderId en el payload.`);
      return res.status(400).json({ error: 'No orderId found' });
    }
    
    // Normalizar a mayúsculas y quitar espacios para evitar fallas de case-sensitivity en Firebase
    orderId = String(orderId).trim().toUpperCase();
    
    console.log(`[Webhook] ID de Pedido identificado y normalizado: "${orderId}" para el evento tipo: "${type}"`);
    
    const statusMap: Record<string, string> = {
      'SALE_APPROVED': 'APPROVED',
      'SALE_REJECTED': 'REJECTED',
      'VOID_APPROVED': 'VOIDED',
      'VOID_REJECTED': 'VOID_REJECTED'
    };
    
    const newStatus = statusMap[type];
    if (!newStatus) {
      console.warn(`[Webhook WARNING] Evento tipo "${type}" no está mapeado en el servidor para el pedido "${orderId}". Omisión del cambio.`);
      return res.status(200).json({ received: true, message: 'Unhandled event' });
    }
    
    console.log(`[Webhook] Mapeo de estado para evento "${type}" -> Nuevo Estado: "${newStatus}"`);
    
    console.log(`[Webhook] Consultando existencia del pedido "${orderId}" en Firebase...`);
    const orderRef = child(ref(db, 'orders'), orderId);
    const snapshot = await get(orderRef);
    const existing = snapshot.exists() ? snapshot.val() : {};
    
    console.log(`[Webhook] ¿El pedido existe previamente en base de datos? ${snapshot.exists() ? 'SÍ' : 'NO'}`);
    if (snapshot.exists()) {
      console.log('[Webhook] Datos existentes en Firebase:', JSON.stringify(existing, null, 2));
    }
    
    // Parse order items (ensure format consistency)
    const items = Array.isArray(existing.items)
      ? existing.items
      : [
          {
            version: existing.version || 'oro_vivo',
            size: existing.size || 'M',
            gender: existing.gender || 'Unisex',
            quantity: Number(existing.quantity || 1)
          }
        ];

    let assignedFirstOroVivoSerial = existing.serialNumber || '';
    let updatedItems = items;

    if (newStatus === 'APPROVED' && (!existing.serialNumber || existing.serialNumber === 'OSN-CONFIRMED' || (existing.items && existing.items.some((it: any) => it.version === 'oro_vivo' && (!it.serialNumbers || it.serialNumbers.length === 0))))) {
      console.log(`[Webhook] Generando seriales únicos correlativos para el pedido ${orderId}...`);
      // Fetch all orders to count already approved quantities
      const ordersRef = ref(db, 'orders');
      const allOrdersSnapshot = await get(ordersRef);
      const allOrders = allOrdersSnapshot.exists() ? allOrdersSnapshot.val() : {};
      
      let nextIndex = 1;
      for (const key in allOrders) {
        if (key !== orderId) {
          const o = allOrders[key];
          if (o.status === 'APPROVED' && key.toUpperCase().startsWith('OSN')) {
            if (o.items && o.items.length > 0) {
              nextIndex += o.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
            } else {
              nextIndex += (o.quantity || 1);
            }
          }
        }
      }

      const limit = environment.dropLimit || 100;

      // Assign serial numbers to each item in items
      updatedItems = items.map((it: any) => {
        if (it.version === 'oro_vivo') {
          // If they already have correct number of serialNumbers, keep them
          if (it.serialNumbers && it.serialNumbers.length === it.quantity) {
            if (!assignedFirstOroVivoSerial && it.serialNumbers.length > 0) {
              assignedFirstOroVivoSerial = it.serialNumbers[0];
            }
            return it;
          }
          const serialNumbers: string[] = [];
          for (let i = 0; i < it.quantity; i++) {
            const index = nextIndex++;
            const paddedIndex = String(index).padStart(3, '0');
            const serial = `OSN-ORO-${paddedIndex}/${limit}`;
            serialNumbers.push(serial);
            if (!assignedFirstOroVivoSerial) {
              assignedFirstOroVivoSerial = serial;
            }
          }
          return {
            ...it,
            serialNumbers
          };
        } else {
          return {
            ...it,
            serialNumbers: []
          };
        }
      });
    }

    const serialNumber = assignedFirstOroVivoSerial || (newStatus === 'APPROVED' ? 'OSN-CONFIRMED' : '');

    let taxes = existing.taxes || null;
    if (data?.amount?.taxes && Array.isArray(data.amount.taxes)) {
      taxes = data.amount.taxes.map((t: any) => ({
        type: t.type || 'VAT',
        value: Number(t.value || 0)
      }));
    }

    const updatedOrder = {
      ...existing,
      ...data,
      fullName: existing.fullName || data?.customer?.fullName || data?.customer_data?.fullName || '',
      email: existing.email || data?.customer?.email || data?.customer_data?.email || '',
      phone: existing.phone || data?.customer?.phone || data?.customer_data?.phone || '',
      address: existing.address || data?.customer?.address || data?.customer_data?.address || '',
      city: existing.city || data?.customer?.city || data?.customer_data?.city || '',
      country: existing.country || data?.customer?.country || data?.customer_data?.country || '',
      version: updatedItems[0]?.version || existing.version || 'oro_vivo',
      size: updatedItems[0]?.size || existing.size || 'M',
      gender: updatedItems[0]?.gender || existing.gender || 'Unisex',
      quantity: Number(existing.quantity || data?.quantity || updatedItems.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0) || 1),
      serialNumber: serialNumber,
      items: updatedItems,
      taxes: taxes,
      
      id: orderId,
      status: newStatus,
      boldEventType: type,
      boldUpdatedAt: new Date().toISOString(),
      bold_metadata: req.body
    };

    console.log(`[Webhook] Escribiendo datos actualizados en Firebase para el pedido "${orderId}"...`);
    await set(orderRef, updatedOrder);
    console.log(`[Webhook SUCCESS] Pedido "${orderId}" guardado con éxito en Firebase. Nuevo estado: "${newStatus}".`);
    
    // Disparar trigger de notificación al endpoint de forma asíncrona en segundo plano sin bloquear con await
    const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const host = req.headers.host;
    const notifyUrl = `${protocol}://${host}/api/notify-order`;
    
    console.log(`[Webhook] Disparando trigger de correo asíncrono en segundo plano a ${notifyUrl}...`);
    fetch(notifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId, status: newStatus })
    }).catch(err => {
      console.error(`[Webhook ERROR] Falla al disparar trigger de correo en segundo plano para el pedido "${orderId}":`, err);
    });
    
    console.log('[Webhook] Finalizado procesamiento de webhook con éxito. Retornando 200 OK de una.');
    console.log('[Webhook] ===================================================');
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error(`[Webhook ERROR] Error crítico procesando Webhook de Bold:`, error);
    console.log('[Webhook] ===================================================');
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
 * Admin Panel Authentication Endpoint
 */
app.post('/api/admin/auth', (req, res) => {
  try {
    const { password } = req.body;
    const adminPass = process.env['OSANELI_ADMIN_PASS'] || (environment as any).adminPass;
    
    if (password === adminPass) {
      // Create session signature token
      const token = Buffer.from('OSANELI-ADMIN-SESSION-' + Date.now()).toString('base64');
      return res.status(200).json({ success: true, token });
    }
    return res.status(401).json({ success: false, error: 'Contraseña de administrador incorrecta' });
  } catch (error) {
    console.error('Admin authentication error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to manually trigger the shipment email notification
 */
app.post('/api/admin/notify-shipment', async (req, res) => {
  try {
    // Validate session token
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado. Token inexistente.' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = Buffer.from(token, 'base64').toString('ascii');
      if (!decoded.startsWith('OSANELI-ADMIN-SESSION-')) {
        return res.status(401).json({ error: 'Sesión inválida o expirada.' });
      }
    } catch (e) {
      return res.status(401).json({ error: 'Token malformado.' });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Falta el ID de orden' });
    }

    const orderRef = child(ref(db, 'orders'), orderId);
    const snapshot = await get(orderRef);
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Orden no encontrada en base de datos.' });
    }

    const order = snapshot.val();
    order.id = order.id || orderId;

    if (!order.isShipped) {
      return res.status(400).json({ error: 'El pedido no se encuentra despachado en la base de datos.' });
    }

    // Trigger email shipment notification
    await sendOrderEmail(order, 'SHIPPED');

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending manually triggered shipment email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Endpoint to synchronize transaction details with Bold API by paymentId
 */
app.post('/api/admin/sync-bold', async (req, res) => {
  try {
    // Validate session token
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado. Token inexistente.' });
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = Buffer.from(token, 'base64').toString('ascii');
      if (!decoded.startsWith('OSANELI-ADMIN-SESSION-')) {
        return res.status(401).json({ error: 'Sesión inválida o expirada.' });
      }
    } catch (e) {
      return res.status(401).json({ error: 'Token malformado.' });
    }

    const { orderId, paymentId } = req.body;
    if (!orderId || !paymentId) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (orderId o paymentId)' });
    }

    const orderRef = child(ref(db, 'orders'), orderId);
    const snapshot = await get(orderRef);
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Orden no encontrada en base de datos.' });
    }

    const order = snapshot.val();

    // Query Bold notifications API
    console.log(`[Sync Bold] Fetching notifications for payment: ${paymentId}`);
    const boldResponse = await fetch(`https://integrations.api.bold.co/payments/webhook/notifications/${paymentId}`, {
      headers: {
        'Authorization': `x-api-key ${environment.boldApiKey}`
      }
    });
    if (!boldResponse.ok) {
      const errorText = await boldResponse.text();
      console.error(`[Sync Bold] Bold API error: ${boldResponse.status} - ${errorText}`);
      return res.status(502).json({ error: `Error de la API de Bold: ${boldResponse.status}` });
    }

    const boldData = await boldResponse.json() as any;
    console.log(`[Sync Bold] Received response:`, JSON.stringify(boldData, null, 2));

    let taxes = order.taxes || null;
    if (boldData?.data?.amount?.taxes && Array.isArray(boldData.data.amount.taxes)) {
      taxes = boldData.data.amount.taxes.map((t: any) => ({
        type: t.type || 'VAT',
        value: Number(t.value || 0)
      }));
    }

    // Update order with bold_metadata and taxes if present
    const updatedOrder = {
      ...order,
      bold_metadata: boldData,
      ...(taxes ? { taxes } : {})
    };

    // Write updated order back to Firebase
    await set(orderRef, updatedOrder);
    console.log(`[Sync Bold] Order ${orderId} synced successfully with Bold metadata.`);

    return res.status(200).json({ success: true, bold_metadata: boldData });
  } catch (error) {
    console.error('Error synchronizing Bold transaction details:', error);
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
