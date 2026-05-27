import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseService, Order } from './firebase.service';
import { environment } from '../../environments/environment';
export type { Order } from './firebase.service';
export type { PreOrder } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class PreOrderService {
  private readonly TOTAL_EDITION_LIMIT = environment.dropLimit;
  readonly totalLimit = this.TOTAL_EDITION_LIMIT;
  
  private readonly platformId = inject(PLATFORM_ID);
  private readonly firebaseService = inject(FirebaseService);

  // Derived order list bound directly to the real-time Firebase Database state
  readonly preorders = computed(() => this.firebaseService.orders());

  // Retrieve last submitted order from current user for ticket displaying
  readonly activeTicket = signal<Order | null>(null);

  // Derived initial sync completion state
  readonly isInitialSyncCompleted = computed(() => this.firebaseService.isInitialSyncCompleted());

  constructor() {}

  // Derived stock count (limit 100, decreases with every APPROVED order in real-time database)
  readonly remainingInventory = computed(() => {
    const approvedOrders = this.preorders().filter(po => po.status === 'APPROVED');
    const reservedCount = approvedOrders.reduce((sum, po) => sum + (po.quantity || 1), 0);
    const currentRemaining = this.TOTAL_EDITION_LIMIT - reservedCount;
    return currentRemaining > 0 ? currentRemaining : 0;
  });

  // Derived total sold percentage for visual progress bars
  readonly soldPercentage = computed(() => {
    const remaining = this.remainingInventory();
    return Math.round(((this.TOTAL_EDITION_LIMIT - remaining) / this.TOTAL_EDITION_LIMIT) * 100);
  });

  /**
   * Generates a premium, truly unique order code (e.g. OSN-H8K3X9)
   */
  generateUniqueOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'OSN-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Register a new approved order and persist it to Firebase Realtime Database
   */
  addPreOrder(data: Omit<Order, 'serialNumber' | 'createdAt' | 'status'>): Order {
    const approvedOrders = this.preorders().filter(po => po.status === 'APPROVED');
    const totalPreviousItems = approvedOrders.reduce((sum, po) => sum + (po.quantity || 1), 0);
    const nextIndex = totalPreviousItems + 1; // Real ticket serial starts from 1 based on real orders
    
    // Generate Serial Number (e.g. OSN-ORO-001/100)
    const paddedIndex = String(nextIndex).padStart(3, '0');
    const serialNumber = `OSN-ORO-${paddedIndex}/${this.TOTAL_EDITION_LIMIT}`;
    const createdAtDate = new Date();

    const newOrder: Order = {
      ...data,
      status: 'APPROVED',
      serialNumber,
      createdAt: createdAtDate
    };

    // Persist to Firebase Realtime Database asynchronously
    this.firebaseService.saveOrder(newOrder).catch((err) => {
      console.error('Asynchronous cloud sync failed for order:', err);
    });

    // Set active ticket for display
    this.activeTicket.set(newOrder);

    return newOrder;
  }

  /**
   * Clear active ticket to allow another order
   */
  clearActiveTicket(): void {
    this.activeTicket.set(null);
  }

  /**
   * Save a temporary pending order draft to Firebase Realtime Database
   */
  savePendingOrder(orderId: string, formValue: any): Promise<void> {
    return this.firebaseService.savePendingOrder(orderId, formValue);
  }

  /**
   * Update order status in Firebase Realtime Database
   */
  updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    return this.firebaseService.updateOrderStatus(orderId, status);
  }

  /**
   * Legacy compatibility method
   */
  savePendingPreOrder(orderId: string, formValue: any): Promise<void> {
    return this.savePendingOrder(orderId, formValue);
  }

  /**
   * Query a single order by its unique Order ID from Firebase cloud database
   */
  queryOrder(orderId: string): Promise<Order | null> {
    return this.firebaseService.getOrderById(orderId);
  }

  /**
   * Legacy compatibility method
   */
  queryPreOrder(orderId: string): Promise<Order | null> {
    return this.queryOrder(orderId);
  }
}
