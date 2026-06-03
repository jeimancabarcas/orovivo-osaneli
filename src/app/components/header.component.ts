import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { PreOrderService } from '../services/pre-order.service';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    @if (!isAdminRoute()) {
      <header 
        class="fixed top-0 left-0 w-full z-50 px-4 sm:px-8 transition-all duration-500"
        [class.py-6]="!scrolled()"
        [class.py-3]="scrolled()"
      >
        <div 
          class="max-w-7xl mx-auto rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-500 border border-transparent"
          [class.bg-transparent]="!scrolled()"
          [class.glass-effect]="scrolled()"
          [class.shadow-[0_10px_30px_rgba(0,0,0,0.5)]]="scrolled()"
        >
          
          <!-- Brand Logo -->
          <a href="#" class="flex items-center group">
            <img src="/logo.png" alt="OSANELI" class="h-6 sm:h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105 invert" />
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
              {{ preOrderService.totalLimit - preOrderService.remainingInventory() }}/{{ preOrderService.totalLimit }} RESERVADOS
            </span>
          </div>

          <!-- Call to Action -->
          <button 
            (click)="scrollToPreOrder()"
            class="px-5 py-2.5 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_4px_20px_rgba(197,168,84,0.25)] cursor-pointer gold-btn-effect"
          >
            SEPARAR PIEZA
          </button>

        </div>
      </header>
    }
  `,
  host: {
    '(window:scroll)': 'onWindowScroll()'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit, OnDestroy {
  protected readonly preOrderService = inject(PreOrderService);
  private readonly router = inject(Router);
  protected readonly scrolled = signal(false);
  protected readonly isAdminRoute = signal(false);
  private routerSub?: Subscription;

  ngOnInit(): void {
    this.checkRoute(this.router.url);
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRoute(event.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private checkRoute(url: string): void {
    this.isAdminRoute.set(url.startsWith('/admin'));
  }

  onWindowScroll(): void {
    if (typeof window !== 'undefined') {
      this.scrolled.set(window.scrollY > 20);
    }
  }

  scrollToPreOrder(): void {
    const el = document.getElementById('preorder-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
