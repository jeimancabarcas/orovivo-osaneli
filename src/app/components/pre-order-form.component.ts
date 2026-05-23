import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { PreOrderService, PreOrder } from '../services/pre-order.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-pre-order-form',
  imports: [ReactiveFormsModule],
  template: `
    <section id="preorder-section" class="relative py-24 sm:py-32 px-4 sm:px-8 bg-gradient-to-b from-[#0A1721] to-[#111111] overflow-hidden">
      
      <!-- Caribbean Wave Glowing Line -->
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-aged/20 to-transparent"></div>

      <div class="max-w-4xl mx-auto">
        
        <!-- Interactive Countdown and Stock Header -->
        <div class="glass-effect rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 mb-12 shadow-lg" data-reveal>
          
          <div class="flex flex-col items-center md:items-start gap-2 w-full md:w-auto">
            <span class="text-xs font-bold text-neutral-400 tracking-widest uppercase">CIERRE DE PREVENTA</span>
            <span class="text-xl sm:text-2xl font-serif font-black text-gold-aged tracking-wider animate-pulse">
              {{ countdownText() }}
            </span>
          </div>

          <div class="w-[2px] h-12 bg-white/5 hidden md:block"></div>

          <!-- Stock level indicator -->
          <div class="flex flex-col gap-2 w-full md:w-1/2">
            <div class="flex justify-between text-xs font-bold text-neutral-400 tracking-wider">
              <span>EDICIÓN LIMITADA: 100 PIEZAS</span>
              <span class="text-gold-aged">{{ preOrderService.remainingInventory() }} UNIDADES RESTANTES</span>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/5 p-0.5">
              <div 
                class="h-full rounded-full bg-gradient-to-r from-gold-aged to-gold-light transition-all duration-1000"
                [style.width]="preOrderService.soldPercentage() + '%'"
              ></div>
            </div>
            <span class="text-[10px] text-neutral-500 italic text-right">Pre-ventas procesadas en tiempo real</span>
          </div>

        </div>

        <!-- Success Ticket Screen or Form Selection -->
        @if (preOrderService.activeTicket(); as ticket) {
          
          <!-- Holographic Premium Ticket -->
          <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-gold-aged/40 shadow-[0_0_50px_rgba(197,168,84,0.15)]">
            
            <div class="w-16 h-16 rounded-full bg-gold-aged/10 flex items-center justify-center border-2 border-gold-aged/50 animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="#C5A854"><path d="m382-354 278-278-56-56-222 222-114-114-56 56 170 170ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-xs font-bold text-gold-aged tracking-[0.2em] uppercase font-sans">RESERVA CONFIRMADA</span>
              <h3 class="font-serif text-2xl sm:text-3xl font-black text-white">¡Eres Dueño del Oro!</h3>
              <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                Tu pieza exclusiva ha sido reservada con éxito. Se te ha asignado el siguiente ticket holográfico serializado de coleccionista.
              </p>
            </div>

            <!-- Visual Luxury Ticket (GSAP Tilt 3D + Hologram Shader) -->
            <div class="perspective-1000 w-full max-w-md mx-auto py-2">
              <div 
                class="ticket-card relative w-full rounded-2xl bg-neutral-900 border border-gold-aged/40 p-6 flex flex-col gap-6 text-left shadow-2xl overflow-hidden cursor-crosshair"
                (mousemove)="onMouseMoveTicket($event)"
                (mouseleave)="onMouseLeaveTicket($event)"
              >
                
                <!-- Ticket holographic glare overlay -->
                <div class="holographic-glare absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-0 transition-opacity duration-300" style="background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(244, 223, 138, 0.25) 0%, rgba(197, 168, 84, 0.15) 30%, rgba(18, 42, 58, 0.3) 60%, rgba(138, 37, 37, 0.2) 100%);"></div>
                <div class="absolute inset-0 bg-radial-gradient from-gold-aged/5 via-transparent to-transparent pointer-events-none"></div>

                <!-- Ticket Header -->
                <div class="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
                  <span class="font-editorial tracking-widest text-base text-gold-aged">OSANELI</span>
                  <span class="font-mono text-[10px] tracking-widest text-neutral-400 font-bold uppercase">
                    DROP 01: ORO VIVO
                  </span>
                </div>

                <!-- Ticket Info Grid -->
                <div class="grid grid-cols-2 gap-4 text-xs font-sans relative z-10">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wider">PROPIETARIO</span>
                    <span class="text-white font-bold font-serif tracking-wide truncate">{{ ticket.fullName }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wider">EMAIL</span>
                    <span class="text-white font-bold tracking-wide truncate">{{ ticket.email }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wider">VERSIÓN</span>
                    <span class="text-white font-bold font-serif tracking-wide">
                      {{ ticket.version === 'oro_vivo' ? 'Oro Vivo (Oro)' : 'Edición Secreta (Negra)' }}
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wider">TALLA (BOXY)</span>
                    <span class="text-gold-aged font-extrabold tracking-widest text-sm">{{ ticket.size }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wider">CANTIDAD</span>
                    <span class="text-white font-bold tracking-widest font-sans">{{ ticket.quantity }} {{ ticket.quantity === 1 ? 'Unidad' : 'Unidades' }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wider">VALOR TOTAL</span>
                    <span class="text-gold-aged font-extrabold tracking-wide font-serif">{{ activeTicketTotalFormatted() }}</span>
                  </div>
                </div>

                <!-- Holographic Barcode & Serial -->
                <div class="flex flex-col items-center gap-2 pt-4 border-t border-white/5 text-center relative z-10">
                  <!-- Mock Barcode using divs -->
                  <div class="flex gap-[2px] h-8 items-center bg-white/10 px-4 py-1.5 rounded opacity-60">
                    <div class="w-[2px] h-full bg-white"></div>
                    <div class="w-[1px] h-full bg-white"></div>
                    <div class="w-[3px] h-full bg-white"></div>
                    <div class="w-[1px] h-full bg-white"></div>
                    <div class="w-[2px] h-full bg-white"></div>
                    <div class="w-[4px] h-full bg-white"></div>
                    <div class="w-[1px] h-full bg-white"></div>
                    <div class="w-[2px] h-full bg-white"></div>
                    <div class="w-[3px] h-full bg-white"></div>
                    <div class="w-[1px] h-full bg-white"></div>
                  </div>
                  <span class="font-mono text-sm font-black text-gold-aged tracking-[0.2em]">
                    {{ ticket.serialNumber }}
                  </span>
                </div>

              </div>
            </div>

            <!-- Successful Payment Confirmation Badge -->
            <div class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-green-500/10 border border-green-500/25 max-w-sm mx-auto text-green-400 font-sans text-xs font-bold tracking-wider select-none mt-2 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor" class="shrink-0"><path d="m382-354 278-278-56-56-222 222-114-114-56 56 170 170ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
              <span>RESERVA CONFIRMADA & PAGADA VIA BOLD</span>
            </div>

            <div class="flex gap-4 mt-2">
              <button 
                (click)="preOrderService.clearActiveTicket()"
                class="px-6 py-3 rounded-xl border border-white/10 hover:border-gold-aged/40 bg-white/5 hover:bg-gold-aged/5 text-white hover:text-gold-aged font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
              >
                RESERVAR OTRA PIEZA
              </button>
            </div>

          </div>

        } @else {
          
          <!-- React Form Section -->
          <div class="glass-effect rounded-3xl p-8 sm:p-12 shadow-2xl relative" data-reveal>
            
            <div class="flex flex-col items-center text-center gap-3 mb-10">
              <h3 class="font-serif text-2xl sm:text-3xl font-black text-white">Asegura tu Drop Exclusivo</h3>
              <p class="text-xs sm:text-sm text-neutral-400 max-w-md">
                Ingresa tus datos para registrar tu pre-orden. No se requiere pago inmediato; recibirás un ticket holográfico y las instrucciones para concretar la entrega.
              </p>
            </div>

            <!-- Angular Reactive Form -->
            <form [formGroup]="preOrderForm" class="flex flex-col gap-6 font-sans">
              
              <!-- Row 1: Name and Email -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <!-- Full name -->
                <div class="flex flex-col gap-2">
                  <label for="fullName" class="text-xs font-bold tracking-widest text-neutral-400 uppercase">Nombre Completo</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    formControlName="fullName"
                    placeholder="Ej: Sebastián Gómez"
                    class="px-4 py-3.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-600 focus:border-gold-aged focus:outline-none transition-colors duration-300 text-sm shadow-inner"
                    [class.border-red-500]="isFieldInvalid('fullName')"
                  />
                  @if (isFieldInvalid('fullName')) {
                    <span class="text-[10px] text-red-400 font-semibold tracking-wide">El nombre es requerido</span>
                  }
                </div>

                <!-- Email -->
                <div class="flex flex-col gap-2">
                  <label for="email" class="text-xs font-bold tracking-widest text-neutral-400 uppercase">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="email" 
                    formControlName="email"
                    placeholder="sebastian@gmail.com"
                    class="px-4 py-3.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-600 focus:border-gold-aged focus:outline-none transition-colors duration-300 text-sm shadow-inner"
                    [class.border-red-500]="isFieldInvalid('email')"
                  />
                  @if (isFieldInvalid('email')) {
                    <span class="text-[10px] text-red-400 font-semibold tracking-wide">Ingresa un correo electrónico válido</span>
                  }
                </div>

              </div>

              <!-- Row 2: Phone, Version and Quantity Selection -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <!-- Phone -->
                <div class="flex flex-col gap-2">
                  <label for="phone" class="text-xs font-bold tracking-widest text-neutral-400 uppercase">Teléfono (WhatsApp)</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    formControlName="phone"
                    placeholder="+57 300 123 4567"
                    class="px-4 py-3.5 rounded-xl bg-neutral-900 border border-white/10 text-white placeholder-neutral-600 focus:border-gold-aged focus:outline-none transition-colors duration-300 text-sm shadow-inner"
                    [class.border-red-500]="isFieldInvalid('phone')"
                  />
                  @if (isFieldInvalid('phone')) {
                    <span class="text-[10px] text-red-400 font-semibold tracking-wide">El teléfono es requerido</span>
                  }
                </div>

                <!-- Version Selection -->
                <div class="flex flex-col gap-2">
                  <label for="version" class="text-xs font-bold tracking-widest text-neutral-400 uppercase">Edición de Camiseta</label>
                  <select 
                    id="version" 
                    formControlName="version"
                    class="px-4 py-3.5 rounded-xl bg-neutral-900 border border-white/10 text-white focus:border-gold-aged focus:outline-none transition-colors duration-300 text-sm cursor-pointer shadow-inner appearance-none font-serif"
                  >
                    <option value="oro_vivo">ORO VIVO — Oro (Standard)</option>
                    <option value="edicion_secreta">EDICIÓN SECRETA — Negra (Influencer)</option>
                  </select>
                </div>

                <!-- Quantity Selection -->
                <div class="flex flex-col gap-2">
                  <label for="quantity" class="text-xs font-bold tracking-widest text-neutral-400 uppercase">Cantidad a Reservar</label>
                  <select 
                    id="quantity" 
                    formControlName="quantity"
                    class="px-4 py-3.5 rounded-xl bg-neutral-900 border border-white/10 text-white focus:border-gold-aged focus:outline-none transition-colors duration-300 text-sm cursor-pointer shadow-inner appearance-none font-serif"
                  >
                    <option value="1">1 Unidad (Sola)</option>
                    <option value="2">2 Unidades (Dúo)</option>
                    <option value="3">3 Unidades (Colección)</option>
                    <option value="4">4 Unidades (Lote)</option>
                    <option value="5">5 Unidades (Límite)</option>
                  </select>
                </div>

              </div>

              <!-- Row 3: Size selection -->
              <div class="flex flex-col gap-3">
                <label class="text-xs font-bold tracking-widest text-neutral-400 uppercase">Selecciona tu Talla (Corte Boxy Streetwear)</label>
                <div class="flex flex-wrap gap-3">
                  @for (sz of ['S', 'M', 'L', 'XL', 'XXL']; track sz) {
                    <button 
                      type="button"
                      (click)="setSize(sz)"
                      class="w-12 sm:w-16 h-12 rounded-xl border font-bold text-sm tracking-wider cursor-pointer flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 shadow-sm"
                      [class.border-gold-aged]="selectedSize() === sz"
                      [class.bg-gold-aged]="selectedSize() === sz"
                      [class.text-matte-black]="selectedSize() === sz"
                      [class.border-white/10]="selectedSize() !== sz"
                      [class.text-neutral-400]="selectedSize() !== sz"
                      [class.hover:text-white]="selectedSize() !== sz"
                      [class.hover:border-white/30]="selectedSize() !== sz"
                    >
                      {{ sz }}
                    </button>
                  }
                </div>
                <span class="text-[10px] text-neutral-500 italic mt-1 font-serif">El corte es boxy amplio de diseñador. Te aconsejamos tu talla normal.</span>
              </div>

              <!-- Disclaimer of payments -->
              <div class="p-4 rounded-xl bg-gold-aged/5 border border-gold-aged/20 flex gap-3 items-start max-w-2xl mx-auto text-left select-none mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="#C5A854" class="mt-0.5 shrink-0"><path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
                <p class="text-[10px] sm:text-xs text-neutral-400 leading-relaxed font-serif">
                  <strong class="text-gold-aged font-sans font-bold uppercase tracking-wider block mb-0.5">Disclaimer de Reserva</strong>
                  La reserva de tu pieza exclusiva se completará y confirmará de forma definitiva **únicamente una vez que el pago correspondiente de tu pre-orden sea procesado con éxito** a través de la pasarela segura de Bold.
                </p>
              </div>

              <div class="h-[1px] bg-white/5 my-2"></div>

              <!-- Bold Button Injection Wrapper or Placeholder -->
              @if (preOrderForm.valid) {
                <div class="w-full flex flex-col items-center gap-3 py-4 px-6 rounded-2xl bg-neutral-955/60 border border-gold-aged/20 max-w-sm mx-auto select-none mt-2 animate-fade-in">
                  <span class="text-[10px] font-sans font-semibold tracking-[0.2em] text-gold-aged uppercase flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    Datos Completados — Pagar con Bold
                  </span>
                  
                  <div id="bold-pay-container" class="w-full min-h-[50px] flex flex-col items-center justify-center gap-2">
                    <div class="animate-pulse flex items-center gap-2 text-xs text-neutral-500 font-sans">
                      <span class="w-2.5 h-2.5 rounded-full bg-gold-aged animate-ping"></span>
                      Inyectando pasarela Bold...
                    </div>
                  </div>

                  <button 
                    type="button"
                    (click)="simulateApprovedPayment()"
                    class="text-[10px] font-sans text-neutral-500 hover:text-gold-aged transition-colors duration-300 underline cursor-pointer mt-1"
                  >
                    Simular Pago Aprobado (Modo Demo)
                  </button>
                </div>
              } @else {
                <button 
                  type="button"
                  (click)="markFormAsTouched()"
                  class="w-full py-4.5 rounded-xl bg-neutral-800 text-neutral-500 font-sans font-extrabold tracking-widest text-sm uppercase cursor-pointer flex justify-center items-center gap-2"
                >
                  {{ placeholderButtonText() }}
                </button>
              }

            </form>

          </div>

        }

      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreOrderFormComponent implements OnInit, OnDestroy {
  protected readonly preOrderService = inject(PreOrderService);
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);

  // Countdown timer signals
  readonly countdownText = signal<string>('3d 00h 00m 00s');
  private timerIntervalId: any = null;

  // Form signals
  readonly isSubmitting = signal<boolean>(false);
  readonly selectedSize = signal<string>('M');

  // Build the react form
  readonly preOrderForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    version: ['oro_vivo', [Validators.required]],
    size: ['M', [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(5)]]
  });

  readonly totalAmountFormatted = computed(() => {
    const qty = Number(this.preOrderForm.get('quantity')?.value || 1);
    const total = qty * 280000;
    return total.toLocaleString('es-CO');
  });

  readonly submitButtonText = computed(() => {
    return `RESERVAR MI PRE-ORDEN — $${this.totalAmountFormatted()} COP`;
  });

  readonly placeholderButtonText = computed(() => {
    return `Completar datos para pagar — $${this.totalAmountFormatted()} COP`;
  });

  readonly activeTicketTotalFormatted = computed(() => {
    const ticket = this.preOrderService.activeTicket();
    if (!ticket) return '';
    const total = ticket.quantity * 280000;
    return `$${total.toLocaleString('es-CO')} COP`;
  });

  ngOnInit(): void {
    this.startCountdown();
    this.checkPaymentRedirect();
    
    // Listen to form changes to update the Bold button and store pending data
    this.preOrderForm.valueChanges.subscribe(() => {
      this.onFormChanged();
    });
  }

  ngOnDestroy(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
    }
    if (this.formChangeTimeoutId) {
      clearTimeout(this.formChangeTimeoutId);
    }
  }

  setSize(size: string): void {
    this.selectedSize.set(size);
    this.preOrderForm.patchValue({ size });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.preOrderForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private startCountdown(): void {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        this.countdownText.set('DROP CONCLUIDO');
        if (this.timerIntervalId) clearInterval(this.timerIntervalId);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      this.countdownText.set(
        `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateTimer();
    this.timerIntervalId = setInterval(updateTimer, 1000);
  }

  // Confirmed ticket GSAP 3D Interactive Tilt & Shimmer
  onMouseMoveTicket(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const card = event.currentTarget as HTMLElement;
    const bounds = card.getBoundingClientRect();
    const mouseX = event.clientX - bounds.left;
    const mouseY = event.clientY - bounds.top;
    
    // Normalize coordinates: -0.5 to 0.5
    const xPct = (mouseX / bounds.width) - 0.5;
    const yPct = (mouseY / bounds.height) - 0.5;
    
    // Rotate physically in 3D
    gsap.to(card, {
      rotateY: xPct * 22, // max 22deg tilt
      rotateX: -yPct * 22,
      scale: 1.025,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });
    
    // Smoothly reveal and position dynamic glare spotlight
    const glare = card.querySelector('.holographic-glare') as HTMLElement;
    if (glare) {
      gsap.to(glare, {
        opacity: 0.65,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      
      const xPercent = (mouseX / bounds.width) * 100;
      const yPercent = (mouseY / bounds.height) * 100;
      card.style.setProperty('--mx', `${xPercent}%`);
      card.style.setProperty('--my', `${yPercent}%`);
    }
  }

  onMouseLeaveTicket(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const card = event.currentTarget as HTMLElement;
    
    // Elastic spring back to center
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 1.1,
      ease: 'elastic.out(1, 0.6)',
      overwrite: 'auto'
    });
    
    const glare = card.querySelector('.holographic-glare') as HTMLElement;
    if (glare) {
      gsap.to(glare, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }
  }

  // Active form monitoring and automatic Bold button injection
  private formChangeTimeoutId: any = null;

  onFormChanged(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.preOrderForm.valid) {
      const formValue = this.preOrderForm.value;
      localStorage.setItem('osaneli_pending_preorder', JSON.stringify(formValue));
      
      if (this.formChangeTimeoutId) {
        clearTimeout(this.formChangeTimeoutId);
      }
      
      this.formChangeTimeoutId = setTimeout(() => {
        this.injectFormBoldButton();
      }, 400);
    } else {
      localStorage.removeItem('osaneli_pending_preorder');
    }
  }

  async injectFormBoldButton(retries = 8): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    
    let libScript = document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]') as HTMLScriptElement;
    if (!libScript) {
      libScript = document.createElement('script');
      libScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      document.head.appendChild(libScript);
    }
    
    const tryInject = async () => {
      const container = document.getElementById('bold-pay-container');
      if (!container) {
        if (retries > 0) {
          setTimeout(tryInject, 100);
          retries--;
        }
        return;
      }
      
      container.innerHTML = '';
      
      const formValue = this.preOrderForm.value;
      const qty = Number(formValue.quantity || 1);
      const totalAmount = 280000 * qty;
      
      const btnScript = document.createElement('script');
      btnScript.setAttribute('data-bold-button', 'dark-L');
      btnScript.setAttribute('data-api-key', 'zLDLlEmrn3wSGbG-u6VojBWXnMfJyZtRICAutPNDCF0');
      btnScript.setAttribute('data-description', `Camiseta Osaneli Oro Vivo - ${qty}x Talla ${formValue.size} (${formValue.version === 'oro_vivo' ? 'Oro' : 'Negra'})`);
      btnScript.setAttribute('data-amount', totalAmount.toString());
      btnScript.setAttribute('data-currency', 'COP');
      
      const timestamp = Date.now();
      const orderId = `OSN-PEND-${qty}-${timestamp}`;
      btnScript.setAttribute('data-order-id', orderId);
      
      const demoSecret = 'W97RSxbKflrCj4bJ7RC3Ig';
      const integrityString = `${orderId}${totalAmount}COP${demoSecret}`;
      const signature = await this.generateSHA256(integrityString);
      btnScript.setAttribute('data-integrity-signature', signature);
      
      const customerObj = {
        email: formValue.email || '',
        fullName: formValue.fullName || '',
        phone: formValue.phone || '',
        dialCode: '+57',
        documentType: 'CC'
      };
      btnScript.setAttribute('data-customer-data', JSON.stringify(customerObj));
      
      btnScript.setAttribute('data-render-mode', 'embedded');
      
      // Enforce secure HTTPS redirection URL and keep it query-free (Bold automatically appends transaction parameters)
      const redirectUrl = 'https://osaneli.com/payment-redirect';
      btnScript.setAttribute('data-redirection-url', redirectUrl);
      btnScript.setAttribute('data-origin-url', window.location.href);
      
      btnScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      container.appendChild(btnScript);
    };
    
    setTimeout(tryInject, 100);
  }

  checkPaymentRedirect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const txStatus = urlParams.get('bold-tx-status');
    const orderId = urlParams.get('bold-order-id');
    
    if (txStatus === 'approved' && orderId) {
      const pendingData = localStorage.getItem('osaneli_pending_preorder');
      if (pendingData) {
        try {
          const parsed = JSON.parse(pendingData);
          
          const officialPreOrder = this.preOrderService.addPreOrder({
            fullName: parsed.fullName,
            email: parsed.email,
            phone: parsed.phone,
            version: parsed.version,
            size: parsed.size,
            quantity: Number(parsed.quantity || 1)
          });
          
          localStorage.removeItem('osaneli_pending_preorder');
          
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          
          setTimeout(() => {
            gsap.fromTo('.ticket-card', 
              { opacity: 0, scale: 0.82, rotateX: -35, rotateY: 18 },
              { opacity: 1, scale: 1, rotateX: 0, rotateY: 0, duration: 1.3, ease: 'back.out(1.35)' }
            );
          }, 50);
        } catch (e) {
          console.error('Error processing approved payment redirect', e);
        }
      }
    }
  }

  simulateApprovedPayment(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const pendingData = localStorage.getItem('osaneli_pending_preorder');
    if (pendingData) {
      try {
        const parsed = JSON.parse(pendingData);
        
        this.preOrderService.addPreOrder({
          fullName: parsed.fullName,
          email: parsed.email,
          phone: parsed.phone,
          version: parsed.version,
          size: parsed.size,
          quantity: Number(parsed.quantity || 1)
        });
        
        localStorage.removeItem('osaneli_pending_preorder');
        
        this.preOrderForm.reset({
          fullName: '',
          email: '',
          phone: '',
          version: 'oro_vivo',
          size: 'M',
          quantity: 1
        });
        this.selectedSize.set('M');
        
        setTimeout(() => {
          gsap.fromTo('.ticket-card', 
            { opacity: 0, scale: 0.82, rotateX: -35, rotateY: 18 },
            { opacity: 1, scale: 1, rotateX: 0, rotateY: 0, duration: 1.3, ease: 'back.out(1.35)' }
          );
        }, 50);
      } catch (e) {
        console.error('Error simulating approved payment', e);
      }
    }
  }

  markFormAsTouched(): void {
    Object.keys(this.preOrderForm.controls).forEach(key => {
      const control = this.preOrderForm.get(key);
      control?.markAsTouched();
    });
  }

  private async generateSHA256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
