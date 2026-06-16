import { Component, ChangeDetectionStrategy, inject, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HeroComponent } from './hero.component';
import { ShowcaseComponent } from './showcase.component';
import { DetailsComponent } from './details.component';
import { PreOrderFormComponent } from './pre-order-form.component';
import { PreOrderService, Order } from '../services/pre-order.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  imports: [
    HeroComponent,
    ShowcaseComponent,
    DetailsComponent,
    PreOrderFormComponent
  ],
  template: `
    <!-- Cinematic Hero -->
    <app-hero></app-hero>

    <!-- Interactive 3D/Showcase Gallery -->
    <app-showcase></app-showcase>

    <!-- Technical Garment Specifications & Size Guide -->
    <app-details></app-details>

    <!-- Reactive Pre-Order Reservation Form -->
    <app-pre-order-form></app-pre-order-form>

    <!-- Active Created Order Modal Detection -->
    @if (activeCreatedOrder()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/90 backdrop-blur-[6px] animate-reveal">
        <div class="max-w-md w-full bg-[#161616] border-2 border-gold-aged/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(197,168,84,0.15)] flex flex-col gap-6 text-center animate-reveal relative overflow-hidden">
          
          <!-- Absolute Glowing Top line -->
          <div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-aged/50 to-transparent"></div>

          <div class="flex flex-col items-center gap-2">
            <!-- Warning badge gold -->
            <div class="w-12 h-12 rounded-full bg-gold-aged/10 flex items-center justify-center border border-gold-aged/30 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="#C5A854">
                <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
              </svg>
            </div>
            
            <span class="text-[10px] font-sans font-bold tracking-[0.25em] text-gold-aged uppercase mt-2 select-none">
              {{ dropEnded ? 'Pedido Activo Detectado' : 'Reserva Activa Detectada' }}
            </span>
            <h3 class="font-serif text-xl font-black text-white leading-tight">
              ¿Deseas continuar con tu orden de compra pendiente?
            </h3>
            <p class="text-xs text-neutral-400 max-w-xs leading-relaxed">
              {{ dropEnded ? 'Hemos encontrado un pedido iniciado en este navegador. Puedes proceder al pago seguro o cancelarlo para iniciar uno nuevo.' : 'Hemos encontrado una reserva iniciada en este navegador. Puedes proceder al pago seguro o cancelarla para iniciar una nueva.' }}
            </p>
          </div>

          <!-- Glassmorphic Details Summary Box -->
          <div class="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 text-left">
            <div class="flex justify-between items-center text-[11px] pb-2 border-b border-white/5">
              <span class="text-neutral-500 font-sans">Código de Orden</span>
              <span class="text-gold-aged font-mono font-bold tracking-widest bg-white/5 px-2 py-0.5 rounded">
                {{ activeCreatedOrder()?.id }}
              </span>
            </div>
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-neutral-500 font-sans">Pieza</span>
              <span class="text-white font-sans font-semibold">
                {{ activeCreatedOrder()?.version === 'oro_vivo' ? 'Oro Vivo (Oro)' : 'Edición Negra (Negra)' }}
              </span>
            </div>
            <div class="flex justify-between items-center text-[11px]">
              <span class="text-neutral-500 font-sans">Talla / Cantidad</span>
              <span class="text-white font-sans font-bold">
                Talla {{ activeCreatedOrder()?.size }} / {{ activeCreatedOrder()?.quantity }} {{ activeCreatedOrder()?.quantity === 1 ? 'unidad' : 'unidades' }}
              </span>
            </div>
            <div class="flex justify-between items-center text-[11px] pt-2 border-t border-white/5">
              <span class="text-neutral-500 font-sans font-semibold">Valor Total</span>
              <span class="text-gold-aged font-sans font-extrabold text-sm">
                $COP {{ ((activeCreatedOrder()?.quantity || 1) * getPrice()).toLocaleString('es-CO') }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <button 
              (click)="continueReservation()"
              class="w-full py-4 rounded-xl bg-gradient-to-r from-gold-aged to-gold-light hover:brightness-110 text-matte-black font-sans font-extrabold tracking-widest text-xs uppercase cursor-pointer transition-all duration-300 transform active:scale-95 shadow-[0_4px_25px_rgba(197,168,84,0.25)] flex justify-center items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
              Continuar con el Pago
            </button>

            <button 
              (click)="editReservation()"
              class="w-full py-3.5 rounded-xl border border-gold-aged/20 hover:border-gold-aged/50 bg-gold-aged/5 hover:bg-gold-aged/10 text-gold-aged font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex justify-center items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor"><path d="M200-200h57l359-359-57-57-359 359v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
              {{ dropEnded ? 'Modificar datos del pedido' : 'Modificar datos de la reserva' }}
            </button>
            
            <button 
              (click)="cancelReservation()"
              [disabled]="isCancelling()"
              class="w-full py-3.5 rounded-xl border border-white/10 hover:border-red-500/40 bg-white/5 hover:bg-red-500/10 disabled:bg-neutral-800/40 disabled:text-neutral-600 disabled:border-white/5 text-matte-black hover:text-red-400 font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex justify-center items-center gap-2"
            >
              @if (isCancelling()) {
                <div class="w-4 h-4 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin"></div>
                <span>{{ dropEnded ? 'Cancelando pedido...' : 'Cancelando reserva...' }}</span>
              } @else {
                <span class="text-neutral-400 hover:text-red-400">{{ dropEnded ? 'Cancelar pedido y crear uno nuevo' : 'Cancelar reserva y crear nueva' }}</span>
              }
            </button>
          </div>

        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly preOrderService = inject(PreOrderService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  readonly activeCreatedOrder = signal<Order | null>(null);
  readonly isCancelling = signal<boolean>(false);
  readonly getPrice = () => environment.productPrice;
  protected readonly dropEnded = environment.dropEnded;

  ngOnInit(): void {
    this.titleService.setTitle('OSANELI | ORO VIVO - Edición Limitada Streetwear');
    
    const descContent = this.dropEnded 
      ? "No es una camiseta de fútbol. Es una declaración de identidad. Adquiere la camiseta 'ORO VIVO' de Osaneli. Corte boxy, tejido de alta densidad (333g), lujo y herencia colombiana."
      : "No es una camiseta de fútbol. Es una declaración de identidad. Adquiere en preventa exclusiva la camiseta 'ORO VIVO' de Osaneli. Corte boxy, tejido de alta densidad (333g), lujo y herencia colombiana.";

    // Core description
    this.metaService.updateTag({ name: 'description', content: descContent });
    
    // Open Graph / Facebook
    this.metaService.updateTag({ property: 'og:title', content: 'OSANELI | ORO VIVO - Edición Limitada Streetwear' });
    this.metaService.updateTag({ property: 'og:description', content: descContent });
    this.metaService.updateTag({ property: 'og:image', content: 'https://orovivo.osaneli.com/meta-crop-og.png' });
    this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
    this.metaService.updateTag({ property: 'og:image:height', content: '630' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://orovivo.osaneli.com/' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'OSANELI | ORO VIVO - Edición Limitada Streetwear' });
    this.metaService.updateTag({ name: 'twitter:description', content: descContent });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://orovivo.osaneli.com/meta-crop-twitter.png' });

    // Detect active reservation created in this browser
    if (isPlatformBrowser(this.platformId)) {
      const activeOrderId = localStorage.getItem('osn_active_created_order_id');
      if (activeOrderId) {
        this.preOrderService.queryOrder(activeOrderId).then((order) => {
          if (order && order.status === 'CREATED') {
            this.activeCreatedOrder.set(order);
          } else {
            // Clear if order has changed status or doesn't exist
            localStorage.removeItem('osn_active_created_order_id');
          }
        }).catch((err) => {
          console.error('Error querying active order:', err);
        });
      }
    }
  }

  continueReservation(): void {
    const order = this.activeCreatedOrder();
    if (!order) return;
    this.activeCreatedOrder.set(null);
    this.router.navigate(['/order'], { queryParams: { id: order.id } });
  }

  editReservation(): void {
    const order = this.activeCreatedOrder();
    if (!order) return;
    this.activeCreatedOrder.set(null);
    this.router.navigate(['/'], { queryParams: { edit: order.id } });
  }

  cancelReservation(): void {
    const order = this.activeCreatedOrder();
    if (!order) return;

    this.isCancelling.set(true);
    this.preOrderService.updateOrderStatus(order.id, 'VOIDED')
      .then(() => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('osn_active_created_order_id');
        }
        this.activeCreatedOrder.set(null);
      })
      .catch((err) => {
        console.error('Failed to cancel active order:', err);
      })
      .finally(() => {
        this.isCancelling.set(false);
      });
  }
}
