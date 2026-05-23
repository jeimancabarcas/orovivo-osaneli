import { Injectable, signal, computed, effect } from '@angular/core';

export interface PreOrder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  version: 'oro_vivo' | 'edicion_secreta';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
  serialNumber: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PreOrderService {
  private readonly STORAGE_KEY = 'osaneli_oro_vivo_preorders';
  private readonly TOTAL_EDITION_LIMIT = 100;
  
  // Base preorders signal
  private readonly preordersList = signal<PreOrder[]>([]);

  constructor() {
    this.loadFromStorage();
  }

  // Loaded preorders
  readonly preorders = computed(() => this.preordersList());

  // Derived stock count (limit 100, starts at 47 remaining for realism, decreases with every new order)
  readonly remainingInventory = computed(() => {
    const reservedCount = this.preordersList().reduce((sum, po) => sum + (po.quantity || 1), 0);
    // We start with 53 sold to make it look like active drop (47 remaining)
    const initialSold = 53;
    const currentRemaining = this.TOTAL_EDITION_LIMIT - (initialSold + reservedCount);
    return currentRemaining > 0 ? currentRemaining : 0;
  });

  // Derived total sold percentage for visual progress bars
  readonly soldPercentage = computed(() => {
    const remaining = this.remainingInventory();
    return Math.round(((this.TOTAL_EDITION_LIMIT - remaining) / this.TOTAL_EDITION_LIMIT) * 100);
  });

  // Retrieve last submitted preorder from current user for ticket displaying
  readonly activeTicket = signal<PreOrder | null>(null);

  /**
   * Load initial data from localStorage
   */
  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        try {
          const parsed = JSON.parse(data) as PreOrder[];
          this.preordersList.set(parsed);
          
          // If there is an active local ticket, set it
          const lastPreOrder = parsed[parsed.length - 1];
          if (lastPreOrder) {
            this.activeTicket.set(lastPreOrder);
          }
        } catch (e) {
          console.error('Error parsing preorders from storage', e);
        }
      }
    }
  }

  /**
   * Register a new pre-order and return it with a unique serial number
   */
  addPreOrder(data: Omit<PreOrder, 'id' | 'serialNumber' | 'createdAt'>): PreOrder {
    const currentPreorders = this.preordersList();
    const totalPreviousItems = currentPreorders.reduce((sum, po) => sum + (po.quantity || 1), 0);
    const nextIndex = 53 + totalPreviousItems + 1; // Real ticket serial starts from 54
    
    // Generate Serial Number (e.g. OSN-ORO-054/100)
    const paddedIndex = String(nextIndex).padStart(3, '0');
    const serialNumber = `OSN-ORO-${paddedIndex}/100`;

    const newPreOrder: PreOrder = {
      ...data,
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      serialNumber,
      createdAt: new Date()
    };

    // Update list using signal set/update
    const updatedList = [...currentPreorders, newPreOrder];
    this.preordersList.set(updatedList);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList));
    }

    // Set active ticket for display
    this.activeTicket.set(newPreOrder);

    return newPreOrder;
  }

  /**
   * Clear active ticket to allow another preorder
   */
  clearActiveTicket(): void {
    this.activeTicket.set(null);
  }
}
