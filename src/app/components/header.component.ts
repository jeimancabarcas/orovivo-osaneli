import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { PreOrderService } from '../services/pre-order.service';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <header class="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 py-4 transition-all duration-300">
      <div class="max-w-7xl mx-auto glass-effect rounded-2xl px-6 py-3 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        
        <!-- Brand Logo -->
        <a href="#" class="flex items-center gap-2 group">
          <span class="font-serif text-xl sm:text-2xl font-black tracking-[0.25em] text-white group-hover:text-gold-aged transition-colors duration-300">
            OSANELI
          </span>
          <span class="w-1.5 h-1.5 rounded-full bg-gold-aged group-hover:bg-gold-light transition-colors duration-300"></span>
        </a>

        <!-- Hype Live Status -->
        <div class="hidden md:flex items-center gap-4 text-xs font-sans tracking-widest text-neutral-400">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-aged opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-gold-aged"></span>
            </span>
            <span class="text-white uppercase font-semibold">PREVENTA ACTIVA</span>
          </div>
          <span class="text-neutral-600">|</span>
          <span class="text-gold-aged font-bold">
            {{ 100 - preOrderService.remainingInventory() }}/100 RESERVADOS
          </span>
        </div>

        <!-- Call to Action -->
        <button 
          (click)="scrollToPreOrder()"
          class="px-5 py-2.5 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_20px_rgba(197,168,84,0.25)] cursor-pointer"
        >
          SEPARAR PIEZA
        </button>

      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  protected readonly preOrderService = inject(PreOrderService);

  scrollToPreOrder(): void {
    const el = document.getElementById('preorder-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
