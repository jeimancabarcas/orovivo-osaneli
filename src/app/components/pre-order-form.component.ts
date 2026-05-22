import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PreOrderService, PreOrder } from '../services/pre-order.service';

@Component({
  selector: 'app-pre-order-form',
  imports: [ReactiveFormsModule],
  template: `
    <section id="preorder-section" class="relative py-24 sm:py-32 px-4 sm:px-8 bg-gradient-to-b from-[#0A1721] to-[#111111] overflow-hidden">
      
      <!-- Caribbean Wave Glowing Line -->
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-aged/20 to-transparent"></div>

      <div class="max-w-4xl mx-auto">
        
        <!-- Interactive Countdown and Stock Header -->
        <div class="glass-effect rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6 mb-12 shadow-lg">
          
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
          <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-gold-aged shadow-[0_0_50px_rgba(197,168,84,0.15)] animate-fade-in">
            
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

            <!-- Visual Luxury Ticket -->
            <div class="relative w-full rounded-2xl bg-neutral-900 border border-gold-aged/40 p-6 flex flex-col gap-6 text-left shadow-2xl overflow-hidden">
              
              <!-- Ticket background light beams -->
              <div class="absolute inset-0 bg-radial-gradient from-gold-aged/5 via-transparent to-transparent pointer-events-none"></div>

              <!-- Ticket Header -->
              <div class="flex justify-between items-center border-b border-white/5 pb-4">
                <span class="font-serif font-black tracking-widest text-sm text-white">OSANELI</span>
                <span class="font-mono text-[10px] tracking-widest text-gold-aged font-bold uppercase">
                  DROP 01: ORO VIVO
                </span>
              </div>

              <!-- Ticket Info Grid -->
              <div class="grid grid-cols-2 gap-4 text-xs font-sans">
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-neutral-500 uppercase tracking-wider">PROPIETARIO</span>
                  <span class="text-white font-bold tracking-wide truncate">{{ ticket.fullName }}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-neutral-500 uppercase tracking-wider">EMAIL</span>
                  <span class="text-white font-bold tracking-wide truncate">{{ ticket.email }}</span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-neutral-500 uppercase tracking-wider">VERSIÓN</span>
                  <span class="text-white font-bold tracking-wide">
                    {{ ticket.version === 'oro_vivo' ? 'Oro Vivo (Oro)' : 'Edición Secreta (Negra)' }}
                  </span>
                </div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-[10px] text-neutral-500 uppercase tracking-wider">TALLA (BOXY)</span>
                  <span class="text-gold-aged font-extrabold tracking-widest">{{ ticket.size }}</span>
                </div>
              </div>

              <!-- Holographic Barcode & Serial -->
              <div class="flex flex-col items-center gap-2 pt-4 border-t border-white/5 text-center">
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

            <div class="flex gap-4">
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
          <div class="glass-effect rounded-3xl p-8 sm:p-12 shadow-2xl relative">
            
            <div class="flex flex-col items-center text-center gap-3 mb-10">
              <h3 class="font-serif text-2xl sm:text-3xl font-black text-white">Asegura tu Drop Exclusivo</h3>
              <p class="text-xs sm:text-sm text-neutral-400 max-w-md">
                Ingresa tus datos para registrar tu pre-orden. No se requiere pago inmediato; recibirás un ticket holográfico y las instrucciones para concretar la entrega.
              </p>
            </div>

            <!-- Angular Reactive Form -->
            <form [formGroup]="preOrderForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6 font-sans">
              
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

              <!-- Row 2: Phone and Version -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
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
                    class="px-4 py-3.5 rounded-xl bg-neutral-900 border border-white/10 text-white focus:border-gold-aged focus:outline-none transition-colors duration-300 text-sm cursor-pointer shadow-inner appearance-none"
                  >
                    <option value="oro_vivo">ORO VIVO — Oro Envejecido (Standard)</option>
                    <option value="edicion_secreta">EDICIÓN SECRETA — Negra Completa (Influencer)</option>
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
                      class="w-12 sm:w-16 h-12 rounded-xl border font-bold text-sm tracking-wider cursor-pointer flex items-center justify-center transition-all duration-300 shadow-sm"
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
                <span class="text-[10px] text-neutral-500 italic mt-1">El corte es boxy amplio de diseñador. Te aconsejamos tu talla normal.</span>
              </div>

              <div class="h-[1px] bg-white/5 my-2"></div>

              <!-- Submit button -->
              <button 
                type="submit"
                [disabled]="isSubmitting() || preOrderService.remainingInventory() <= 0"
                class="w-full py-4.5 rounded-xl bg-gold-aged hover:bg-gold-light disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-matte-black font-sans font-extrabold tracking-widest text-sm uppercase transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 shadow-[0_10px_35px_rgba(197,168,84,0.25)] flex justify-center items-center gap-2 cursor-pointer"
              >
                @if (isSubmitting()) {
                  <span class="animate-spin rounded-full h-4 w-4 border-2 border-matte-black border-t-transparent"></span>
                  PROCESANDO MI RESERVA...
                } @else {
                  RESERVAR MI PRE-ORDEN — $280.000 COP
                }
              </button>

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
    size: ['M', [Validators.required]]
  });

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
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
    // 3 days countdown: 72 hours from now
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

  onSubmit(): void {
    if (this.preOrderForm.invalid) {
      // Mark all as touched to trigger validators
      Object.keys(this.preOrderForm.controls).forEach(key => {
        const control = this.preOrderForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    // Simulate luxury streetwear server latency for preordering
    setTimeout(() => {
      const formValue = this.preOrderForm.value;
      
      this.preOrderService.addPreOrder({
        fullName: formValue.fullName || '',
        email: formValue.email || '',
        phone: formValue.phone || '',
        version: (formValue.version as any) || 'oro_vivo',
        size: (formValue.size as any) || 'M'
      });

      this.isSubmitting.set(false);
      this.preOrderForm.reset({
        fullName: '',
        email: '',
        phone: '',
        version: 'oro_vivo',
        size: 'M'
      });
      this.selectedSize.set('M');
    }, 1500);
  }
}
