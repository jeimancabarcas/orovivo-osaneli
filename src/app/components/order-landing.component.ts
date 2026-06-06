import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { PreOrderService, Order } from '../services/pre-order.service';
import { OrderItem } from '../services/firebase.service';
import { gsap } from 'gsap';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-order-landing',
  imports: [CommonModule],
  template: `
    <section class="min-h-screen py-16 sm:py-24 px-4 sm:px-8 bg-gradient-to-b from-[#0A1721] to-[#111111] overflow-hidden text-neutral-100 flex flex-col items-center justify-center relative">
      
      <!-- Ambient light behind ticket -->
      <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-gold-aged/5 blur-[120px] pointer-events-none"></div>

      <div class="max-w-4xl mx-auto w-full relative z-10 text-center">
        
        <!-- Header logo -->
        <div class="mb-10 flex flex-col items-center gap-2 select-none animate-reveal">
          <img src="/logo.png" alt="OSANELI" class="h-6 w-auto object-contain brightness-95 invert" />
          <span class="text-[9px] font-bold text-gold-aged tracking-[0.3em] uppercase font-sans">Preventa Oficial FCF</span>
        </div>

        <!-- CASE 1: Loading state -->
        @if (isLoading()) {
          <div class="min-h-[40vh] flex flex-col items-center justify-center gap-4 animate-reveal">
            <div class="relative w-14 h-14 flex items-center justify-center">
              <div class="absolute inset-0 rounded-full border border-gold-aged/20 animate-ping"></div>
              <div class="w-10 h-10 rounded-full border-4 border-gold-aged/10 border-t-gold-aged animate-spin"></div>
            </div>
            <span class="text-xs text-neutral-400 uppercase tracking-widest font-sans font-bold">Cargando reserva...</span>
          </div>
        }

        <!-- CASE 2: No Order active (Display Search Code Form) -->
        @else if (!activeOrder()) {
          
          <div class="glass-effect rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md mx-auto border border-white/5 animate-reveal">
            <div class="flex flex-col items-center gap-3 mb-8">
              <h3 class="font-serif text-2xl sm:text-3xl font-black text-white">Rastrear Mi Reserva</h3>
              <p class="text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed font-sans">
                Consulta los comprobantes de pago, seriales holográficos y estado logístico del envío ingresando tu código de 6 caracteres.
              </p>
            </div>

            <div class="flex flex-col gap-6">
              <div class="flex flex-col gap-2 text-left">
                <label for="order-id" class="text-[10px] font-bold text-neutral-400 tracking-widest uppercase font-sans">Código de Reserva</label>
                <input 
                  type="text" 
                  id="order-id"
                  placeholder="OSN-XXXXXX"
                  [value]="searchQuery()"
                  (input)="onSearchInput($event)"
                  (keyup.enter)="executeSearch()"
                  class="w-full px-5 py-4 bg-matte-black/40 border border-white/5 focus:border-gold-aged/40 rounded-xl text-white font-mono text-center tracking-widest uppercase placeholder:text-neutral-700 focus:outline-none transition-all duration-300 shadow-inner"
                />
                @if (searchError()) {
                  <span class="text-[10px] text-red-400 font-semibold tracking-wide block max-w-sm mx-auto leading-relaxed animate-pulse font-sans">
                    {{ searchError() }}
                  </span>
                }
              </div>

              <div class="flex flex-col gap-3 font-sans">
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

                <button 
                  (click)="goToHome()"
                  class="text-xs text-neutral-500 font-bold font-sans tracking-wide hover:text-gold-aged uppercase transition-colors duration-300 cursor-pointer mt-2"
                >
                  ← Regresar al Inicio
                </button>
              </div>
            </div>

          </div>
        } 
        
        <!-- CASE 3: Active Order Dashboard -->
        @else if (activeOrder(); as order) {
          
          <!-- STATE A: APPROVED (Luxury Holographic Ticket) -->
          @if (order.status === 'APPROVED') {
            <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-gold-aged/40 shadow-[0_0_50px_rgba(197,168,84,0.15)] animate-reveal">
              
              <div class="w-16 h-16 rounded-full bg-gold-aged/10 flex items-center justify-center border-2 border-gold-aged/50 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="#C5A854"><path d="m382-354 278-278-56-56-222 222-114-114-56 56 170 170ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
              </div>

              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-gold-aged tracking-[0.2em] uppercase font-sans">RESERVA CONFIRMADA</span>
                <h3 class="font-serif text-2xl sm:text-3xl font-black text-white">¡Eres Dueño del Oro!</h3>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto font-sans">
                  Tu reserva está confirmada y tu pago ha sido liquidado correctamente. A continuación tienes tu ticket holográfico serializado por cada prenda.
                </p>
              </div>

              <!-- Ticket Navigator for Multi-Item Orders -->
              @if (order.items && order.items.length > 1) {
                <div class="flex flex-wrap justify-center gap-2 mb-2 font-sans w-full">
                  @for (it of order.items; track it; let idx = $index) {
                    <button 
                      (click)="selectedItemIndex.set(idx)"
                      class="px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                      [class.bg-gold-aged]="selectedItemIndex() === idx"
                      [class.text-matte-black]="selectedItemIndex() === idx"
                      [class.border-gold-aged]="selectedItemIndex() === idx"
                      [class.border-white/10]="selectedItemIndex() !== idx"
                      [class.text-neutral-400]="selectedItemIndex() !== idx"
                      [class.bg-white/5]="selectedItemIndex() !== idx"
                    >
                      Prenda {{ idx + 1 }}: {{ it.version === 'oro_vivo' ? 'Oro' : 'Negra' }} ({{ it.size }})
                    </button>
                  }
                </div>
              }

              <!-- Ticket Visual Layout -->
              @if (activeItem(); as item) {
                <div class="perspective-1000 w-full max-w-md mx-auto py-2">
                  <div 
                    class="ticket-card relative w-full rounded-2xl bg-neutral-900 border p-6 flex flex-col gap-6 text-left shadow-2xl overflow-hidden cursor-crosshair"
                    [class.border-gold-aged/40]="item.version === 'oro_vivo'"
                    [class.border-neutral-700/60]="item.version === 'edicion_secreta'"
                    (mousemove)="onMouseMoveTicket($event)"
                    (mouseleave)="onMouseLeaveTicket($event)"
                  >
                    <div class="holographic-glare absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-0 transition-opacity duration-300" style="background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(244, 223, 138, 0.25) 0%, rgba(197, 168, 84, 0.15) 30%, rgba(18, 42, 58, 0.3) 60%, rgba(138, 37, 37, 0.2) 100%);"></div>
                    <div class="absolute inset-0 bg-radial-gradient from-gold-aged/5 via-transparent to-transparent pointer-events-none"></div>

                    <!-- Header -->
                    <div class="flex justify-between items-center border-b border-white/5 pb-4 relative z-10">
                      <img src="/logo.png" alt="OSANELI" class="h-4 w-auto object-contain brightness-90 invert" />
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
                        <span class="text-[10px] text-neutral-500 uppercase tracking-wider">EDICIÓN</span>
                        <span class="text-white font-bold font-serif tracking-wide">
                          {{ item.version === 'oro_vivo' ? 'Oro Vivo (Oro)' : 'Edición Negra (Negra)' }}
                        </span>
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span class="text-[10px] text-neutral-500 uppercase tracking-wider">GÉNERO</span>
                        <span class="text-white font-bold tracking-wide uppercase">{{ item.gender || 'Unisex' }}</span>
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span class="text-[10px] text-neutral-500 uppercase tracking-wider">TALLA (BOXY)</span>
                        <span class="text-gold-aged font-extrabold tracking-widest text-sm">{{ item.size }}</span>
                      </div>
                      <div class="flex flex-col gap-0.5">
                        <span class="text-[10px] text-neutral-500 uppercase tracking-wider">CANTIDAD EN ÍTEM</span>
                        <span class="text-white font-bold tracking-widest font-sans">x{{ item.quantity }}</span>
                      </div>
                      <div class="flex flex-col gap-0.5 col-span-2">
                        <span class="text-[10px] text-neutral-500 uppercase tracking-wider">DIRECCIÓN DE ENVÍO</span>
                        <span class="text-neutral-300 font-medium tracking-wide truncate" [title]="order.address + (order.city ? ' - ' + order.city : '') + (order.country ? ', ' + order.country : '')">
                          {{ order.address || 'No especificada' }}{{ order.city ? ' - ' + order.city : '' }}{{ order.country ? ', ' + order.country : '' }}
                        </span>
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
                      <span class="font-mono text-sm font-black text-gold-aged tracking-[0.2em] uppercase">
                        {{ getActiveItemSerialText(item, order) }}
                      </span>
                    </div>

                  </div>
                </div>
              }

              <!-- Shipping Info or Logistics tracker Details -->
              @if (order.isShipped) {
                <!-- Tracker badge: gold style -->
                <div class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gold-aged/10 border border-gold-aged/30 max-w-sm mx-auto text-gold-aged font-sans text-xs font-bold tracking-wider select-none mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor" class="shrink-0"><path d="M240-160q-33 0-56.5-23.5T160-240v-200h80v200h480v-200h80v200q0 33-23.5 56.5T720-160H240Zm240-160L280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200Z"/></svg>
                  <span>✓ PEDIDO DESPACHADO</span>
                </div>

                <!-- Elegant Tracking Details Card -->
                <div class="w-full max-w-md mx-auto p-6 rounded-2xl bg-white/[0.02] border border-gold-aged/20 flex flex-col gap-3.5 text-left font-sans text-xs mt-2 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-24 h-24 bg-gold-aged/5 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div class="flex justify-between items-center pb-2.5 border-b border-white/5">
                    <span class="text-neutral-400">Transportadora</span>
                    <span class="text-white font-bold tracking-wide">{{ order.carrier || 'No especificada' }}</span>
                  </div>
                  
                  <div class="flex justify-between items-center pb-2.5 border-b border-white/5">
                    <span class="text-neutral-400">Número de Guía</span>
                    @if (order.trackingNumber) {
                      @if (getCarrierTrackingUrl(order.carrier, order.trackingNumber); as trackingUrl) {
                        <a [href]="trackingUrl" target="_blank" class="text-gold-aged hover:text-gold-light font-mono font-bold tracking-wider underline flex items-center gap-1">
                          {{ order.trackingNumber }}
                          <svg xmlns="http://www.w3.org/2000/svg" height="12" viewBox="0 -960 960 960" width="12" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-244-56-56 372-372H560v-80h280v280h-80v-144L388-364Z"/></svg>
                        </a>
                      } @else {
                        <span class="text-white font-mono font-bold tracking-wider">{{ order.trackingNumber }}</span>
                      }
                    } @else {
                      <span class="text-neutral-500 italic">No disponible</span>
                    }
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="text-neutral-400">Fecha de Despacho</span>
                    <span class="text-white font-medium">{{ formatShippingDate(order.shippedAt) || 'Recién despachado' }}</span>
                  </div>
                </div>
              } @else {
                <div class="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-green-500/10 border border-green-500/25 max-w-sm mx-auto text-green-400 font-sans text-xs font-bold tracking-wider select-none mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor" class="shrink-0"><path d="m382-354 278-278-56-56-222 222-114-114-56 56 170 170ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
                  <span>COMPROBANTE PAGADO VIA BOLD</span>
                </div>
              }

              <div class="flex gap-4 mt-2 font-sans">
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
          
          <!-- STATE B & C: CREATED (Ready to Pay) & PENDING (Procesando Pago) -->
          @else if (order.status === 'CREATED' || order.status === 'PENDING') {
            
            <!-- CREATED panel: Order Summary & Bold Payment button -->
            <div [class.hidden]="order.status !== 'CREATED'" class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start w-full max-w-4xl animate-reveal">
              
              <!-- Left Column: Order Summary -->
              <div class="glass-effect rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col gap-6">
                <div>
                  <span class="text-[10px] font-bold text-gold-aged tracking-[0.2em] uppercase font-sans">RESUMEN DE RESERVA</span>
                  <h3 class="font-serif text-2xl font-black text-white mt-1">Prendas Reservadas</h3>
                </div>

                <div class="flex flex-col gap-4 border-b border-white/5 pb-5">
                  <div class="flex flex-col gap-2 mt-1">
                    @for (it of order.items; track it) {
                      <div class="flex justify-between text-neutral-300 bg-white/5 p-3 rounded-lg border border-white/5 text-left">
                        <div class="flex flex-col gap-0.5">
                          <span class="font-bold text-white uppercase text-xs">
                            {{ it.version === 'oro_vivo' ? 'Oro Vivo' : 'Edición Negra' }}
                          </span>
                          <span class="text-[10px] text-neutral-400 font-sans">Talla: {{ it.size }} | Género: {{ it.gender }}</span>
                        </div>
                        <span class="font-bold text-gold-aged text-xs self-center">x{{ it.quantity }}</span>
                      </div>
                    }
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-neutral-400 font-sans">Dirección de Envío</span>
                    <span class="text-white font-sans font-medium truncate max-w-[180px]" [title]="order.address + (order.city ? ' - ' + order.city : '') + (order.country ? ', ' + order.country : '')">
                      {{ order.address || 'No especificada' }}{{ order.city ? ' - ' + order.city : '' }}{{ order.country ? ', ' + order.country : '' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-xs font-sans">
                    <span class="text-neutral-400">Código de Orden</span>
                    <span class="text-gold-aged font-mono font-bold tracking-widest bg-white/5 px-2.5 py-1 rounded">{{ order.id }}</span>
                  </div>
                </div>

                <div class="flex justify-between items-center border-b border-white/5 pb-5">
                  <div class="flex flex-col gap-0.5 text-left">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wide font-sans">COMPRADOR</span>
                    <span class="text-xs text-white font-bold truncate max-w-[180px] font-sans">{{ order.fullName }}</span>
                  </div>
                  <div class="flex flex-col gap-0.5 text-right font-sans">
                    <span class="text-[10px] text-neutral-500 uppercase tracking-wide">VALOR TOTAL</span>
                    <span class="text-base text-gold-aged font-editorial font-bold tracking-wide font-serif">{{ totalAmountFormatted() }}</span>
                  </div>
                </div>

                <div class="rounded-xl bg-gold-aged/5 border border-gold-aged/20 p-4 text-[10px] sm:text-xs text-neutral-400 leading-relaxed font-serif text-left">
                  <strong class="text-gold-aged font-sans uppercase tracking-wider block mb-1">Pasarela Segura</strong>
                  Para completar tu reserva, presiona el botón de pago seguro de Bold a la derecha. Tu pieza se garantizará con número de serie tan pronto se confirme la venta.
                </div>

                <div class="w-full flex flex-col gap-3 pt-3 border-t border-white/5 font-sans">
                  <div class="flex justify-between items-center text-[10px] text-neutral-500">
                    <button (click)="clearActive()" class="hover:text-gold-aged transition-colors duration-200 cursor-pointer">← Rastrear otro código</button>
                    <button (click)="goToHome()" class="hover:text-gold-aged transition-colors duration-200 cursor-pointer">Volver a Tienda</button>
                  </div>
                  <button 
                    (click)="editActiveOrder()" 
                    class="w-full py-2.5 rounded-xl border border-gold-aged/20 hover:border-gold-aged/50 bg-gold-aged/5 hover:bg-gold-aged/10 text-gold-aged text-[10px] font-sans font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor"><path d="M200-200h57l359-359-57-57-359 359v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                    Modificar datos de esta reserva
                  </button>
                </div>
              </div>

              <!-- Right Column: Bold payment Button -->
              <div class="glass-effect rounded-3xl p-6 sm:p-8 border border-gold-aged/20 shadow-[0_0_40px_rgba(197,168,84,0.06)] flex flex-col gap-6 text-center items-center justify-center min-h-[300px]">
                
                <div class="flex flex-col gap-1 items-center font-sans">
                  <span class="text-[10px] font-sans font-semibold tracking-[0.2em] text-gold-aged uppercase flex items-center gap-1.5 select-none animate-pulse">
                    <span class="w-1.5 h-1.5 rounded-full bg-gold-aged"></span>
                    Caja de Pago Seguro Bold
                  </span>
                  <p class="text-[11px] text-neutral-500 leading-relaxed max-w-xs">
                    Transacción cifrada y procesada por Bold. Acepta tarjetas, PSE, y más medios de pago.
                  </p>
                </div>

                <!-- Bold Button Container (intercepts click to transition to PENDING status) -->
                <div id="bold-pay-container" (click)="onBoldContainerClick()" class="w-full min-h-[50px] flex flex-col items-center justify-center gap-2">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-5 h-5 border-2 border-gold-aged border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-[10px] text-neutral-400 uppercase tracking-widest font-sans font-bold">Inyectando pasarela Bold...</span>
                  </div>
                </div>



              </div>
              
            </div>

            <!-- PENDING panel: Premium Holographic Charging Ticket -->
            <div [class.hidden]="order.status !== 'PENDING'" class="w-full animate-reveal">
              <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-gold-aged/40 shadow-[0_0_50px_rgba(197,168,84,0.15)]">
                
                <!-- Luxury Gold Loader -->
                <div class="relative w-16 h-16 flex items-center justify-center animate-reveal">
                  <!-- Pulsing golden outer glow -->
                  <div class="absolute inset-0 rounded-full border border-gold-aged/30 animate-ping"></div>
                  <!-- Rotating golden luxury ring -->
                  <div class="w-12 h-12 rounded-full border-4 border-gold-aged/10 border-t-gold-aged animate-spin"></div>
                </div>

                <div class="flex flex-col gap-2">
                  <span class="text-xs font-bold text-gold-aged tracking-[0.2em] uppercase font-sans">PAGO EN PROCESO</span>
                  <h3 class="font-serif text-2xl sm:text-3xl font-black text-white font-bold">Procesando Tu Reserva</h3>
                  <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto font-sans">
                    La pasarela de pago Bold está verificando tu transacción. Esto puede tomar unos segundos. Tu ticket holográfico serializado definitivo se generará al instante.
                  </p>
                </div>

                <!-- Info summary -->
                <div class="w-full border border-white/5 bg-white/[0.01] p-4 rounded-2xl text-left flex flex-col gap-2 text-xs font-sans">
                  <div class="flex justify-between items-center text-neutral-400">
                    <span>Código de Reserva</span>
                    <span class="text-white font-mono font-bold">{{ order.id }}</span>
                  </div>
                  <div class="flex justify-between items-center text-neutral-400">
                    <span>Comprador</span>
                    <span class="text-white font-medium">{{ order.fullName }}</span>
                  </div>
                  <div class="flex justify-between items-center text-neutral-400">
                    <span>Total a Pagar</span>
                    <span class="text-gold-aged font-bold font-serif">{{ totalAmountFormatted() }}</span>
                  </div>
                </div>

                <div class="text-[10px] text-neutral-500 mt-2 select-none italic animate-reveal font-sans">
                  No recargues ni cierres esta pestaña. El ticket se actualizará automáticamente en tiempo real.
                </div>

                <!-- Action / Help Box -->
                <div class="w-full border-t border-white/5 pt-6 mt-4 flex flex-col gap-6 font-sans">
                  
                  <!-- Option 1: Retry -->
                  <div class="flex flex-col gap-2 items-center">
                    <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">¿Tuviste problemas con la transacción?</span>
                    <p class="text-[11px] text-neutral-400/80 leading-normal max-w-sm">
                      Si no lograste completar el pago en Bold o cerraste la pasarela de pago por error, puedes restablecer tu orden para intentar de nuevo.
                    </p>
                    <button 
                      type="button"
                      (click)="retryPayment()"
                      [disabled]="isRetrying()"
                      class="mt-2 px-6 py-2.5 rounded-xl border border-white/10 hover:border-gold-aged bg-white/5 hover:bg-gold-aged/10 text-white hover:text-gold-aged font-sans font-bold text-[10px] tracking-wider uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      @if (isRetrying()) {
                        <span class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Procesando...
                      } @else {
                        Reintentar Pago
                      }
                    </button>
                  </div>

                  <div class="h-[1px] bg-white/5 w-1/2 mx-auto"></div>

                  <!-- Option 2: Support WhatsApp -->
                  <div class="flex flex-col gap-2 items-center">
                    <span class="text-[10px] font-bold text-green-400 uppercase tracking-widest">¿Ya realizaste el pago?</span>
                    <p class="text-[11px] text-neutral-400/80 leading-normal max-w-sm">
                      Si ya realizaste el pago y se debitó de tu cuenta, por favor <strong>no reintentes</strong> el pago. Escríbenos por WhatsApp adjuntando tu comprobante para confirmar tu orden de inmediato.
                    </p>
                    <a 
                      [href]="getSupportWhatsAppLink()"
                      target="_blank"
                      class="mt-2 px-6 py-2.5 rounded-xl border border-green-500/20 hover:border-green-500 bg-green-500/5 hover:bg-green-500/10 text-green-400 font-sans font-bold text-[10px] tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span class="material-symbols-outlined select-none text-[15px] leading-none">chat</span>
                      Soporte WhatsApp
                    </a>
                  </div>

                </div>
              </div>
            </div>
            
          }
          
          <!-- STATE D: REJECTED (Ruby Red Luxury Error Block) -->
          @else if (order.status === 'REJECTED') {
            <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-reveal">
              <div class="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border-2 border-red-500/40 text-red-500 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="currentColor"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
              </div>

              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-red-500 tracking-[0.2em] uppercase font-sans">TRANSACCIÓN DECLINADA</span>
                <h3 class="font-serif text-2xl sm:text-3xl font-black text-white font-bold">No Pudimos Procesar Tu Pago</h3>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto font-sans">
                  La pasarela de pago Bold reportó que la transacción fue rechazada, cancelada o no pudo completarse. Tu cupo de reserva no se ha asignado aún.
                </p>
              </div>

              <!-- Rejection Details Breakdown -->
              <div class="w-full rounded-2xl bg-red-500/5 border border-red-500/10 p-5 text-left text-xs flex flex-col gap-3 font-sans">
                <div class="flex justify-between items-center pb-2 border-b border-red-500/10">
                  <span class="text-neutral-400">Número de Orden</span>
                  <span class="text-white font-mono font-bold">{{ order.id }}</span>
                </div>
                <div class="flex justify-between items-center pb-2 border-b border-red-500/10">
                  <span class="text-neutral-400">Comprador</span>
                  <span class="text-white font-bold">{{ order.fullName }}</span>
                </div>
                <div class="flex justify-between items-center pb-2 border-b border-red-500/10">
                  <span class="text-neutral-400">Total Pre-Orden</span>
                  <span class="text-red-400 font-bold font-serif">{{ totalAmountFormatted() }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-400">Estado en Pasarela</span>
                  <span class="text-red-500 font-extrabold uppercase tracking-wide">RECHAZADO / CANCELADO</span>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2 font-sans">
                <button 
                  (click)="retryPayment()"
                  class="px-6 py-3.5 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer w-full sm:w-auto shadow-[0_4px_20px_rgba(197,168,84,0.2)] hover:scale-[1.02] active:scale-98"
                >
                  Volver a Intentar Pago
                </button>
                <button 
                  (click)="clearActive()"
                  class="px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer w-full sm:w-auto"
                >
                  Consultar otro código
                </button>
              </div>
            </div>
          }
          
          <!-- STATE E: VOIDED (Grey Slate Cancelled Block) -->
          @else if (order.status === 'VOIDED' || order.status === 'VOID_REJECTED') {
            <div class="glass-effect rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 max-w-xl mx-auto border-2 border-neutral-500/30 shadow-[0_0_40px_rgba(255,255,255,0.02)] animate-reveal">
              <div class="w-16 h-16 rounded-full bg-neutral-500/10 flex items-center justify-center border-2 border-neutral-500/40 text-neutral-400 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" height="32" viewBox="0 -960 960 960" width="32" fill="currentColor"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm-80-440h160v-80H400v80Zm0 240h160v-80H400v80Z"/></svg>
              </div>

              <div class="flex flex-col gap-2">
                <span class="text-xs font-bold text-neutral-400 tracking-[0.2em] uppercase font-sans">PRE-ORDEN ANULADA</span>
                <h3 class="font-serif text-2xl sm:text-3xl font-black text-white font-bold">Reserva Anulada / Reembolsada</h3>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-md mx-auto font-sans">
                  Este pedido fue anulado o reembolsado oficialmente mediante la pasarela de pagos Bold. El cupo y el ticket holográfico han perdido validez.
                </p>
              </div>

              <!-- Anullment Details Breakdown -->
              <div class="w-full rounded-2xl bg-white/5 border border-white/10 p-5 text-left text-xs flex flex-col gap-3 font-sans">
                <div class="flex justify-between items-center pb-2 border-b border-white/5">
                  <span class="text-neutral-400">Orden Asociada</span>
                  <span class="text-white font-mono font-bold">{{ order.id }}</span>
                </div>
                <div class="flex justify-between items-center pb-2 border-b border-white/5">
                  <span class="text-neutral-400">Comprador</span>
                  <span class="text-white font-bold">{{ order.fullName }}</span>
                </div>
                <div class="flex justify-between items-center pb-2 border-b border-white/5 font-serif text-neutral-300 font-bold">
                  <span>{{ totalAmountFormatted() }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-neutral-400">Estado</span>
                  <span class="text-neutral-500 font-extrabold uppercase tracking-wide">ANULADO / REEMBOLSADO</span>
                </div>
              </div>

              <div class="flex gap-4 mt-2 font-sans">
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
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  // States
  readonly orderIdQuery = signal<string | null>(null);
  readonly selectedItemIndex = signal<number>(0);

  // Computes the active order reactively in real-time from the synced preorders list
  readonly activeOrder = computed(() => {
    const queryId = this.orderIdQuery();
    if (!queryId) return null;
    return this.preOrderService.preorders().find(o => o.id === queryId) || null;
  });

  // Computes the active selected OrderItem to render inside the interactive holographic ticket
  readonly activeItem = computed(() => {
    const order = this.activeOrder();
    if (!order) return null;
    const items = order.items || [];
    const idx = Math.min(this.selectedItemIndex(), items.length - 1);
    return items[idx >= 0 ? idx : 0] || null;
  });

  // Loading state reactively computed to prevent hydration mismatch and async wait blocks
  readonly isLoading = computed(() => {
    const queryId = this.orderIdQuery();
    if (!queryId) return false;
    if (!this.preOrderService.isInitialSyncCompleted()) return true;
    return false;
  });
  
  // Search parameters
  readonly searchQuery = signal<string>('');
  readonly searchLoading = signal<boolean>(false);
  readonly localSearchError = signal<string>('');
  readonly isRetrying = signal<boolean>(false);
  
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

  // Side-effect to automatically update SEO tags based on the active order
  private readonly seoEffect = effect(() => {
    const order = this.activeOrder();
    const queryId = this.orderIdQuery();
    
    if (order) {
      const titleText = `Reserva ${order.id} | OSANELI ORO VIVO`;
      const statusText = order.status === 'APPROVED' ? 'Aprobado y Confirmado' : 
                         order.status === 'PENDING' ? 'Procesando Pago' : 
                         order.status === 'REJECTED' ? 'Rechazado' : 'Creado';
      const descText = `Consulta el estado de tu pre-orden de la camiseta 'ORO VIVO' de Osaneli (Código: ${order.id}). Estado: ${statusText}.`;
      this.titleService.setTitle(titleText);
      this.metaService.updateTag({ name: 'description', content: descText });
      
      this.metaService.updateTag({ property: 'og:title', content: titleText });
      this.metaService.updateTag({ property: 'og:description', content: descText });
      this.metaService.updateTag({ property: 'og:image', content: 'https://orovivo.osaneli.com/meta-crop-og.png' });
      this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
      this.metaService.updateTag({ property: 'og:image:height', content: '630' });
      this.metaService.updateTag({ property: 'og:url', content: `https://orovivo.osaneli.com/order?id=${order.id}` });
      
      this.metaService.updateTag({ name: 'twitter:title', content: titleText });
      this.metaService.updateTag({ name: 'twitter:description', content: descText });
      this.metaService.updateTag({ name: 'twitter:image', content: 'https://orovivo.osaneli.com/meta-crop-twitter.png' });
    } else if (queryId) {
      const titleText = `Buscando Reserva ${queryId} | OSANELI ORO VIVO`;
      const descText = `Buscando los detalles y estado del pedido con código ${queryId} en la base de datos de preventa de Osaneli.`;
      this.titleService.setTitle(titleText);
      this.metaService.updateTag({ name: 'description', content: descText });
      
      this.metaService.updateTag({ property: 'og:title', content: titleText });
      this.metaService.updateTag({ property: 'og:description', content: descText });
      this.metaService.updateTag({ property: 'og:image', content: 'https://orovivo.osaneli.com/meta-crop-og.png' });
      this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
      this.metaService.updateTag({ property: 'og:image:height', content: '630' });
      this.metaService.updateTag({ property: 'og:url', content: `https://orovivo.osaneli.com/order?id=${queryId}` });
      
      this.metaService.updateTag({ name: 'twitter:title', content: titleText });
      this.metaService.updateTag({ name: 'twitter:description', content: descText });
      this.metaService.updateTag({ name: 'twitter:image', content: 'https://orovivo.osaneli.com/meta-crop-twitter.png' });
    } else {
      const titleText = 'Consultar Reserva | OSANELI ORO VIVO';
      const descText = 'Ingresa tu código único para consultar el estado de tu preventa premium u obtener tu ticket holográfico 3D de Osaneli.';
      this.titleService.setTitle(titleText);
      this.metaService.updateTag({ name: 'description', content: descText });
      
      this.metaService.updateTag({ property: 'og:title', content: titleText });
      this.metaService.updateTag({ property: 'og:description', content: descText });
      this.metaService.updateTag({ property: 'og:image', content: 'https://orovivo.osaneli.com/meta-crop-og.png' });
      this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
      this.metaService.updateTag({ property: 'og:image:height', content: '630' });
      this.metaService.updateTag({ property: 'og:url', content: 'https://orovivo.osaneli.com/order' });
      
      this.metaService.updateTag({ name: 'twitter:title', content: titleText });
      this.metaService.updateTag({ name: 'twitter:description', content: descText });
      this.metaService.updateTag({ name: 'twitter:image', content: 'https://orovivo.osaneli.com/meta-crop-twitter.png' });
    }
  });

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

  // Automatically trigger Bold injection when active order is CREATED
  private readonly boldInjectorEffect = effect(() => {
    if (!isPlatformBrowser(this.platformId)) return;
    const order = this.activeOrder();
    
    if (order && order.status === 'CREATED') {
      setTimeout(() => {
        this.injectBoldButtonOnLanding(order);
      }, 300);
    }
  });

  // Side-effect to automatically animate data-reveal elements whenever the page view state changes
  private readonly revealAnimationEffect = effect(() => {
    this.activeOrder();
    this.isLoading();
    this.isRetrying();
    
    if (!isPlatformBrowser(this.platformId)) return;
    setTimeout(() => {
      const reveals = document.querySelectorAll('.animate-reveal, [data-reveal]');
      if (reveals.length > 0) {
        gsap.fromTo(reveals, 
          { opacity: 0, y: 15, scale: 0.99 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out', stagger: 0.08 }
        );
      }
    }, 100);
  });

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const queryId = params['id'];
      if (queryId) {
        this.orderIdQuery.set(String(queryId).trim().toUpperCase());
      } else {
        this.orderIdQuery.set(null);
      }
      this.selectedItemIndex.set(0); // Reset item index on navigation
    });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
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
      const exists = await this.preOrderService.queryOrder(q);
      if (exists) {
        this.router.navigate(['/order'], { queryParams: { id: exists.id } });
        this.searchQuery.set('');
      } else {
        this.localSearchError.set('No se encontró ningún pedido con el código especificado. Verifica el código e intenta nuevamente.');
      }
    } catch (e) {
      console.error(e);
      this.localSearchError.set('Ocurrió un error de red al intentar consultar tu reserva. Intenta de nuevo.');
    } finally {
      this.searchLoading.set(false);
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  clearActive(): void {
    this.localSearchError.set('');
    this.searchQuery.set('');
    this.router.navigate(['/order']);
  }

  editActiveOrder(): void {
    const order = this.activeOrder();
    if (order && order.status === 'CREATED') {
      this.router.navigate(['/'], { queryParams: { edit: order.id } });
    }
  }

  totalAmountFormatted(): string {
    const order = this.activeOrder();
    if (!order) return '$0 COP';
    const total = order.quantity * environment.productPrice;
    return `$${total.toLocaleString('es-CO')} COP`;
  }

  getCarrierTrackingUrl(carrier?: string, trackingNumber?: string): string {
    if (!carrier || !trackingNumber) return '';
    const norm = carrier.toLowerCase();
    if (norm.includes('servientrega')) {
      return `https://www.servientrega.com/wps/portal/portal-corporativo/rastreo-envios?id=${trackingNumber}`;
    }
    if (norm.includes('coordinadora')) {
      return `https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastreo-de-guias/?guia=${trackingNumber}`;
    }
    if (norm.includes('interrapidisimo') || norm.includes('inter')) {
      return `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${trackingNumber}`;
    }
    if (norm.includes('envia')) {
      return `https://envia.co/`;
    }
    return '';
  }

  formatShippingDate(isoString?: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  async retryPayment(): Promise<void> {
    const order = this.activeOrder();
    if (!order) return;
    
    this.isRetrying.set(true);
    try {
      // Revert status to CREATED in Firebase and re-inject Bold button
      await this.preOrderService.updateOrderStatus(order.id, 'CREATED');
    } catch (e) {
      console.error('Failed to retry payment:', e);
    } finally {
      this.isRetrying.set(false);
    }
  }

  getSupportWhatsAppLink(): string {
    const order = this.activeOrder();
    const orderId = order ? order.id : '';
    const text = `Hola, realicé el pago de mi reserva con código ${orderId} en Osaneli, pero mi ticket sigue apareciendo en proceso. Adjunto el comprobante de mi pago para confirmación.`;
    return `https://api.whatsapp.com/send?phone=573015279993&text=${encodeURIComponent(text)}`;
  }



  // 3D Tilt Ticket Physics
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

  // Bold Payment Button Injection Logic on Landing Checkouts
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
      const totalAmount = environment.productPrice * qty;
      
      const btnScript = document.createElement('script');
      btnScript.setAttribute('data-bold-button', 'dark-L');
      btnScript.setAttribute('data-api-key', environment.boldApiKey);
      
      // Dynamic details list in payment button description
      let desc = 'Reserva Osaneli: ';
      if (order.items && order.items.length > 0) {
        desc += order.items.map(it => `${it.quantity}x ${it.version === 'oro_vivo' ? 'Oro' : 'Negra'} (${it.size})`).join(', ');
      } else {
        desc += `${qty}x Talla ${order.size} (${order.version === 'oro_vivo' ? 'Oro' : 'Negra'})`;
      }

      btnScript.setAttribute('data-description', desc);
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
      
      // rediect URL dynamic structure
      let redirectUrl = window.location.origin + '/order?id=' + order.id;
      if (redirectUrl.startsWith('http://')) {
        redirectUrl = redirectUrl.replace('http://', 'https://');
      }
      btnScript.setAttribute('data-redirection-url', redirectUrl);
      btnScript.setAttribute('data-origin-url', window.location.href);
      
      btnScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      container.appendChild(btnScript);
    };
    
    tryInject();
  }

  // Intercept container click to transition order status to PENDING
  async onBoldContainerClick(): Promise<void> {
    const order = this.activeOrder();
    if (!order || order.status !== 'CREATED') return;
    
    try {
      // Small buffer to let Bold checkout modal open fully
      setTimeout(async () => {
        await this.preOrderService.updateOrderStatus(order.id, 'PENDING');
      }, 250);
    } catch (e) {
      console.error('Failed to update status to PENDING on checkout button click:', e);
    }
  }

  private cleanUrlParams(): void {
    const cleanUrl = window.location.origin + window.location.pathname + `?id=${this.activeOrder()?.id}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  private async generateSHA256OnLanding(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getActiveItemSerialText(item: OrderItem, order: Order): string {
    if (item.version === 'edicion_secreta') {
      return 'EDICIÓN NEGRA';
    }
    if (item.serialNumbers && item.serialNumbers.length > 0) {
      return item.serialNumbers.join(' | ');
    }
    return order.serialNumber || 'PENDIENTE';
  }

  // Import dynamic check properties
  readonly checkoutLoading = signal<boolean>(false);
}
