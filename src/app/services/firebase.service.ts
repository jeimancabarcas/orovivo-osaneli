import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get, child, Database } from 'firebase/database';
import { environment } from '../../environments/environment';

export interface OrderItem {
  version: 'oro_vivo' | 'edicion_secreta';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  gender: string;
  quantity: number;
  serialNumbers?: string[];
}

export interface Order {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  version: 'oro_vivo' | 'edicion_secreta';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  gender?: string;
  quantity: number;
  items?: OrderItem[];
  status: 'CREATED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'VOIDED' | 'VOID_REJECTED';
  serialNumber?: string;
  createdAt: Date;
  isShipped?: boolean;
  shippedAt?: string;
  trackingNumber?: string;
  carrier?: string;
  adminNotes?: string;
  boldUpdatedAt?: string;
  bold_code?: string;
  payment_id?: string;
  payment_method?: string;
  merchant_id?: string;
  integration?: string;
  card?: any;
  bold_metadata?: any;
}

// Retain PreOrder as a type alias for compatibility in other files if needed
export type PreOrder = Order;

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly platformId = inject(PLATFORM_ID);
  private firebaseApp: FirebaseApp | null = null;
  private db: Database | null = null;

  // Internal reactive signal holding orders list synchronized with Firebase
  private readonly ordersList = signal<Order[]>([]);

  // Tracks if the first real-time packet sync with Firebase has successfully completed
  readonly isInitialSyncCompleted = signal<boolean>(false);

  constructor() {
    this.initFirebase();
  }

  // Public readonly access to the synchronized orders
  readonly orders = computed(() => this.ordersList());
  
  // Deprecated compatibility getter
  readonly preorders = computed(() => this.ordersList());

  /**
   * Initialize Firebase safely only on client browser to be SSR friendly
   */
  private initFirebase(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.firebaseApp = initializeApp(environment.firebase);
        this.db = getDatabase(this.firebaseApp);
        this.syncWithFirebase();
      } catch (error) {
        console.warn('Firebase Realtime Database failed to initialize. Operating in offline mode.', error);
        this.isInitialSyncCompleted.set(true); // Fail-safe for offline mode
      }
    } else {
      this.isInitialSyncCompleted.set(true); // Fail-safe for SSR
    }
  }

  /**
   * Subscribe to real-time updates from Firebase 'orders' node
   */
  private syncWithFirebase(): void {
    if (!this.db) return;
    const ordersRef = ref(this.db, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsedList: Order[] = [];
        Object.keys(data).forEach((key) => {
          const item = data[key];
          const parsedItems: OrderItem[] = Array.isArray(item.items)
            ? item.items.map((it: any) => ({
                version: it.version || 'oro_vivo',
                size: it.size || 'M',
                gender: it.gender || 'Unisex',
                quantity: Number(it.quantity || 1),
                serialNumbers: it.serialNumbers || []
              }))
            : [
                {
                  version: item.version || 'oro_vivo',
                  size: item.size || 'M',
                  gender: item.gender || 'Unisex',
                  quantity: Number(item.quantity || 1),
                  serialNumbers: item.serialNumber ? [item.serialNumber] : []
                }
              ];
          parsedList.push({
            id: item.id || key,
            fullName: item.fullName || '',
            email: item.email || '',
            phone: item.phone || '',
            address: item.address || '',
            city: item.city || '',
            country: item.country || '',
            version: item.version || 'oro_vivo',
            size: item.size || 'M',
            gender: item.gender || 'Unisex',
            quantity: Number(item.quantity || 1),
            items: parsedItems,
            status: item.status || 'CREATED',
            serialNumber: item.serialNumber || '',
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
            isShipped: !!item.isShipped,
            shippedAt: item.shippedAt || '',
            trackingNumber: item.trackingNumber || '',
            carrier: item.carrier || '',
            adminNotes: item.adminNotes || '',
            boldUpdatedAt: item.boldUpdatedAt || '',
            bold_code: item.bold_code || '',
            payment_id: item.payment_id || '',
            payment_method: item.payment_method || '',
            merchant_id: item.merchant_id || '',
            integration: item.integration || '',
            card: item.card || null,
            bold_metadata: item.bold_metadata || null
          });
        });

        // Maintain chronological order
        parsedList.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        this.ordersList.set(parsedList);
      } else {
        this.ordersList.set([]);
      }
      this.isInitialSyncCompleted.set(true);
    }, (error) => {
      console.error('Firebase sync listener error:', error);
      this.isInitialSyncCompleted.set(true); // Fail-safe to unblock loader
    });
  }

  /**
   * Persist an order to the central database in real time
   */
  async saveOrder(order: Order): Promise<void> {
    if (!this.db) {
      console.warn('Firebase DB not initialized. Order could not be synced in real-time.');
      return;
    }
    
    try {
      const orderRef = ref(this.db, `orders/${order.id}`);
      await set(orderRef, {
        ...order,
        createdAt: order.createdAt.toISOString() // Store dates in ISO format in JSON DB
      });
      this.notifyServerOfStatusChange(order.id, order.status).catch(err => {
        console.error('Failed to notify server of status change:', err);
      });
    } catch (err) {
      console.error('Failed to write order to Firebase:', err);
      throw err;
    }
  }

  /**
   * Legacy compatibility method
   */
  async savePreOrder(order: Order): Promise<void> {
    return this.saveOrder(order);
  }

  /**
   * Save a temporary pending order draft to Firebase Realtime Database in /orders node
   */
  async savePendingOrder(orderId: string, formValue: any): Promise<void> {
    if (!this.db) return;
    try {
      const orderRef = ref(this.db, `orders/${orderId}`);
      await set(orderRef, {
        id: orderId,
        fullName: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone,
        address: formValue.address,
        city: formValue.city || '',
        country: formValue.country || '',
        version: formValue.version || (formValue.items?.[0]?.version || 'oro_vivo'),
        size: formValue.size || (formValue.items?.[0]?.size || 'M'),
        gender: formValue.gender || (formValue.items?.[0]?.gender || 'Unisex'),
        quantity: Number(formValue.quantity || 1),
        items: formValue.items || [],
        status: 'CREATED',
        createdAt: new Date().toISOString()
      });
      // Email skipped upon creation as requested by user
    } catch (err) {
      console.error('Failed to save pending order in cloud:', err);
      throw err; // Re-throw to allow components to handle database failure
    }
  }

  /**
   * Update the status of an order quickly and cleanly
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    if (!this.db) return;
    try {
      // Query the order first to inspect its current properties
      const order = await this.getOrderById(orderId);
      const serialNumber = order?.serialNumber;
      
      const statusRef = ref(this.db, `orders/${orderId}/status`);
      await set(statusRef, status);
      
      // Do not notify server if the status is CREATED, or if the status is VOIDED but the order has no serial number
      if (status === 'CREATED' || (status === 'VOIDED' && !serialNumber)) {
        console.log(`[Client Info] Skipping server notification for order ${orderId} with status ${status} (No serial number).`);
        return;
      }
      
      this.notifyServerOfStatusChange(orderId, status).catch(err => {
        console.error('Failed to notify server of status change:', err);
      });
    } catch (err) {
      console.error('Failed to update order status in Firebase:', err);
      throw err;
    }
  }

  /**
   * Notify the backend server about an order status change to trigger transaction email.
   */
  private async notifyServerOfStatusChange(orderId: string, status: Order['status']): Promise<void> {
    try {
      const response = await fetch('/api/notify-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId, status })
      });
      if (!response.ok) {
        console.warn(`Failed to notify server of status change for order ${orderId}. Status: ${response.status}`);
      }
    } catch (err) {
      console.warn(`Error sending order status notification to server:`, err);
    }
  }

  /**
   * Legacy compatibility method
   */
  async savePendingPreOrder(orderId: string, formValue: any): Promise<void> {
    return this.savePendingOrder(orderId, formValue);
  }

  /**
   * One-time query to fetch a single order by its unique Order ID from Firebase Realtime Database
   */
  async getOrderById(id: string): Promise<Order | null> {
    if (!this.db) return null;
    try {
      const orderRef = ref(this.db, `orders/${id.toUpperCase()}`);
      const snapshot = await get(orderRef);
      if (snapshot.exists()) {
        const item = snapshot.val();
        const parsedItems: OrderItem[] = Array.isArray(item.items)
          ? item.items.map((it: any) => ({
              version: it.version || 'oro_vivo',
              size: it.size || 'M',
              gender: it.gender || 'Unisex',
              quantity: Number(it.quantity || 1),
              serialNumbers: it.serialNumbers || []
            }))
          : [
              {
                version: item.version || 'oro_vivo',
                size: item.size || 'M',
                gender: item.gender || 'Unisex',
                quantity: Number(item.quantity || 1),
                serialNumbers: item.serialNumber ? [item.serialNumber] : []
              }
            ];
        return {
          id: item.id || id,
          fullName: item.fullName || '',
          email: item.email || '',
          phone: item.phone || '',
          address: item.address || '',
          city: item.city || '',
          country: item.country || '',
          version: item.version || 'oro_vivo',
          size: item.size || 'M',
          gender: item.gender || 'Unisex',
          quantity: Number(item.quantity || 1),
          items: parsedItems,
          status: item.status || 'CREATED',
          serialNumber: item.serialNumber || '',
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          isShipped: !!item.isShipped,
          shippedAt: item.shippedAt || '',
          trackingNumber: item.trackingNumber || '',
          carrier: item.carrier || '',
          adminNotes: item.adminNotes || '',
          boldUpdatedAt: item.boldUpdatedAt || '',
          bold_code: item.bold_code || '',
          payment_id: item.payment_id || '',
          payment_method: item.payment_method || '',
          merchant_id: item.merchant_id || '',
          integration: item.integration || '',
          card: item.card || null,
          bold_metadata: item.bold_metadata || null
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to query order by ID from Firebase:', err);
      return null;
    }
  }

  /**
   * Update specific fields of an order manually
   */
  async updateOrderFields(orderId: string, updates: Partial<Order>): Promise<void> {
    if (!this.db) return;
    try {
      const order = await this.getOrderById(orderId);
      if (!order) throw new Error(`Order ${orderId} not found`);

      const mergedOrder = {
        ...order,
        ...updates,
        createdAt: order.createdAt // Keep original Date object
      };

      const orderRef = ref(this.db, `orders/${orderId.toUpperCase()}`);
      await set(orderRef, {
        ...mergedOrder,
        createdAt: mergedOrder.createdAt.toISOString()
      });
    } catch (err) {
      console.error(`Failed to update fields for order ${orderId}:`, err);
      throw err;
    }
  }

  /**
   * Legacy compatibility method
   */
  async getPreOrderById(id: string): Promise<Order | null> {
    return this.getOrderById(id);
  }

}
