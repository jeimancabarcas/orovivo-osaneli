import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PreOrderService, Order } from '../services/pre-order.service';
import { environment } from '../../environments/environment';
import { gsap } from 'gsap';

@Component({
  selector: 'app-order-landing',
  imports: [FormsModule],
  template: `
    <section class="relative min-h-[90vh] py-24 sm:py-32 px-4 sm:px-8 bg-gradient-to-b from-[#0A1721] to-[#111111] overflow-hidden flex items-center justify-center">
      
      <!-- Ambient Lights and Waves -->
      <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-aged/20 to-transparent"></div>
      <div class="absolute top-[20%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-gold-aged/5 rounded-full blur-[100px] sm:blur-[160px] pointer-events-none select-none"></div>
      <div class="absolute bottom-[10%] right-[-10%] w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-gold-aged/5 rounded-full blur-[90px] sm:blur-[140px] pointer-events-none select-none"></div>

      <div class="max-w-4xl mx-auto w-full relative z-10">
        
        <!-- CASE 1: Loading State -->
        @if (isLoading()) {
          <div class="glass-effect rounded-3xl p-12 text-center flex flex-col items-center gap-4 max-w-md mx-auto shadow-lg">
            <div class="w-12 h-12 border-2 border-gold-aged border-t-transparent rounded-full animate-spin"></div>
            <span class="text-xs font-bold text-neutral-400 tracking-widest uppercase">Cargando pedido...</span>
          </div>
        } 
        
        <!-- CASE 2: Order Not Specified / Search Form -->
        @else if (!activeOrder()) {
          <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border border-white/5 shadow-2xl" data-reveal>
            <div class="w-12 h-12 rounded-full bg-gold-aged/10 flex items-center justify-center border border-gold-aged/30">
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#C5A854"><path d="M784-120 532-372q-30 24-74 38t-90 14q-117 0-198.5-81.5T88-600q0-117 81.5-198.5T368-880q117 0 198.5 81.5T648-600q0 46-14 90t-38 74l252 252-64 64ZM368-292q75 0 127.5-52.5T548-472q0-75-52.5-127.5T368-652q-75 0-127.5 52.5T188-472q0 75 52.5 127.5T368-292Z"/></svg>
            </div>
            
            <div class="flex flex-col gap-2">
              <span class="text-[10px] font-bold text-gold-aged tracking-[0.2em] uppercase">CONSULTA TU PEDIDO</span>
              <h2 class="font-serif text-2xl sm:text-3xl font-black text-white">Ingresa tu Código de Reserva</h2>
              <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                Introduce el código único de 6 caracteres que se te asignó al iniciar tu preventa para revisar su estado o proceder con el pago de Bold.
              </p>
            </div>

            <!-- Lookup Field Container -->
            <div class="w-full flex flex-col gap-3 mt-4">
              <div class="relative w-full">
                <input 
                  type="text" 
                  [value]="searchQuery()"
                  (input)="onSearchInput($event)"
                  placeholder="Ejem: OSN-XXXXXX"
                  class="w-full py-4.5 px-6 rounded-xl bg-matte-black/60 border border-white/10 text-white font-mono text-center text-sm tracking-widest focus:outline-none focus:border-gold-aged/50 transition-all duration-300"
                  maxlength="10"
                />
              </div>
              
              @if (searchError()) {
                <span class="text-xs text-red-400 font-semibold tracking-wide block max-w-sm mx-auto leading-relaxed animate-pulse">
                  {{ searchError() }}
                </span>
              }

              <button 
                (click)="executeSearch()"
                [disabled]="searchLoading() || !searchQuery()"
                class="w-full py-4 rounded-xl bg-gold-aged hover:bg-gold-light disabled:bg-neutral-800 text-matte-black disabled:text-neutral-500 font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(197,168,84,0.15)] disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                @if (searchLoading()) {
                  <div class="w-4 h-4 border-2 border-matte-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Buscando...</span>
                } @else {
                  <span>Consultar Pedido</span>
                }
              </button>
            </div>

            <button 
              (click)="goToHome()"
              class="text-xs text-neutral-500 font-bold font-sans tracking-wide hover:text-gold-aged uppercase transition-colors duration-300 cursor-pointer mt-2"
            >
              ← Regresar al Inicio
            </button>
          </div>
        } 
        
        <!-- CASE 3: Active Order Dashboard -->
        @else if (activeOrder(); as order) {
          
          <!-- STATE A: APPROVED (Luxury Holographic Ticket) -->
          @if (order.status === 'APPROVED') {
            <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-gold-aged/40 shadow-[0_0_50px_rgba(197,168,84,0.15)]" data-reveal>
              
              <div class="w-16 h-16 rounded-full bg-gold-aged/10 flex items-center justify-center border-2 border-gold-aged/50 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="#C5A854"><path d="m382-354 278-278-56-56-222 222-114-114-56 56 170 170ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>
              </div>

              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-gold-aged tracking-[0.2em] uppercase font-sans">RESERVA CONFIRMADA</span>
                <h3 class="font-serif text-2xl sm:text-3xl font-black text-white">¡Eres Dueño del Oro!</h3>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                  Tu pieza exclusiva está reservada con éxito. Tu pago ha sido liquidado correctamente. A continuación tienes tu ticket holográfico serializado.
                </p>
              </div>

              <!-- Ticket Visual Layout -->
              <div class="perspective-1000 w-full max-w-md mx-auto py-2">
                <div 
                  class="ticket-card relative w-full rounded-2xl bg-neutral-900 border border-gold-aged/40 p-6 flex flex-col gap-6 text-left shadow-2xl overflow-hidden cursor-crosshair"
                  (mousemove)="onMouseMoveTicket($event)"
                  (mouseleave)="onMouseLeaveTicket($event)"
                >
                  <div class="holographic-glare absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-0 transition-opacity duration-300" style="background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(244, 223, 138, 0.25) 0%, rgba(197, 168, 84, 0.15) 30%, rgba(18, 42, 58, 0.3) 60%, rgba(138, 37, 37, 0.2) 100%);"></div>
                  <div class="absolute inset-0 bg-radial-gradient from-gold-aged/5 via-transparent to-transparent pointer-events-none"></div>

                  <!-- Header -->
                  <div class="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
                    <span class="font-editorial tracking-widest text-base text-gold-aged">OSANELI</span>
                    <span class="font-mono text-[10px] tracking-widest text-neutral-400 font-bold uppercase">
                      DROP 01: ORO VIVO
                    </span>
                  </div>

                  <!-- Info Grid -->
                  <div class="grid grid-cols-2 gap-4 text-xs font-sans relative z-10">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[10px] text-neutral-500 uppercase tracking-wider">PROPIETARIO</span>
                      <span class="text-white font-bold font-serif tracking-wide truncate">{{ order.fullName }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[10px] text-neutral-500 uppercase tracking-wider">EMAIL</span>
                      <span class="text-white font-bold tracking-wide truncate">{{ order.email }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[10px] text-neutral-500 uppercase tracking-wider">VERSIÓN</span>
                      <span class="text-white font-bold font-serif tracking-wide">
                        {{ order.version === 'oro_vivo' ? 'Oro Vivo (Oro)' : 'Edición Secreta (Negra)' }}
                      </span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[10px] text-neutral-500 uppercase tracking-wider">TALLA (BOXY)</span>
                      <span class="text-gold-aged font-extrabold tracking-widest text-sm">{{ order.size }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[10px] text-neutral-500 uppercase tracking-wider">CANTIDAD</span>
                      <span class="text-white font-bold tracking-widest font-sans">{{ order.quantity }} {{ order.quantity === 1 ? 'Unidad' : 'Unidades' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[10px] text-neutral-500 uppercase tracking-wider">VALOR TOTAL</span>
                      <span class="text-gold-aged font-extrabold tracking-wide font-serif">{{ totalAmountFormatted() }}</span>
                    </div>
                  </div>

                  <!-- Barcode & Serial -->
                  <div class="flex flex-col items-center gap-2 pt-4 border-t border-white/5 text-center relative z-10">
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
                      {{ order.serialNumber || 'PENDIENTE DE ASIGNAR' }}
                    </span>
                  </div>

                </div>
              </div>

              <!-- Payment confirmation badge -->
              <div class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-green-500/10 border border-green-500/25 max-w-sm mx-auto text-green-400 font-sans text-xs font-bold tracking-wider select-none mt-2">
                <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor" class="shrink-0"><path d="m382-354 278-278-56-56-222 222-114-114-56 56 170 170ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
                <span>COMPROBANTE PAGADO VIA BOLD</span>
              </div>

              <div class="flex gap-4 mt-2">
                <button 
                  (click)="clearActive()"
                  class="px-6 py-3 rounded-xl border border-white/10 hover:border-gold-aged/40 bg-white/5 hover:bg-gold-aged/5 text-white hover:text-gold-aged font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                >
                  Consultar Otro Código
                </button>
                <button 
                  (click)="goToHome()"
                  class="px-6 py-3 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                >
                  Volver a Tienda
                </button>
              </div>
            </div>
          }
          
          <!-- STATE B: PENDING (Start Payment & Summary Card) -->
          @else if (order.status === 'PENDING' || (order.status === 'REJECTED' && isRetrying())) {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full max-w-4xl" data-reveal>
              
              <!-- Left Column: Order Summary -->
              <div class="glass-effect rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col gap-6">
                <div>
                  <span class="text-[10px] font-bold text-gold-aged tracking-[0.2em] uppercase">RESUMEN DE RESERVA</span>
                  <h3 class="font-serif text-2xl font-black text-white mt-1">Tu Camiseta Coleccionista</h3>
                </div>

                <div class="flex flex-col gap-4 border-b border-white/5 pb-5">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-neutral-400 font-sans">Producto</span>
                    <span class="text-white font-serif font-bold">Camiseta Osaneli "ORO VIVO"</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-neutral-400 font-sans">Edición</span>
                    <span class="text-white font-sans font-semibold">
                      {{ order.version === 'oro_vivo' ? 'Oro Vivo (Oro)' : 'Edición Secreta (Negra)' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-neutral-400 font-sans">Talla Asignada</span>
                    <span class="text-gold-aged font-extrabold text-sm tracking-wider">{{ order.size }}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-neutral-400 font-sans">Cantidad</span>
                    <span class="text-white font-sans font-bold">{{ order.quantity }} {{ order.quantity === 1 ? 'unidad' : 'unidades' }}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-neutral-400 font-sans">Código de Orden</span>
                    <span class="text-gold-aged font-mono font-bold tracking-widest bg-white/5 px-2.5 py-1 rounded">{{ order.id }}</span>
                  </div>
                </div>

                <div class="flex justify-between items-center border-b border-white/5 pb-5">
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wide">COMPRADOR</span>
                    <span class="text-xs text-white font-bold truncate max-w-[180px]">{{ order.fullName }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5 text-right">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wide">VALOR TOTAL</span>
                    <span class="text-base text-gold-aged font-editorial font-bold tracking-wide">{{ totalAmountFormatted() }}</span>
                  </div>
                </div>

                <div class="rounded-xl bg-gold-aged/5 border border-gold-aged/20 p-4 text-[10px] sm:text-xs text-neutral-400 leading-relaxed">
                  <strong class="text-gold-aged font-sans uppercase tracking-wider block mb-1">Pasarela Segura</strong>
                  Para completar tu reserva, presiona el botón de pago seguro de Bold a la derecha. Tu pieza se garantizará con número de serie tan pronto se confirme la venta.
                </div>

                <div class="flex justify-between items-center text-[10px] text-neutral-500 pt-1">
                  <button (click)="clearActive()" class="hover:text-gold-aged transition-colors duration-200">← Consultar otro código</button>
                  <button (click)="goToHome()" class="hover:text-gold-aged transition-colors duration-200">Volver a Tienda</button>
                </div>
              </div>

              <!-- Right Column: Bold payment Button -->
              <div class="glass-effect rounded-3xl p-6 sm:p-8 border border-gold-aged/20 shadow-[0_0_40px_rgba(197,168,84,0.06)] flex flex-col gap-6 text-center items-center justify-center min-h-[300px]">
                
                <div class="flex flex-col gap-1 items-center">
                  <span class="text-[10px] font-sans font-semibold tracking-[0.2em] text-gold-aged uppercase flex items-center gap-1.5 select-none animate-pulse">
                    <span class="w-1.5 h-1.5 rounded-full bg-gold-aged"></span>
                    Caja de Pago Seguro Bold
                  </span>
                  <p class="text-[11px] text-neutral-500 leading-relaxed max-w-xs">
                    Transacción cifrada y procesada por Bold. Acepta tarjetas, PSE, y más medios de pago.
                  </p>
                </div>

                <!-- Bold Button Container -->
                <div id="bold-pay-container" class="w-full min-h-[50px] flex flex-col items-center justify-center gap-2">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-5 h-5 border-2 border-gold-aged border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-[10px] text-neutral-400 uppercase tracking-widest font-sans font-bold">Inyectando pasarela Bold...</span>
                  </div>
                </div>

                <div class="w-full border-t border-white/5 pt-4 flex flex-col gap-3">
                  <span class="text-[9px] text-neutral-500 uppercase tracking-widest block select-none">¿Pruebas internas en desarrollo?</span>
                  
                  <button 
                    (click)="simulateApprovedPaymentOnLanding()"
                    class="w-full py-3.5 rounded-xl border border-gold-aged/30 hover:border-gold-aged/70 bg-gold-aged/5 hover:bg-gold-aged/10 text-gold-aged font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                    Simular Pago Aprobado (Demo)
                  </button>
                </div>
              </div>
              
            </div>
          }
          
          <!-- STATE C: REJECTED (Failed/Retry Block) -->
          @else if (order.status === 'REJECTED') {
            <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.06)]" data-reveal>
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/30 text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="currentColor"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
              </div>

              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-red-400 tracking-[0.2em] uppercase font-sans">TRANSACCIÓN RECHAZADA</span>
                <h3 class="font-serif text-2xl sm:text-3xl font-black text-white">Pago No Procesado</h3>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                  La pasarela de pagos Bold reportó que la transacción fue denegada o cancelada. Tu reserva no se ha serializado aún.
                </p>
              </div>

              <div class="w-full rounded-2xl bg-white/5 border border-white/10 p-5 text-left text-xs flex flex-col gap-3 font-sans">
                <div class="flex justify-between items-center">
                  <span class="text-neutral-400">Orden Asocida</span>
                  <span class="text-white font-mono font-bold">{{ order.id }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-400">Comprador</span>
                  <span class="text-white font-bold">{{ order.fullName }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-400">Monto Total</span>
                  <span class="text-gold-aged font-bold">{{ totalAmountFormatted() }}</span>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button 
                  (click)="retryPayment()"
                  class="px-6 py-3.5 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer w-full sm:w-auto"
                >
                  Volver a Intentar Pago
                </button>
                <button 
                  (click)="clearActive()"
                  class="px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10 font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer w-full sm:w-auto"
                >
                  Consultar otro código
                </button>
              </div>
            </div>
          }
          
          <!-- STATE D: VOIDED (Refunded/Cancelled) -->
          @else if (order.status === 'VOIDED') {
            <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-neutral-500/20 shadow-2xl" data-reveal>
              <div class="w-16 h-16 rounded-full bg-neutral-500/10 flex items-center justify-center border-2 border-neutral-500/30 text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="currentColor"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm-80-440h160v-80H400v80Zm0 240h160v-80H400v80Z"/></svg>
              </div>

              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-neutral-400 tracking-[0.2em] uppercase font-sans">RESERVA ANULADA</span>
                <h3 class="font-serif text-2xl sm:text-3xl font-black text-white">Transacción Anulada</h3>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto">
                  Este pedido fue anulado o reembolsado a través del webhook de anulación de Bold. El ticket de preventa ya no tiene validez.
                </p>
              </div>

              <div class="flex gap-4">
                <button 
                  (click)="clearActive()"
                  class="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                >
                  Consultar otro código
                </button>
                <button 
                  (click)="goToHome()"
                  class="px-6 py-3 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                >
                  Volver a Tienda
                </button>
              </div>
            </div>
          }
        }
      </div>
    </section>
  `,
  styleUrl: '../app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderLandingComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly preOrderService = inject(PreOrderService);

  // States
  readonly orderIdQuery = signal<string | null>(null);

  // Computes the active order reactively in real-time from the synced preorders list
  readonly activeOrder = computed(() => {
    const queryId = this.orderIdQuery();
    if (!queryId) return null;
    
    // Check if the order is inside the real-time synchronized list
    return this.preOrderService.preorders().find(o => o.id === queryId) || null;
  });

  // Loading state reactively computed to prevent hydration mismatch and async wait blocks
  readonly isLoading = computed(() => {
    const queryId = this.orderIdQuery();
    if (!queryId) return false; // Show search box immediately if no order is requested
    
    // We are loading if sync hasn't completed yet
    if (!this.preOrderService.isInitialSyncCompleted()) return true;
    
    return false;
  });
  
  // Search parameters
  readonly searchQuery = signal<string>('');
  readonly searchLoading = signal<boolean>(false);
  
  // Local error warnings for imperative flows (e.g. network failure)
  readonly localSearchError = signal<string>('');
  
  // Local state to track if user has requested to retry a payment for a REJECTED order
  readonly isRetrying = signal<boolean>(false);
  
  // Computed warning if query ID is loaded but not present in Firebase or local error is set
  readonly searchError = computed(() => {
    const local = this.localSearchError();
    if (local) return local;

    const queryId = this.orderIdQuery();
    if (!queryId) return '';
    if (this.preOrderService.isInitialSyncCompleted() && !this.activeOrder()) {
      return 'No se encontró ningún pedido con el código especificado. Verifica el código e intenta nuevamente.';
    }
    return '';
  });

  private queryParamsSubscription: any = null;

  // Side-effect to clean URL parameters and trigger GSAP entry animations reactively
  private readonly ticketAnimationEffect = effect(() => {
    if (!isPlatformBrowser(this.platformId)) return;
    const order = this.activeOrder();
    
    if (order && order.status === 'APPROVED') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('bold-tx-status') === 'approved') {
        this.cleanUrlParams();
        setTimeout(() => {
          gsap.fromTo('.ticket-card', 
            { opacity: 0, scale: 0.82, rotateX: -35, rotateY: 18 },
            { opacity: 1, scale: 1, rotateX: 0, rotateY: 0, duration: 1.3, ease: 'back.out(1.35)' }
          );
        }, 50);
      }
    }
  });

  // Automatically trigger Bold injection when active order is PENDING or REJECTED and retrying
  private readonly boldInjectorEffect = effect(() => {
    if (!isPlatformBrowser(this.platformId)) return;
    const order = this.activeOrder();
    const retrying = this.isRetrying();
    
    if (order && (order.status === 'PENDING' || (order.status === 'REJECTED' && retrying))) {
      setTimeout(() => {
        this.injectBoldButtonOnLanding(order);
      }, 300);
    }
  });

  // Side-effect to automatically animate data-reveal elements whenever the page view state changes
  private readonly revealAnimationEffect = effect(() => {
    // Read activeOrder, isLoading, and isRetrying to react to view state transitions
    this.activeOrder();
    this.isLoading();
    this.isRetrying();
    
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Trigger GSAP reveal for newly rendered data-reveal elements
    setTimeout(() => {
      const reveals = document.querySelectorAll('[data-reveal]');
      reveals.forEach(el => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    }, 100); // Wait 100ms to allow route navigation and Angular change detection to fully settle the DOM
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.queryParamsSubscription = this.route.queryParams.subscribe((params) => {
        const orderId = params['id'] || params['bold-order-id'];
        this.orderIdQuery.set(orderId ? orderId.toUpperCase() : null);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  clearActive(): void {
    // We do NOT set orderIdQuery to null here to prevent race conditions during async navigation.
    // Instead, we let the router queryParams subscription reactively handle clearing the ID after navigation finishes.
    this.searchQuery.set('');
    this.localSearchError.set('');
    this.isRetrying.set(false);
    this.router.navigate(['/order']);
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value.trim().toUpperCase());
    this.localSearchError.set('');
  }

  async executeSearch(): Promise<void> {
    const q = this.searchQuery();
    if (!q) return;
    
    this.searchLoading.set(true);
    this.localSearchError.set('');
    
    try {
      const result = await this.preOrderService.queryOrder(q);
      if (result) {
        this.router.navigate(['/order'], { queryParams: { id: result.id } });
      } else {
        this.localSearchError.set('No se encontró ninguna reserva activa con este número de orden. Verifica el código e intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error querying order:', err);
      this.localSearchError.set('Ocurrió un error de red al consultar tu reserva. Intenta de nuevo.');
    } finally {
      this.searchLoading.set(false);
    }
  }

  retryPayment(): void {
    this.isRetrying.set(true);
  }

  readonly totalAmountFormatted = computed(() => {
    const order = this.activeOrder();
    if (!order) return '';
    const total = order.quantity * 280000;
    return `$${total.toLocaleString('es-CO')} COP`;
  });

  private cleanUrlParams(): void {
    const cleanUrl = window.location.origin + window.location.pathname + `?id=${this.activeOrder()?.id}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  // Tilt and Interactive light effect copied perfectly for visual parity
  onMouseMoveTicket(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const card = event.currentTarget as HTMLElement;
    const bounds = card.getBoundingClientRect();
    const mouseX = event.clientX - bounds.left;
    const mouseY = event.clientY - bounds.top;
    
    const xPct = (mouseX / bounds.width) - 0.5;
    const yPct = (mouseY / bounds.height) - 0.5;
    
    gsap.to(card, {
      rotateY: xPct * 22,
      rotateX: -yPct * 22,
      scale: 1.025,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });
    
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

  // Robust Script injection of Bold Payment gateway on Landing page
  private async injectBoldButtonOnLanding(order: Order, retries = 8): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    
    let libScript = document.querySelector('script[src="https://checkout.bold.co/library/boldPaymentButton.js"]') as HTMLScriptElement;
    if (!libScript) {
      libScript = document.createElement('script');
      libScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      document.head.appendChild(libScript);
    }
    
    const container = document.getElementById('bold-pay-container');
    if (!container) {
      if (retries > 0) {
        setTimeout(() => this.injectBoldButtonOnLanding(order, retries - 1), 150);
      }
      return;
    }
    
    const tryInject = async () => {
      if (typeof (window as any).boldPaymentButton === 'undefined' && retries > 0) {
        setTimeout(tryInject, 100);
        retries--;
        return;
      }
      
      container.innerHTML = '';
      
      const qty = Number(order.quantity || 1);
      const totalAmount = 280000 * qty;
      
      const btnScript = document.createElement('script');
      btnScript.setAttribute('data-bold-button', 'dark-L');
      btnScript.setAttribute('data-api-key', environment.boldApiKey);
      btnScript.setAttribute('data-description', `Camiseta Osaneli Oro Vivo - ${qty}x Talla ${order.size} (${order.version === 'oro_vivo' ? 'Oro' : 'Negra'})`);
      btnScript.setAttribute('data-amount', totalAmount.toString());
      btnScript.setAttribute('data-currency', 'COP');
      btnScript.setAttribute('data-order-id', order.id);
      
      const demoSecret = environment.boldSecretKey;
      const integrityString = `${order.id}${totalAmount}COP${demoSecret}`;
      const signature = await this.generateSHA256OnLanding(integrityString);
      btnScript.setAttribute('data-integrity-signature', signature);
      
      const customerObj = {
        email: order.email || '',
        fullName: order.fullName || '',
        phone: order.phone || '',
        dialCode: '+57',
        documentType: 'CC'
      };
      btnScript.setAttribute('data-customer-data', JSON.stringify(customerObj));
      btnScript.setAttribute('data-render-mode', 'embedded');
      
      const redirectUrl = environment.boldRedirectUrl;
      btnScript.setAttribute('data-redirection-url', redirectUrl);
      btnScript.setAttribute('data-origin-url', window.location.href);
      
      btnScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      container.appendChild(btnScript);
    };
    
    setTimeout(tryInject, 100);
  }

  simulateApprovedPaymentOnLanding(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const order = this.activeOrder();
    if (!order) return;
    
    // Register simulated approved order
    this.preOrderService.addPreOrder({
      id: order.id,
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      version: order.version,
      size: order.size,
      quantity: order.quantity
    });
    
    // The syncer effect automatically catches this in preorders list and transitions state!
  }

  private async generateSHA256OnLanding(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}
