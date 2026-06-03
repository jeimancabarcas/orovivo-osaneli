import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, get, child, Database } from 'firebase/database';
import { environment } from '../../environments/environment';

export interface Order {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  version: 'oro_vivo' | 'edicion_secreta';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  gender?: string;
  quantity: number;
  status: 'CREATED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'VOIDED' | 'VOID_REJECTED';
  serialNumber?: string;
  createdAt: Date;
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
          parsedList.push({
            id: item.id || key,
            fullName: item.fullName || '',
            email: item.email || '',
            phone: item.phone || '',
            address: item.address || '',
            version: item.version || 'oro_vivo',
            size: item.size || 'M',
            gender: item.gender || 'Unisex',
            quantity: Number(item.quantity || 1),
            status: item.status || 'CREATED',
            serialNumber: item.serialNumber || '',
            createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
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
        version: formValue.version,
        size: formValue.size,
        gender: formValue.gender || 'Unisex',
        quantity: Number(formValue.quantity || 1),
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
        return {
          id: item.id || id,
          fullName: item.fullName || '',
          email: item.email || '',
          phone: item.phone || '',
          address: item.address || '',
          version: item.version || 'oro_vivo',
          size: item.size || 'M',
          quantity: Number(item.quantity || 1),
          status: item.status || 'CREATED',
          serialNumber: item.serialNumber || '',
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date()
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to query order by ID from Firebase:', err);
      return null;
    }
  }

  /**
   * Legacy compatibility method
   */
  async getPreOrderById(id: string): Promise<Order | null> {
    return this.getOrderById(id);
  }

}
