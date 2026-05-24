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
    
    await set(orderRef, {
      ...existing,
      ...data,
      id: orderId,
      status: newStatus,
      boldEventType: type,
      boldUpdatedAt: new Date().toISOString()
    });
    
    console.log(`Order ${orderId} updated to ${newStatus}.`);
    
    // CORRECCIÓN: Responder AQUÍ, cuando todo terminó con éxito
    return res.status(200).json({ received: true });

  } catch (error) {
    console.error('Error processing Bold webhook:', error);
    // Respondemos con un error 500 para que Bold sepa que falló y reintente si es necesario
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
