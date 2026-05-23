// Dedicated Vercel Serverless Function for Bold payment webhooks.
// Vercel auto-parses JSON bodies in /api functions, so req.body is always available.

const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDC5zTjrdT7DNEzZj3Z7Sg9pKCBBv-oOR4',
  authDomain: 'osaneli-oro-vivo.firebaseapp.com',
  databaseURL: 'https://osaneli-oro-vivo-default-rtdb.firebaseio.com',
  projectId: 'osaneli-oro-vivo',
  storageBucket: 'osaneli-oro-vivo.firebasestorage.app',
  messagingSenderId: '749450568007',
  appId: '1:749450568007:web:f263f61ff0642b71342c62',
};

const STATUS_MAP = {
  SALE_APPROVED: 'APPROVED',
  SALE_REJECTED: 'REJECTED',
  VOID_APPROVED: 'VOIDED',
  VOID_REJECTED: 'VOID_REJECTED',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Respond immediately — Bold requires a response under 2 seconds
  res.status(200).json({ received: true });

  console.log('Bold Webhook received:', JSON.stringify(req.body));

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getDatabase, ref, child, get, set } = await import('firebase/database');

    // Reuse existing Firebase app instance across warm invocations
    const firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    const db = getDatabase(firebaseApp);

    const { type, data } = req.body ?? {};
    const orderId = data?.metadata?.reference ?? data?.reference ?? req.body?.reference;

    if (!type || !orderId) {
      console.warn('Webhook: missing type or orderId in payload.');
      return;
    }

    const newStatus = STATUS_MAP[type];
    if (!newStatus) {
      console.warn(`Webhook: unhandled event type "${type}" for order ${orderId}.`);
      return;
    }

    const orderRef = child(ref(db, 'orders'), orderId);
    const snapshot = await get(orderRef);
    const existing = snapshot.exists() ? snapshot.val() : {};

    // Merge existing order + all Bold fields + updated status
    await set(orderRef, {
      ...existing,
      ...data,
      id: orderId,
      status: newStatus,
      boldEventType: type,
      boldUpdatedAt: new Date().toISOString(),
    });

    console.log(`Order ${orderId} → ${newStatus}`);
  } catch (error) {
    console.error('Error processing Bold webhook:', error);
  }
};
