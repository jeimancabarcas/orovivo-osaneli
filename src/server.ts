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

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Parse body payloads for webhook
app.use(express.json());

// Initialize Firebase for Server-Side Webhook handling
const firebaseApp = initializeApp(environment.firebase);
const db = getDatabase(firebaseApp);

/**
 * Webhook POST Endpoint for Bold payment events
 */
app.post('/api/bold-webhook', async (req, res) => {
  console.log('Bold Webhook POST received:', JSON.stringify(req.body));
  
  // Respond immediately with 200 OK to satisfy Bold docs requirements (under 2 seconds limit)
  res.status(200).json({ received: true });
  
  try {
    const { type, data } = req.body;
    const orderId = data?.metadata?.reference || data?.reference || req.body.reference;
    
    if (!orderId) {
      console.warn(`Webhook of type ${type} received without orderId (metadata reference).`);
      return;
    }
    
    const ordersRef = ref(db, 'orders');
    const orderRef = child(ordersRef, orderId);
    const existingSnapshot = await get(orderRef);
    
    if (type === 'SALE_APPROVED') {
      let orderData: any = {};
      
      if (existingSnapshot.exists()) {
        const existing = existingSnapshot.val();
        if (existing.status === 'APPROVED') {
          console.log(`Order ${orderId} already approved in database. Skipping.`);
          return;
        }
        orderData = existing;
      }
      
      // If we don't have orderData or details, create fallback using Bold transaction details
      const finalOrderData = {
        fullName: orderData.fullName || data.card?.cardholder_name || 'Comprador Bold',
        email: orderData.email || data.payer_email || 'correo@cliente.com',
        phone: orderData.phone || '',
        version: orderData.version || 'oro_vivo',
        size: orderData.size || 'M',
        quantity: Number(orderData.quantity || 1)
      };
      
      // Fetch all orders to calculate next serial index based ONLY on APPROVED ones
      const ordersSnapshot = await get(ordersRef);
      let totalPreviousItems = 0;
      if (ordersSnapshot.exists()) {
        const allOrders = ordersSnapshot.val();
        Object.keys(allOrders).forEach((key) => {
          const ord = allOrders[key];
          if (ord.status === 'APPROVED') {
            totalPreviousItems += Number(ord.quantity || 1);
          }
        });
      }
      
      const nextIndex = totalPreviousItems + 1;
      const paddedIndex = String(nextIndex).padStart(3, '0');
      const serialNumber = `OSN-ORO-${paddedIndex}/100`;
      
      const finalOrder = {
        ...finalOrderData,
        id: orderId,
        status: 'APPROVED',
        serialNumber,
        createdAt: orderData.createdAt || new Date().toISOString()
      };
      
      // Save order to database
      await set(orderRef, finalOrder);
      console.log(`Successfully finalized order ${orderId} via webhook. Serial: ${serialNumber}`);
      
    } else if (type === 'SALE_REJECTED') {
      if (existingSnapshot.exists()) {
        const existing = existingSnapshot.val();
        await set(orderRef, {
          ...existing,
          status: 'REJECTED'
        });
      } else {
        await set(orderRef, {
          id: orderId,
          fullName: data.card?.cardholder_name || 'Comprador Bold',
          email: data.payer_email || 'correo@anonimo.com',
          phone: '',
          version: 'oro_vivo',
          size: 'M',
          quantity: 1,
          status: 'REJECTED',
          createdAt: new Date().toISOString()
        });
      }
      console.log(`Order ${orderId} marked as REJECTED via webhook.`);
      
    } else if (type.includes('VOID') || type.includes('CANCEL')) {
      if (existingSnapshot.exists()) {
        const existing = existingSnapshot.val();
        await set(orderRef, {
          ...existing,
          status: 'VOIDED'
        });
      } else {
        await set(orderRef, {
          id: orderId,
          fullName: data.card?.cardholder_name || 'Comprador Bold',
          email: data.payer_email || 'correo@anonimo.com',
          phone: '',
          version: 'oro_vivo',
          size: 'M',
          quantity: 1,
          status: 'VOIDED',
          createdAt: new Date().toISOString()
        });
      }
      console.log(`Order ${orderId} marked as VOIDED via webhook.`);
    }
  } catch (error) {
    console.error('Error processing Bold webhook transaction:', error);
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
