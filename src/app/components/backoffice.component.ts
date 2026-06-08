import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService, Order, OrderItem } from '../services/firebase.service';
import { environment } from '../../environments/environment';

type TabMode = 'dashboard' | 'orders';

@Component({
  selector: 'app-backoffice',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-[#0A1721] text-neutral-100 font-sans py-12 px-4 sm:px-8">
      <div class="max-w-7xl mx-auto">

        <!-- SECURITY / LOGIN SCREEN -->
        @if (!isAuthenticated()) {
          <div class="min-h-[60vh] flex items-center justify-center">
            <div class="glass-effect rounded-3xl p-8 sm:p-12 max-w-md w-full border border-white/10 shadow-2xl relative overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,84,0.03),transparent_70%)] pointer-events-none"></div>
              
              <div class="flex flex-col items-center gap-3 text-center mb-8 relative z-10">
                <img src="/logo.png" alt="OSANELI" class="h-6 w-auto object-contain brightness-90 invert mb-2" />
                <h2 class="font-serif text-xl sm:text-2xl font-black text-white">Backoffice Administrativo</h2>
                <p class="text-xs text-neutral-400">Ingresa la contraseña de administrador de Osaneli para acceder a la base de datos de preventas.</p>
              </div>

              <div class="flex flex-col gap-5 relative z-10">
                <div class="flex flex-col gap-2">
                  <label for="admin-pass" class="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">Contraseña</label>
                  <input 
                    type="password" 
                    id="admin-pass"
                    placeholder="••••••••••••"
                    [value]="password()"
                    (input)="onPasswordInput($event)"
                    (keyup.enter)="login()"
                    class="w-full px-4 py-3 bg-matte-black/40 border border-white/10 focus:border-gold-aged/40 rounded-xl text-white text-center focus:outline-none transition-colors duration-300 shadow-inner"
                  />
                  @if (loginError()) {
                    <span class="text-[10px] text-red-400 font-semibold tracking-wide mt-1">{{ loginError() }}</span>
                  }
                </div>

                <button 
                  (click)="login()"
                  [disabled]="loginLoading() || !password()"
                  class="w-full py-3.5 rounded-xl bg-gold-aged hover:bg-gold-light disabled:bg-neutral-800 text-matte-black disabled:text-neutral-500 font-sans font-extrabold tracking-widest text-xs uppercase cursor-pointer flex justify-center items-center gap-2 shadow-[0_4px_20px_rgba(197,168,84,0.15)] disabled:shadow-none transition-all duration-300"
                >
                  @if (loginLoading()) {
                    <div class="w-4 h-4 border-2 border-matte-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Validando...</span>
                  } @else {
                    <span>Acceder al Panel</span>
                  }
                </button>
              </div>
            </div>
          </div>

        } @else {

          <!-- BACKOFFICE PANEL -->
          <div class="flex flex-col gap-8 animate-fade-in">
            
            <!-- Header bar -->
            <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/5 shadow-md">
              <div class="flex items-center gap-4">
                <img src="/logo.png" alt="OSANELI" class="h-6 w-auto object-contain brightness-90 invert" />
                <div class="h-6 w-[1px] bg-white/15 hidden md:block"></div>
                <span class="text-xs font-mono tracking-widest text-gold-aged uppercase font-bold">CONTROL LOGÍSTICO Y DE VENTAS</span>
              </div>

              <div class="flex items-center gap-4">
                <!-- Navigation Tabs -->
                <div class="flex p-1 rounded-xl bg-matte-black border border-white/5">
                  <button 
                    (click)="activeTab.set('dashboard')"
                    class="px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer"
                    [class.bg-gold-aged]="activeTab() === 'dashboard'"
                    [class.text-matte-black]="activeTab() === 'dashboard'"
                    [class.text-neutral-400]="activeTab() !== 'dashboard'"
                    [class.hover:text-white]="activeTab() !== 'dashboard'"
                  >
                    Resumen
                  </button>
                  <button 
                    (click)="activeTab.set('orders')"
                    class="px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer"
                    [class.bg-gold-aged]="activeTab() === 'orders'"
                    [class.text-matte-black]="activeTab() === 'orders'"
                    [class.text-neutral-400]="activeTab() !== 'orders'"
                    [class.hover:text-white]="activeTab() !== 'orders'"
                  >
                    Pedidos
                  </button>
                </div>

                <button 
                  (click)="logout()"
                  class="px-4 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/15 text-red-400 hover:text-red-300 font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <!-- TAB 1: METRICS OVERVIEW (DASHBOARD) -->
            @if (activeTab() === 'dashboard') {
              
              <!-- Metrics Cards -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Card: Income -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">INGRESOS APROBADOS</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-white leading-none">$ {{ stats().totalSalesFormatted }} COP</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Pagos confirmados vía pasarela Bold</span>
                </div>

                <!-- Card: Items Sold -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-gold-aged/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">PRENDAS RESERVADAS</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-gold-aged leading-none">{{ stats().totalItemsSold }} / {{ dropLimit }} U.</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Volumen de stock real comprado</span>
                </div>

                <!-- Card: Remaining Inventory -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">STOCK DISPONIBLE</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-white leading-none">{{ stats().remainingStock }} Piezas</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Límite oficial: {{ dropLimit }} piezas (Filtro OSN)</span>
                </div>

                <!-- Card: Pending/Created Drafts -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">RESERVAS EN ESPERA</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-white leading-none">{{ stats().totalDrafts }} Borradores</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Estados de pago: CREATED y PENDING</span>
                </div>
              </div>

              <!-- Financial Metrics Row -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <!-- Card: Bold Commission -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden animate-reveal">
                  <div class="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">COSTO PASARELA BOLD</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-red-400 leading-none">$ {{ stats().boldCommissionFormatted }} COP</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Suma de impuestos (taxes) de transacciones aprobadas</span>
                </div>

                <!-- Card: Production Cost (COGS) -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden animate-reveal">
                  <div class="absolute inset-0 bg-gradient-to-br from-neutral-500/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">COSTO DE PRODUCCIÓN (COGS)</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-white leading-none">$ {{ stats().productionCostFormatted }} COP</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Calculado a $100.000 COP por prenda</span>
                </div>

                <!-- Card: Utility / Profit -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden animate-reveal">
                  <div class="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">UTILIDAD NETAS ESTIMADA</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-green-400 leading-none">$ {{ stats().utilityFormatted }} COP</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Ventas - Costo Bold - Producción</span>
                </div>
              </div>

              <!-- Visual Breakdowns -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <!-- Edition Distribution -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 flex flex-col gap-5">
                  <h3 class="text-xs font-bold text-neutral-400 tracking-widest uppercase border-b border-white/5 pb-2">Distribución por Edición</h3>
                  <div class="flex flex-col gap-4 py-2">
                    <div class="flex flex-col gap-1.5">
                      <div class="flex justify-between text-xs font-medium">
                        <span>Oro Vivo</span>
                        <span class="text-gold-aged font-bold">{{ stats().editions.oroVivo }} piezas ({{ stats().editions.oroVivoPct }}%)</span>
                      </div>
                      <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div class="h-full bg-gold-aged rounded-full" [style.width.%]="stats().editions.oroVivoPct"></div>
                      </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <div class="flex justify-between text-xs font-medium">
                        <span>Edición Negra</span>
                        <span class="text-neutral-400 font-bold">{{ stats().editions.edicionSecreta }} piezas ({{ stats().editions.edicionSecretaPct }}%)</span>
                      </div>
                      <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <div class="h-full bg-neutral-400 rounded-full" [style.width.%]="stats().editions.edicionSecretaPct"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Sizes Distribution -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 flex flex-col gap-5">
                  <h3 class="text-xs font-bold text-neutral-400 tracking-widest uppercase border-b border-white/5 pb-2">Distribución por Tallas</h3>
                  <div class="flex flex-col gap-4 py-2">
                    @for (sz of ['S', 'M', 'L', 'XL', 'XXL']; track sz) {
                      <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between text-xs font-medium">
                          <span>Talla {{ sz }}</span>
                          <span class="text-white font-bold">{{ stats().sizes[sz] || 0 }} piezas ({{ stats().sizesPct[sz] || 0 }}%)</span>
                        </div>
                        <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div class="h-full bg-gold-aged rounded-full" [style.width.%]="stats().sizesPct[sz] || 0"></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

                <!-- Genders Distribution -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 flex flex-col gap-5">
                  <h3 class="text-xs font-bold text-neutral-400 tracking-widest uppercase border-b border-white/5 pb-2">Distribución por Géneros</h3>
                  <div class="flex flex-col gap-4 py-2">
                    @for (g of ['Hombre', 'Mujer', 'Unisex']; track g) {
                      <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between text-xs font-medium">
                          <span>{{ g }}</span>
                          <span class="text-white font-bold">{{ stats().genders[g] || 0 }} piezas ({{ stats().gendersPct[g] || 0 }}%)</span>
                        </div>
                        <div class="w-full h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div class="h-full bg-gold-aged rounded-full" [style.width.%]="stats().gendersPct[g] || 0"></div>
                        </div>
                      </div>
                    }
                  </div>
                </div>

              </div>

            } @else {

              <!-- TAB 2: ORDERS MANAGEMENT BOARD -->
              <div class="glass-effect rounded-2xl border border-white/5 shadow p-6 flex flex-col gap-6">
                
                <!-- Filter Grid Controls -->
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <!-- Search bar input -->
                  <div class="md:col-span-2 relative">
                    <input 
                      type="text" 
                      placeholder="Buscar por ID, Cliente, Email o Teléfono..."
                      [value]="searchQuery()"
                      (input)="onSearchQueryInput($event)"
                      class="w-full pl-10 pr-4 py-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 text-sm focus:outline-none transition-colors duration-200"
                    />
                    <!-- Search Icon -->
                    <span class="absolute left-3.5 top-3.5 text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-200q75 0 127.5-52.5T560-380q0-75-52.5-127.5T380-560q-75 0-127.5 52.5T200-380q0 75 52.5 127.5T380-200Z"/></svg>
                    </span>
                  </div>

                  <!-- Shipping Status dropdown filter -->
                  <div class="relative">
                    <select 
                      [value]="shippingFilter()"
                      (change)="onShippingFilterChange($event)"
                      class="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 text-sm focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">Filtro Logística: Todos</option>
                      <option value="pending">Pendientes de Despacho</option>
                      <option value="shipped">Pedidos Despachados</option>
                    </select>
                  </div>

                  <!-- CSV Export action button -->
                  <div>
                    <button 
                      (click)="exportToCSV()"
                      class="w-full py-3 rounded-xl border border-white/10 hover:border-gold-aged/40 bg-white/5 hover:bg-gold-aged/5 text-white hover:text-gold-aged font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>
                      Exportar Filtros CSV
                    </button>
                  </div>

                  <!-- Crear Pedido Manual button -->
                  <div>
                    <button 
                      (click)="openManualOrderModal()"
                      class="w-full py-3 rounded-xl border border-gold-aged/25 hover:border-gold-aged bg-gold-aged/10 hover:bg-gold-aged/20 text-gold-aged hover:text-white font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/></svg>
                      Crear Pedido
                    </button>
                  </div>
                </div>

                <!-- State Filters Row -->
                <div class="flex flex-wrap gap-2 items-center border-b border-white/5 pb-4">
                  <span class="text-[10px] text-neutral-500 font-bold tracking-widest uppercase mr-2">ESTADO PAGO:</span>
                  @for (st of ['all', 'APPROVED', 'CREATED', 'PENDING', 'REJECTED', 'VOIDED']; track st) {
                    <button 
                      (click)="setStatusFilter(st)"
                      class="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors duration-200 cursor-pointer border"
                      [class.bg-gold-aged]="statusFilter() === st"
                      [class.text-matte-black]="statusFilter() === st"
                      [class.border-gold-aged]="statusFilter() === st"
                      [class.border-white/10]="statusFilter() !== st"
                      [class.text-neutral-400]="statusFilter() !== st"
                      [class.hover:text-white]="statusFilter() !== st"
                    >
                      {{ st === 'all' ? 'Todos' : st }}
                    </button>
                  }
                </div>

                <!-- Orders Grid Table -->
                <div class="overflow-x-auto rounded-xl border border-white/5">
                  <table class="w-full text-left border-collapse font-sans text-xs">
                    <thead>
                      <tr class="bg-neutral-900 border-b border-white/10 text-neutral-400 font-bold uppercase tracking-wider">
                        <th class="p-4">Orden ID</th>
                        <th class="p-4">Fecha</th>
                        <th class="p-4">Cliente / Contacto</th>
                        <th class="p-4">Prenda / Config</th>
                        <th class="p-4 text-center">Cant.</th>
                        <th class="p-4 text-right">Total</th>
                        <th class="p-4 text-center">Estado Pago</th>
                        <th class="p-4 text-center">Despacho</th>
                        <th class="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                      @for (ord of paginatedOrders(); track ord.id) {
                        <tr class="hover:bg-white/[0.02] transition-colors duration-150">
                          <td class="p-4 font-mono font-bold tracking-wider text-white">
                            {{ ord.id }}
                          </td>
                          <td class="p-4 text-neutral-400 whitespace-nowrap">
                            {{ formatDate(ord.createdAt) }}
                          </td>
                          <td class="p-4 flex flex-col gap-0.5 whitespace-nowrap">
                            <span class="font-bold text-white">{{ ord.fullName }}</span>
                            <span class="text-[10px] text-neutral-400">{{ ord.email }}</span>
                            <span class="text-[10px] text-neutral-500">{{ ord.phone }}</span>
                          </td>
                          <td class="p-4">
                            <div class="flex flex-col gap-0.5">
                              @if (ord.items && ord.items.length > 1) {
                                <span class="font-bold text-gold-aged uppercase">Varios Artículos</span>
                                <span class="text-[10px] text-neutral-400 whitespace-nowrap">
                                  @for (it of ord.items; track $index) {
                                    {{ it.quantity }}x {{ it.version === 'oro_vivo' ? 'Oro' : 'Negra' }} ({{ it.size }}){{ !$last ? ', ' : '' }}
                                  }
                                </span>
                              } @else {
                                <span class="font-bold text-white uppercase">{{ ord.version === 'oro_vivo' ? 'Oro Vivo' : 'Edición Negra' }}</span>
                                <span class="text-[10px] text-neutral-400">Talla: {{ ord.size }} | Género: {{ ord.gender || 'Unisex' }}</span>
                              }
                            </div>
                          </td>
                          <td class="p-4 text-center font-bold text-white">
                            {{ ord.quantity }}
                          </td>
                          <td class="p-4 text-right font-serif font-bold text-gold-aged">
                            $ {{ calculateTotal(ord.quantity) }}
                          </td>
                          <td class="p-4 text-center">
                            <span 
                              class="inline-block px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase border"
                              [class.bg-green-500/10]="ord.status === 'APPROVED'"
                              [class.text-green-400]="ord.status === 'APPROVED'"
                              [class.border-green-500/25]="ord.status === 'APPROVED'"
                              [class.bg-blue-500/10]="ord.status === 'CREATED'"
                              [class.text-blue-400]="ord.status === 'CREATED'"
                              [class.border-blue-500/25]="ord.status === 'CREATED'"
                              [class.bg-yellow-500/10]="ord.status === 'PENDING'"
                              [class.text-yellow-400]="ord.status === 'PENDING'"
                              [class.border-yellow-500/25]="ord.status === 'PENDING'"
                              [class.bg-red-500/10]="ord.status === 'REJECTED' || ord.status === 'VOID_REJECTED'"
                              [class.text-red-400]="ord.status === 'REJECTED' || ord.status === 'VOID_REJECTED'"
                              [class.border-red-500/25]="ord.status === 'REJECTED' || ord.status === 'VOID_REJECTED'"
                              [class.bg-neutral-500/10]="ord.status === 'VOIDED'"
                              [class.text-neutral-400]="ord.status === 'VOIDED'"
                              [class.border-neutral-500/25]="ord.status === 'VOIDED'"
                            >
                              {{ ord.status }}
                            </span>
                          </td>
                          <td class="p-4 text-center">
                            @if (ord.isShipped) {
                              <span class="inline-block px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-gold-aged/10 text-gold-aged border border-gold-aged/30">
                                Despachado
                              </span>
                            } @else {
                              <span class="inline-block px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-neutral-800 text-neutral-500 border border-white/5">
                                Pendiente
                              </span>
                            }
                          </td>
                          <td class="p-4 text-center">
                            <div class="flex items-center justify-center gap-1.5 flex-wrap max-w-[200px] mx-auto">
                              @if (ord.status === 'CREATED' || ord.status === 'PENDING') {
                                <a 
                                  [href]="getWhatsAppLink(ord)" 
                                  target="_blank"
                                  class="p-1.5 rounded-lg border border-green-500/20 hover:border-green-500/60 bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 flex items-center justify-center transition-all duration-200 cursor-pointer"
                                  title="Contactar por WhatsApp"
                                >
                                  <span class="material-symbols-outlined select-none text-[15px] leading-none">
                                    chat
                                  </span>
                                </a>
                              }
                              
                              <button 
                                (click)="openOrderModal(ord, 'edit')"
                                class="px-2.5 py-1 rounded-lg border border-white/10 hover:border-gold-aged bg-white/5 hover:bg-gold-aged hover:text-matte-black font-sans font-bold text-[9px] tracking-wider uppercase transition-all duration-200 cursor-pointer"
                                title="Editar pedido"
                              >
                                Editar
                              </button>

                              @if (ord.status === 'APPROVED') {
                                <button 
                                  (click)="openOrderModal(ord, 'shipping')"
                                  class="px-2.5 py-1 rounded-lg border border-white/10 hover:border-blue-400 bg-white/5 hover:bg-blue-400 hover:text-matte-black font-sans font-bold text-[9px] tracking-wider uppercase transition-all duration-200 cursor-pointer"
                                  title="Gestionar envío"
                                >
                                  Envío
                                </button>
                              }

                              @if (ord.payment_id) {
                                <button 
                                  (click)="openOrderModal(ord, 'bold')"
                                  class="px-2.5 py-1 rounded-lg border border-white/10 hover:border-purple-400 bg-white/5 hover:bg-purple-400 hover:text-matte-black font-sans font-bold text-[9px] tracking-wider uppercase transition-all duration-200 cursor-pointer"
                                  title="Detalles Bold"
                                >
                                  Bold
                                </button>
                              }
                            </div>
                          </td>
                        </tr>
                      } @empty {
                        <tr>
                          <td colspan="9" class="p-12 text-center text-neutral-500 text-sm">
                            No se encontraron reservas registradas que coincidan con los filtros aplicados.
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                <!-- Pagination Controls -->
                @if (paginationInfo(); as info) {
                  <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5 text-xs text-neutral-400">
                    <div>
                      Mostrando <span class="font-bold text-white">{{ info.start }}</span> - <span class="font-bold text-white">{{ info.end }}</span> de <span class="font-bold text-white">{{ info.totalItems }}</span> pedidos
                    </div>

                    @if (info.totalPages > 1) {
                      <div class="flex items-center gap-1.5">
                        <button 
                          (click)="goToPage(1)" 
                          [disabled]="!info.hasPrev"
                          class="w-8 h-8 rounded-lg border border-white/10 hover:border-gold-aged bg-white/5 disabled:bg-neutral-900/40 disabled:opacity-40 disabled:border-white/5 text-white hover:text-gold-aged disabled:hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer text-[10px]"
                        >
                          «
                        </button>
                        
                        <button 
                          (click)="goToPage(info.currentPage - 1)" 
                          [disabled]="!info.hasPrev"
                          class="px-2.5 h-8 rounded-lg border border-white/10 hover:border-gold-aged bg-white/5 disabled:bg-neutral-900/40 disabled:opacity-40 disabled:border-white/5 text-white hover:text-gold-aged disabled:hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer text-[10px] uppercase font-bold tracking-wider"
                        >
                          Ant.
                        </button>

                        <span class="px-2 font-semibold text-neutral-300">
                          {{ info.currentPage }} / {{ info.totalPages }}
                        </span>

                        <button 
                          (click)="goToPage(info.currentPage + 1)" 
                          [disabled]="!info.hasNext"
                          class="px-2.5 h-8 rounded-lg border border-white/10 hover:border-gold-aged bg-white/5 disabled:bg-neutral-900/40 disabled:opacity-40 disabled:border-white/5 text-white hover:text-gold-aged disabled:hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer text-[10px] uppercase font-bold tracking-wider"
                        >
                          Sig.
                        </button>

                        <button 
                          (click)="goToPage(info.totalPages)" 
                          [disabled]="!info.hasNext"
                          class="w-8 h-8 rounded-lg border border-white/10 hover:border-gold-aged bg-white/5 disabled:bg-neutral-900/40 disabled:opacity-40 disabled:border-white/5 text-white hover:text-gold-aged disabled:hover:text-white flex items-center justify-center transition-colors duration-200 cursor-pointer text-[10px]"
                        >
                          »
                        </button>
                      </div>
                    }
                  </div>
                }

              </div>

            }

          </div>

        }

      </div>
    </div>

    <!-- DETAIL / ADMIN UPDATE MODAL -->
    @if (selectedOrder(); as ord) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-matte-black/95 backdrop-blur-md">
        <!-- Backdrop close -->
        <div class="absolute inset-0 cursor-pointer" (click)="closeModal()"></div>

        <div class="relative max-w-2xl w-full bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
          
          <!-- Close button -->
          <button 
            (click)="closeModal()"
            class="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full border border-white/10 hover:border-gold-aged/40 bg-white/5 hover:bg-gold-aged/10 text-neutral-400 hover:text-gold-aged flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
          </button>

          <!-- Modal Header -->
          <div class="border-b border-white/5 pb-4">
            <span class="text-[9px] font-bold text-gold-aged tracking-[0.2em] uppercase font-mono">
              @if (selectedOrderMode() === 'edit') {
                EDITAR DETALLES DEL PEDIDO
              } @else if (selectedOrderMode() === 'shipping') {
                GESTIÓN DE LOGÍSTICA DE ENVÍO
              } @else {
                INFORMACIÓN DE PAGO BOLD
              }
            </span>
            <h3 class="font-serif text-xl sm:text-2xl font-black text-white">Orden ID: {{ ord.id }}</h3>
          </div>

          <!-- Modal views based on selectedOrderMode -->
          @if (selectedOrderMode() === 'edit') {
            <!-- EDIT MODE -->
            <form [formGroup]="adminForm" class="flex flex-col gap-5 text-xs font-sans">
              <!-- Client Edit Details -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label for="fullName" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nombre Completo</label>
                  <input 
                    type="text" 
                    id="fullName"
                    formControlName="fullName"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label for="email" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="email"
                    formControlName="email"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label for="phone" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Teléfono (WhatsApp)</label>
                  <input 
                    type="text" 
                    id="phone"
                    formControlName="phone"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs font-mono"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label for="status" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Estado de Pago</label>
                  <select 
                    id="status"
                    formControlName="status"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="CREATED">CREATED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="VOIDED">VOIDED</option>
                  </select>
                </div>
              </div>

              <!-- Address config -->
              <div class="flex flex-col gap-1.5">
                <label for="address" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Dirección de Envío</label>
                <input 
                  type="text" 
                  id="address"
                  formControlName="address"
                  class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                />
              </div>

              <!-- City and Country config -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label for="city" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Ciudad / Municipio</label>
                  <input 
                    type="text" 
                    id="city"
                    formControlName="city"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label for="country" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">País</label>
                  <input 
                    type="text" 
                    id="country"
                    formControlName="country"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                  />
                </div>
              </div>

              <!-- Disclaimer for APPROVED or PENDING orders -->
              @if (ord.status === 'APPROVED' || ord.status === 'PENDING') {
                <div class="p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-300 flex items-start gap-2.5 leading-relaxed">
                  <span class="material-symbols-outlined text-blue-400 select-none text-[18px]">info</span>
                  <div class="flex flex-col gap-0.5">
                    <strong class="text-xs text-blue-200">Restricción de Logística y Pago</strong>
                    <span class="text-[10px] text-neutral-400">
                      Dado que este pedido se encuentra en estado <strong class="text-blue-300 font-mono">{{ ord.status }}</strong> (el pago ya fue procesado o está en trámite), no es posible alterar la cantidad total de prendas ni añadir/eliminar artículos. Sin embargo, puedes modificar la talla, la edición/color y el género de cada prenda inline.
                    </span>
                  </div>
                </div>
              }

              <!-- Disclaimer for CREATED/draft orders -->
              @if (ord.status !== 'APPROVED' && ord.status !== 'PENDING') {
                <div class="p-3.5 rounded-xl border border-gold-aged/20 bg-gold-aged/5 text-gold-light flex items-start gap-2.5 leading-relaxed">
                  <span class="material-symbols-outlined text-gold-aged select-none text-[18px]">edit_note</span>
                  <div class="flex flex-col gap-0.5">
                    <strong class="text-xs text-gold-light">Pedido en Estado de Borrador</strong>
                    <span class="text-[10px] text-neutral-400">
                      Este pedido se encuentra en estado <strong class="text-gold-aged font-mono">{{ ord.status }}</strong>. Tienes total libertad para añadir prendas, eliminar artículos, cambiar cantidades, tallas y ediciones de las prendas.
                    </span>
                  </div>
                </div>
              }

              <!-- Section: Add garment to order (Only if NOT APPROVED and NOT PENDING) -->
              @if (ord.status !== 'APPROVED' && ord.status !== 'PENDING') {
                <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 animate-fade-in">
                  <span class="text-[10px] font-bold text-gold-aged tracking-wider uppercase block">Agregar Prenda al Pedido</span>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Edición / Color</label>
                      <select 
                        [value]="currentEditItemVersion()"
                        (change)="onEditItemVersionChange($event)"
                        class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                      >
                        <option value="oro_vivo">Oro Vivo</option>
                        <option value="edicion_secreta">Edición Negra</option>
                      </select>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Talla</label>
                      <select 
                        [value]="currentEditItemSize()"
                        (change)="onEditItemSizeChange($event)"
                        class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer font-serif"
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Género</label>
                      <select 
                        [value]="currentEditItemGender()"
                        (change)="onEditItemGenderChange($event)"
                        class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                      >
                        <option value="Unisex">Unisex</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                      </select>
                    </div>
                    <div class="flex flex-col gap-1.5">
                      <label class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Cantidad</label>
                      <div class="flex gap-2">
                        <input 
                          type="number" 
                          [value]="currentEditItemQuantity()"
                          (input)="onEditItemQuantityInput($event)"
                          min="1"
                          max="10"
                          class="flex-1 px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                        />
                        <button 
                          type="button"
                          (click)="addGarmentToEditOrder()"
                          class="px-4 py-2.5 bg-gold-aged/10 hover:bg-gold-aged/20 border border-gold-aged/20 text-gold-aged hover:text-white font-bold rounded-xl text-xs transition-colors duration-200 cursor-pointer"
                        >
                          + Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Section: Current items list -->
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
                <span class="text-[10px] font-bold text-gold-aged tracking-wider uppercase block">Prendas en este Pedido</span>
                
                @if (editOrderItems().length === 0) {
                  <div class="text-neutral-500 text-center py-4 italic text-[11px]">
                    No hay prendas en este pedido. Agrega al menos una arriba.
                  </div>
                } @else {
                  <div class="flex flex-col gap-3 max-h-56 overflow-y-auto divide-y divide-white/5">
                    @for (it of editOrderItems(); track $index) {
                      <div class="flex justify-between items-start py-2.5 gap-4">
                        <div class="flex flex-col gap-2 flex-1">
                          <div class="flex flex-wrap gap-2 items-center">
                            <!-- Selector de Edición inline -->
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">Edición</span>
                              <select 
                                [value]="it.version"
                                (change)="updateEditItemField($index, 'version', $event)"
                                class="px-2 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-white text-[10px] focus:outline-none focus:border-gold-aged/40 cursor-pointer"
                              >
                                <option value="oro_vivo">Oro Vivo</option>
                                <option value="edicion_secreta">Edición Negra</option>
                              </select>
                            </div>

                            <!-- Selector de Talla inline -->
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">Talla</span>
                              <select 
                                [value]="it.size"
                                (change)="updateEditItemField($index, 'size', $event)"
                                class="px-2 py-1.5 bg-neutral-955 border border-white/10 rounded-lg text-white text-[10px] font-serif focus:outline-none focus:border-gold-aged/40 cursor-pointer"
                              >
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                              </select>
                            </div>

                            <!-- Selector de Género inline -->
                            <div class="flex flex-col gap-1">
                              <span class="text-[8px] text-neutral-500 font-bold uppercase tracking-wider">Género</span>
                              <select 
                                [value]="it.gender"
                                (change)="updateEditItemField($index, 'gender', $event)"
                                class="px-2 py-1.5 bg-neutral-955 border border-white/10 rounded-lg text-white text-[10px] focus:outline-none focus:border-gold-aged/40 cursor-pointer"
                              >
                                <option value="Unisex">Unisex</option>
                                <option value="Hombre">Hombre</option>
                                <option value="Mujer">Mujer</option>
                              </select>
                            </div>
                          </div>

                          @if (it.serialNumbers && it.serialNumbers.length > 0) {
                            <span class="text-[9px] text-gold-aged font-mono block">Serials: {{ it.serialNumbers.join(' | ') }}</span>
                          }
                        </div>

                        <div class="flex items-center gap-3 self-center">
                          <span class="font-mono text-white text-xs font-bold whitespace-nowrap bg-neutral-900 border border-white/5 px-2 py-1 rounded">Cant: {{ it.quantity }}</span>
                          
                          <!-- Delete button only if NOT APPROVED and NOT PENDING -->
                          @if (ord.status !== 'APPROVED' && ord.status !== 'PENDING') {
                            <button 
                              type="button"
                              (click)="removeGarmentFromEditOrder($index)"
                              class="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-150 cursor-pointer border border-transparent hover:border-red-500/20"
                              title="Eliminar prenda"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-240v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-220h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/></svg>
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Notes -->
              <div class="flex flex-col gap-1.5">
                <label for="adminNotes" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Notas Administrativas Internas</label>
                <textarea 
                  id="adminNotes"
                  formControlName="adminNotes"
                  rows="2"
                  placeholder="Escribe comentarios internos sobre el despacho, cambios, etc..."
                  class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs resize-none"
                ></textarea>
              </div>

              <!-- Bottom Modal Actions Buttons -->
              <div class="flex gap-3 pt-4 border-t border-white/5 justify-end">
                <button 
                  type="button"
                  (click)="closeModal()"
                  class="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-[10px] tracking-wider uppercase transition-colors duration-200 cursor-pointer text-center"
                >
                  Cerrar
                </button>

                <button 
                  type="button"
                  [disabled]="saveLoading() || editOrderItems().length === 0"
                  (click)="saveChanges()"
                  class="px-6 py-3 rounded-xl bg-gold-aged hover:bg-gold-light disabled:bg-neutral-800 text-matte-black disabled:text-neutral-500 font-sans font-extrabold tracking-wider text-[10px] uppercase transition-all duration-200 cursor-pointer text-center flex justify-center items-center gap-1.5 shadow"
                >
                  @if (saveLoading()) {
                    <div class="w-3.5 h-3.5 border-2 border-matte-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  } @else {
                    <span>Guardar Cambios</span>
                  }
                </button>
              </div>
            </form>
          } @else if (selectedOrderMode() === 'shipping') {
            <!-- SHIPPING MODE -->
            <form [formGroup]="adminForm" class="flex flex-col gap-5 text-xs font-sans">
              <!-- Shipping and Tracking Details -->
              <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
                <span class="text-[10px] font-bold text-gold-aged tracking-wider uppercase block">Logística de Despacho</span>
                
                <div class="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isShipped"
                    formControlName="isShipped"
                    class="w-4 h-4 rounded border-white/10 bg-neutral-900 text-gold-aged focus:ring-0 focus:outline-none cursor-pointer"
                  />
                  <label for="isShipped" class="text-xs text-white font-bold cursor-pointer">Marcar como Despachado</label>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label for="carrier" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Transportadora</label>
                    <input 
                      type="text" 
                      id="carrier"
                      formControlName="carrier"
                      placeholder="Ej: Servientrega, Coordinadora..."
                      class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                    />
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <label for="trackingNumber" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Número de Guía</label>
                    <input 
                      type="text" 
                      id="trackingNumber"
                      formControlName="trackingNumber"
                      placeholder="Ej: 912345678"
                      class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <!-- Notes -->
              <div class="flex flex-col gap-1.5">
                <label for="adminNotes" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Notas Administrativas Internas</label>
                <textarea 
                  id="adminNotes"
                  formControlName="adminNotes"
                  rows="2"
                  placeholder="Escribe comentarios internos sobre el despacho, cambios, etc..."
                  class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs resize-none"
                ></textarea>
              </div>

              <!-- Alerts for Manual Notification -->
              @if (emailSuccess()) {
                <div class="p-3 rounded-lg bg-green-500/10 border border-green-500/25 text-green-400 font-bold text-[10px] uppercase tracking-wide text-center">
                  ✓ Correo de Notificación de Despacho Enviado con Éxito
                </div>
              }
              @if (emailError()) {
                <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-[10px] uppercase tracking-wide text-center">
                  ⚠ {{ emailError() }}
                </div>
              }

              <!-- Bottom Modal Actions Buttons -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  (click)="closeModal()"
                  class="w-full sm:w-1/4 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-[10px] tracking-wider uppercase transition-colors duration-200 cursor-pointer text-center"
                >
                  Cerrar
                </button>

                <!-- Optional manual notify mail button -->
                @if (ord.isShipped) {
                  <button 
                    type="button"
                    (click)="sendManualEmail(ord.id)"
                    [disabled]="emailSending()"
                    class="w-full sm:w-2/5 py-3 rounded-xl border border-gold-aged/20 hover:border-gold-aged bg-gold-aged/5 hover:bg-gold-aged/10 text-gold-aged font-sans font-bold text-[10px] tracking-wider uppercase transition-all duration-200 cursor-pointer text-center flex justify-center items-center gap-1.5"
                  >
                    @if (emailSending()) {
                      <div class="w-3.5 h-3.5 border-2 border-gold-aged border-t-transparent rounded-full animate-spin"></div>
                      <span>Notificando Correo...</span>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T920-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-668v428h640v-428L480-440Zm0-80 320-200H160l320 200ZM160-668v-52 480-428Z"/></svg>
                      <span>Notificar Despacho</span>
                    }
                  </button>
                }

                <button 
                  type="button"
                  [disabled]="saveLoading()"
                  (click)="saveChanges()"
                  class="w-full sm:flex-1 py-3 rounded-xl bg-gold-aged hover:bg-gold-light disabled:bg-neutral-800 text-matte-black disabled:text-neutral-500 font-sans font-extrabold tracking-wider text-[10px] uppercase transition-all duration-200 cursor-pointer text-center flex justify-center items-center gap-1.5 shadow"
                >
                  @if (saveLoading()) {
                    <div class="w-3.5 h-3.5 border-2 border-matte-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  } @else {
                    <span>Guardar Cambios</span>
                  }
                </button>
              </div>
            </form>
          } @else if (selectedOrderMode() === 'bold') {
            <!-- BOLD MODE -->
            <div class="flex flex-col gap-5 text-xs font-sans">
              @if (ord.payment_id) {
                <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3 text-xs">
                  <div class="flex justify-between items-center">
                    <span class="text-[10px] font-bold text-gold-aged tracking-wider uppercase block">Detalle de Transacción Bold</span>
                    @if (ord.status === 'APPROVED') {
                      <button 
                        type="button"
                        (click)="syncBoldTransaction(ord.id, ord.payment_id)"
                        [disabled]="syncBoldLoading()"
                        class="px-3 py-1 rounded bg-gold-aged/10 border border-gold-aged/20 hover:border-gold-aged text-gold-aged font-bold text-[9px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                      >
                        @if (syncBoldLoading()) {
                          <div class="w-2.5 h-2.5 border-2 border-gold-aged border-t-transparent rounded-full animate-spin"></div>
                          <span>Sincronizando...</span>
                        } @else {
                          <svg xmlns="http://www.w3.org/2000/svg" height="10" viewBox="0 -960 960 960" width="10" fill="currentColor"><path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 126.5 27T710-696v-104h80v240H550v-80h124q-32-46-82-73t-112-27q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 108-115.5 176T480-160Z"/></svg>
                          <span>Sincronizar</span>
                        }
                      </button>
                    }
                  </div>
                  
                  @if (syncSuccess()) {
                    <span class="text-[10px] text-green-400 font-bold block">✓ Sincronizado exitosamente con Bold.</span>
                  }
                  @if (syncError()) {
                    <span class="text-[10px] text-red-400 font-bold block">⚠ {{ syncError() }}</span>
                  }

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-400">
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[9px] uppercase tracking-wider block text-neutral-500">ID de Pago (Bold)</span>
                      <span class="font-mono text-white select-all">{{ ord.payment_id }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[9px] uppercase tracking-wider block text-neutral-500">Método de Pago</span>
                      <span class="text-white">{{ ord.payment_method || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[9px] uppercase tracking-wider block text-neutral-500">Código de Respuesta</span>
                      <span class="font-mono text-white">{{ ord.bold_code || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[9px] uppercase tracking-wider block text-neutral-500">Fecha de Pago</span>
                      <span class="text-white">{{ ord.boldUpdatedAt ? (ord.boldUpdatedAt | date:'medium') : 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[9px] uppercase tracking-wider block text-neutral-500">ID de Comercio</span>
                      <span class="font-mono text-white">{{ ord.merchant_id || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[9px] uppercase tracking-wider block text-neutral-500">Integración</span>
                      <span class="text-white">{{ ord.integration || 'N/A' }}</span>
                    </div>
                  </div>

                  @if (ord.card) {
                    <div class="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
                      <span class="text-[9px] uppercase tracking-wider block text-neutral-500">Tarjeta Utilizada</span>
                      <div class="text-[11px] text-white font-mono flex flex-wrap gap-x-4 gap-y-1">
                        @if (ord.card.brand) {
                          <span><strong class="text-neutral-500">Franquicia:</strong> {{ ord.card.brand }}</span>
                        }
                        @if (ord.card.last4 || ord.card.number) {
                          <span><strong class="text-neutral-500">Número:</strong> **** {{ ord.card.last4 || ord.card.number }}</span>
                        }
                        @if (ord.card.holder_name || ord.card.holderName) {
                          <span><strong class="text-neutral-500">Titular:</strong> {{ ord.card.holder_name || ord.card.holderName }}</span>
                        }
                        @if (ord.card.card_type || ord.card.cardType) {
                          <span><strong class="text-neutral-500">Tipo:</strong> {{ ord.card.card_type || ord.card.cardType }}</span>
                        }
                      </div>
                    </div>
                  }

                  <!-- Impuestos (Taxes) Section -->
                  <div class="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1.5">
                    <span class="text-[9px] uppercase tracking-wider block text-neutral-500">Impuestos (Taxes)</span>
                    
                    @if (ord.taxes && ord.taxes.length > 0) {
                      <div class="flex flex-col gap-1.5">
                        @for (tax of ord.taxes; track $index) {
                          <div class="flex justify-between items-center bg-white/[0.02] border border-white/5 px-3 py-2 rounded-xl text-[11px] text-white">
                            <span>Tipo: <strong class="text-gold-aged font-bold">{{ tax.type }}</strong></span>
                            <span>Valor: <strong class="text-white font-mono">{{ tax.value | currency:'COP':'symbol-narrow':'1.0-0' }}</strong></span>
                          </div>
                        }
                      </div>
                    } @else {
                      @if (!showAddTaxForm()) {
                        <div class="flex flex-col gap-2">
                          <span class="text-[10px] text-neutral-400 italic">No hay impuestos configurados.</span>
                          <button
                            type="button"
                            (click)="showAddTaxForm.set(true)"
                            class="w-max px-3 py-1.5 rounded-lg border border-gold-aged/20 hover:border-gold-aged bg-gold-aged/5 hover:bg-gold-aged/10 text-gold-aged font-sans font-bold text-[9px] uppercase tracking-wider transition-all duration-200 cursor-pointer"
                          >
                            Agregar Impuesto
                          </button>
                        </div>
                      } @else {
                        <div class="flex flex-col gap-2.5 p-3 rounded-xl bg-white/[0.01] border border-white/5">
                          <span class="text-[10px] font-bold text-white uppercase tracking-wider">Configurar Impuesto</span>
                          
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div class="flex flex-col gap-1">
                              <label class="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Tipo (Type)</label>
                              <input 
                                type="text"
                                [value]="taxTypeInput()"
                                (input)="onTaxTypeInput($event)"
                                class="px-2.5 py-1.5 bg-neutral-900 border border-white/10 rounded-lg focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                                placeholder="Ej. VAT"
                              />
                            </div>
                            <div class="flex flex-col gap-1">
                              <label class="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Valor (Value)</label>
                              <input 
                                type="number"
                                [value]="taxValueInput() !== null ? taxValueInput() : ''"
                                (input)="onTaxValueInput($event)"
                                class="px-2.5 py-1.5 bg-neutral-900 border border-white/10 rounded-lg focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                                placeholder="Ej. 4831"
                              />
                            </div>
                          </div>

                          @if (taxError()) {
                            <span class="text-[10px] text-red-400 font-bold block">⚠ {{ taxError() }}</span>
                          }

                          <div class="flex gap-2 justify-end mt-1">
                            <button
                              type="button"
                              (click)="cancelAddTax()"
                              class="px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-[9px] uppercase tracking-wider transition-colors duration-200 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              [disabled]="saveTaxLoading()"
                              (click)="saveTax(ord.id)"
                              class="px-2.5 py-1.5 rounded-lg bg-gold-aged hover:bg-gold-light disabled:bg-neutral-800 text-matte-black disabled:text-neutral-500 font-bold text-[9px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1"
                            >
                              @if (saveTaxLoading()) {
                                <div class="w-2.5 h-2.5 border border-matte-black border-t-transparent rounded-full animate-spin"></div>
                                <span>Guardando...</span>
                              } @else {
                                <span>Guardar Impuesto</span>
                              }
                            </button>
                          </div>
                        </div>
                      }
                    }
                  </div>

                  @if (ord.bold_metadata) {
                    <div class="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
                      <div class="flex justify-between items-center cursor-pointer select-none" (click)="toggleMetadataCollapsed()">
                        <span class="text-[9px] uppercase tracking-wider block text-neutral-500">Metadata de Bold (Notificación)</span>
                        <span class="text-[9px] text-gold-aged font-bold uppercase tracking-wider hover:text-gold-light">{{ showMetadata() ? 'Ocultar' : 'Ver Detalle' }}</span>
                      </div>
                      @if (showMetadata()) {
                        <pre class="bg-black/40 border border-white/5 p-3 rounded-xl text-[9px] font-mono text-neutral-400 overflow-x-auto max-h-48 leading-relaxed mt-1 select-text">{{ ord.bold_metadata | json }}</pre>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="p-6 text-center text-neutral-500 bg-white/[0.01] rounded-xl border border-white/5 italic">
                  Este pedido no posee un identificador de pago asociado a Bold.
                </div>
              }

              <!-- Bottom Close Action -->
              <div class="flex gap-3 pt-4 border-t border-white/5 justify-end">
                <button 
                  type="button"
                  (click)="closeModal()"
                  class="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-[10px] tracking-wider uppercase transition-colors duration-200 cursor-pointer text-center"
                >
                  Cerrar
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <!-- MANUAL ORDER CREATION MODAL -->
    @if (showManualOrderModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-matte-black/95 backdrop-blur-md">
        <!-- Backdrop close -->
        <div class="absolute inset-0 cursor-pointer" (click)="closeManualOrderModal()"></div>

        <div class="relative max-w-2xl w-full bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto">
          
          <!-- Close button -->
          <button 
            (click)="closeManualOrderModal()"
            class="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full border border-white/10 hover:border-gold-aged/40 bg-white/5 hover:bg-gold-aged/10 text-neutral-400 hover:text-gold-aged flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
          </button>

          <!-- Modal Header -->
          <div class="border-b border-white/5 pb-4">
            <span class="text-[9px] font-bold text-gold-aged tracking-[0.2em] uppercase font-mono">CREAR NUEVO PEDIDO</span>
            <h3 class="font-serif text-xl sm:text-2xl font-black text-white">Ingreso de Pedido Manual</h3>
          </div>

          <!-- Form -->
          <form [formGroup]="manualOrderForm" (ngSubmit)="createManualOrder()" class="flex flex-col gap-5 text-xs font-sans">
            
            <!-- Error message if any -->
            @if (manualOrderError()) {
              <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-[10px] uppercase tracking-wide text-center">
                ⚠ {{ manualOrderError() }}
              </div>
            }

            <!-- Group 1: Client Information -->
            <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
              <span class="text-[10px] font-bold text-gold-aged tracking-wider uppercase block">Información del Cliente</span>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label for="manualFullName" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nombre Completo</label>
                  <input 
                    type="text" 
                    id="manualFullName"
                    formControlName="fullName"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                    placeholder="Ej. Aura Figueroa"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label for="manualEmail" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Correo Electrónico</label>
                  <input 
                    type="email" 
                    id="manualEmail"
                    formControlName="email"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                    placeholder="Ej. aura@example.com"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label for="manualPhone" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Teléfono de Contacto</label>
                  <input 
                    type="text" 
                    id="manualPhone"
                    formControlName="phone"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                    placeholder="Ej. 3106279792"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label for="manualAddress" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Dirección de Envío</label>
                  <input 
                    type="text" 
                    id="manualAddress"
                    formControlName="address"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                    placeholder="Ej. Calle 10 # 5-20"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label for="manualCity" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Ciudad / Municipio</label>
                  <input 
                    type="text" 
                    id="manualCity"
                    formControlName="city"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                    placeholder="Ej. Cartagena"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label for="manualCountry" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">País</label>
                  <input 
                    type="text" 
                    id="manualCountry"
                    formControlName="country"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                    placeholder="Ej. Colombia"
                  />
                </div>
              </div>
            </div>

            <!-- Group 2: Product Configuration -->
            <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
              <span class="text-[10px] font-bold text-gold-aged tracking-wider uppercase block">Agregar Prenda al Pedido</span>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Edición / Color</label>
                  <select 
                    [value]="currentManualItemVersion()"
                    (change)="onManualItemVersionChange($event)"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                  >
                    <option value="oro_vivo">Oro Vivo</option>
                    <option value="edicion_secreta">Edición Negra</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Talla</label>
                  <select 
                    [value]="currentManualItemSize()"
                    (change)="onManualItemSizeChange($event)"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Género</label>
                  <select 
                    [value]="currentManualItemGender()"
                    (change)="onManualItemGenderChange($event)"
                    class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                  </select>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Cantidad</label>
                  <div class="flex gap-2">
                    <input 
                      type="number" 
                      [value]="currentManualItemQuantity()"
                      (input)="onManualItemQuantityInput($event)"
                      min="1"
                      max="10"
                      class="flex-1 px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
                    />
                    <button 
                      type="button"
                      (click)="addGarmentToManualOrder()"
                      class="px-4 py-2.5 bg-gold-aged/10 hover:bg-gold-aged/20 border border-gold-aged/20 text-gold-aged hover:text-white font-bold rounded-xl text-xs transition-colors duration-200 cursor-pointer"
                    >
                      + Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Group 2.5: Resumen de Prendas Agregadas -->
            <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3">
              <span class="text-[10px] font-bold text-gold-aged tracking-wider uppercase block">Prendas en este Pedido</span>
              
              @if (manualOrderItems().length === 0) {
                <div class="text-neutral-500 text-center py-4 italic text-[11px]">
                  No se han agregado prendas a este pedido. Agrega al menos una arriba.
                </div>
              } @else {
                <div class="flex flex-col gap-2 max-h-40 overflow-y-auto divide-y divide-white/5">
                  @for (it of manualOrderItems(); track $index) {
                    <div class="flex justify-between items-center py-2">
                      <div class="flex flex-col gap-0.5">
                        <span class="font-bold text-white uppercase">{{ it.version === 'oro_vivo' ? 'Oro Vivo' : 'Edición Negra' }}</span>
                        <span class="text-[10px] text-neutral-400">Talla: {{ it.size }} | Género: {{ it.gender }}</span>
                      </div>
                      <div class="flex items-center gap-4">
                        <span class="font-mono text-white text-xs font-bold">Cant: {{ it.quantity }}</span>
                        <button 
                          type="button"
                          (click)="removeGarmentFromManualOrder($index)"
                          class="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors duration-150 cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-240v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-220h80v-360h-80v360Zm160 0h80v-360h-80v360Z"/></svg>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>

            <!-- Group 3: Order Settings -->
            <div class="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-4">
              <span class="text-[10px] font-bold text-gold-aged tracking-wider uppercase block">Configuración de Pedido</span>
              
              <div class="flex flex-col gap-1.5">
                <label for="manualStatus" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Estado de Pago</label>
                <select 
                  id="manualStatus"
                  formControlName="status"
                  class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                >
                  <option value="APPROVED">APPROVED (Contará como vendido)</option>
                  <option value="CREATED">CREATED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="VOIDED">VOIDED</option>
                </select>
              </div>

              <div class="flex flex-col gap-1.5">
                <label for="manualAdminNotes" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Notas Administrativas / Observaciones</label>
                <textarea 
                  id="manualAdminNotes"
                  formControlName="adminNotes"
                  rows="2"
                  placeholder="Observaciones o notas internas del pedido..."
                  class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="flex gap-3 pt-2 justify-end">
              <button 
                type="button"
                (click)="closeManualOrderModal()"
                class="px-5 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                [disabled]="manualOrderLoading() || manualOrderForm.invalid || manualOrderItems().length === 0"
                class="px-6 py-3 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                @if (manualOrderLoading()) {
                  <div class="w-3.5 h-3.5 border-2 border-matte-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando...</span>
                } @else {
                  <span>Crear Pedido</span>
                }
              </button>
            </div>

          </form>

        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    select option {
      background-color: #111111 !important;
      color: #ffffff !important;
    }
  `]
})
export class BackofficeComponent implements OnInit {
  readonly dropLimit = environment.dropLimit;
  private readonly firebaseService = inject(FirebaseService);
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);

  readonly isAuthenticated = signal<boolean>(false);
  readonly activeTab = signal<TabMode>('dashboard');

  // Login variables
  readonly password = signal<string>('');
  readonly loginLoading = signal<boolean>(false);
  readonly loginError = signal<string>('');

  // Orders list search & filters
  readonly searchQuery = signal<string>('');
  readonly statusFilter = signal<string>('all');
  readonly shippingFilter = signal<string>('all');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // Modal and details
  readonly selectedOrder = signal<Order | null>(null);
  readonly selectedOrderMode = signal<'edit' | 'shipping' | 'bold' | null>(null);
  readonly editOrderItems = signal<OrderItem[]>([]);
  readonly currentEditItemVersion = signal<'oro_vivo' | 'edicion_secreta'>('oro_vivo');
  readonly currentEditItemSize = signal<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  readonly currentEditItemGender = signal<string>('Unisex');
  readonly currentEditItemQuantity = signal<number>(1);
  readonly saveLoading = signal<boolean>(false);

  // Email shipment state
  readonly emailSending = signal<boolean>(false);
  readonly emailSuccess = signal<boolean>(false);
  readonly emailError = signal<string>('');

  // Bold sync state
  readonly syncBoldLoading = signal<boolean>(false);
  readonly syncSuccess = signal<boolean>(false);
  readonly syncError = signal<string>('');
  readonly showMetadata = signal<boolean>(false);

  // Taxes addition state
  readonly showAddTaxForm = signal<boolean>(false);
  readonly taxTypeInput = signal<string>('VAT');
  readonly taxValueInput = signal<number | null>(null);
  readonly saveTaxLoading = signal<boolean>(false);
  readonly taxError = signal<string>('');

  // Admin Reactive Form
  readonly adminForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    country: ['', [Validators.required]],
    version: ['oro_vivo', [Validators.required]],
    size: ['M', [Validators.required]],
    gender: ['Unisex', [Validators.required]],
    status: ['CREATED', [Validators.required]],
    isShipped: [false],
    carrier: [''],
    trackingNumber: [''],
    adminNotes: ['']
  });

  // Manual Order Creation State
  readonly showManualOrderModal = signal<boolean>(false);
  readonly manualOrderLoading = signal<boolean>(false);
  readonly manualOrderError = signal<string>('');
  readonly manualOrderItems = signal<OrderItem[]>([]);

  // Current item being configured in manual order modal
  readonly currentManualItemVersion = signal<'oro_vivo' | 'edicion_secreta'>('oro_vivo');
  readonly currentManualItemSize = signal<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  readonly currentManualItemGender = signal<string>('Unisex');
  readonly currentManualItemQuantity = signal<number>(1);

  readonly manualOrderForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    country: ['', [Validators.required]],
    status: ['APPROVED', [Validators.required]],
    adminNotes: ['']
  });

  ngOnInit(): void {
    // Check if there is an active session stored in the browser
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('osaneli_admin_token');
      if (storedToken) {
        try {
          const decoded = atob(storedToken);
          if (decoded.startsWith('OSANELI-ADMIN-SESSION-')) {
            this.isAuthenticated.set(true);
          }
        } catch (e) {
          localStorage.removeItem('osaneli_admin_token');
        }
      }
    }
  }

  onPasswordInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.password.set(input.value);
    this.loginError.set('');
  }

  onSearchQueryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value.toLowerCase().trim());
    this.currentPage.set(1);
  }

  onShippingFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.shippingFilter.set(select.value);
    this.currentPage.set(1);
  }

  setStatusFilter(st: string): void {
    this.statusFilter.set(st);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    const totalPages = this.paginationInfo().totalPages;
    if (page >= 1 && page <= totalPages) {
      this.currentPage.set(page);
    }
  }

  async login(): Promise<void> {
    const passwordVal = this.password().trim();
    if (!passwordVal) return;

    this.loginLoading.set(true);
    this.loginError.set('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordVal })
      });
      const data = await response.json();
      if (response.ok && data.success && data.token) {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('osaneli_admin_token', data.token);
        }
        this.isAuthenticated.set(true);
        this.password.set('');
      } else {
        this.loginError.set(data.error || 'Contraseña incorrecta.');
      }
    } catch (err) {
      console.error('Network error during authentication:', err);
      this.loginError.set('Error de red al intentar conectar con el servidor.');
    } finally {
      this.loginLoading.set(false);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('osaneli_admin_token');
    }
    this.isAuthenticated.set(false);
    this.activeTab.set('dashboard');
  }

  // Reactive Computed stats for the dashboard overview
  readonly stats = computed(() => {
    const orders = this.firebaseService.orders();
    // Only count approved orders starting with "OSN" for inventory metrics
    const approvedOsnOrders = orders.filter(o => o.status === 'APPROVED' && o.id.toUpperCase().startsWith('OSN'));
    
    // Total units sold across all items in approved orders
    let totalItemsSold = 0;
    let oroVivo = 0;
    let edicionSecreta = 0;
    
    const sizes: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    const genders: Record<string, number> = { Hombre: 0, Mujer: 0, Unisex: 0 };
    
    approvedOsnOrders.forEach(o => {
      const items = o.items || [];
      items.forEach(it => {
        const qty = Number(it.quantity || 1);
        totalItemsSold += qty;
        
        if (it.version === 'oro_vivo') {
          oroVivo += qty;
        } else {
          edicionSecreta += qty;
        }
        
        const sz = it.size || 'M';
        if (sizes[sz] !== undefined) {
          sizes[sz] += qty;
        }
        
        const g = it.gender || 'Unisex';
        if (genders[g] !== undefined) {
          genders[g] += qty;
        }
      });
    });
    
    const totalSales = totalItemsSold * environment.productPrice;
    
    // Bold Commission calculations: Sum of all taxes in approved orders
    let totalBoldCommission = 0;
    approvedOsnOrders.forEach(o => {
      if (o.taxes && Array.isArray(o.taxes)) {
        o.taxes.forEach(t => {
          totalBoldCommission += Number(t.value || 0);
        });
      }
    });

    const boldRatePercentage = 'N/A';

    // Production Cost: $100.000 COP per shirt
    const productionCost = totalItemsSold * 100000;

    // Utility: Total Sales - Total Bold Commission - Production Cost
    const utility = totalSales - totalBoldCommission - productionCost;

    // Total drafts (borradores)
    const totalDrafts = orders.filter(o => o.status === 'CREATED' || o.status === 'PENDING').length;

    const pct = (val: number) => totalItemsSold > 0 ? Math.round((val / totalItemsSold) * 100) : 0;

    return {
      totalSalesFormatted: totalSales.toLocaleString('es-CO'),
      totalItemsSold,
      remainingStock: Math.max(0, environment.dropLimit - totalItemsSold),
      totalDrafts,
      
      // New Financial Fields
      boldCommissionRate: boldRatePercentage,
      boldCommissionFormatted: Math.round(totalBoldCommission).toLocaleString('es-CO'),
      productionCostFormatted: productionCost.toLocaleString('es-CO'),
      utilityFormatted: Math.round(utility).toLocaleString('es-CO'),
      editions: {
        oroVivo,
        edicionSecreta,
        oroVivoPct: pct(oroVivo),
        edicionSecretaPct: pct(edicionSecreta)
      },
      sizes,
      sizesPct: {
        S: pct(sizes['S']),
        M: pct(sizes['M']),
        L: pct(sizes['L']),
        XL: pct(sizes['XL']),
        XXL: pct(sizes['XXL'])
      } as Record<string, number>,
      genders,
      gendersPct: {
        Hombre: pct(genders['Hombre']),
        Mujer: pct(genders['Mujer']),
        Unisex: pct(genders['Unisex'])
      } as Record<string, number>
    };
  });

  // Reactive Computed list representing the filtered orders to manage
  readonly filteredOrders = computed(() => {
    const query = this.searchQuery();
    const stFilter = this.statusFilter();
    const shipFilter = this.shippingFilter();
    let list = this.firebaseService.orders();

    // 1. Filter by search query
    if (query) {
      list = list.filter(o => 
        o.id.toLowerCase().includes(query) ||
        o.fullName.toLowerCase().includes(query) ||
        o.email.toLowerCase().includes(query) ||
        o.phone.toLowerCase().includes(query)
      );
    }

    // 2. Filter by payment status
    if (stFilter !== 'all') {
      list = list.filter(o => o.status === stFilter);
    }

    // 3. Filter by shipping status
    if (shipFilter !== 'all') {
      const isShipped = shipFilter === 'shipped';
      list = list.filter(o => !!o.isShipped === isShipped);
    }

    // Sort order: show recent first
    return [...list].reverse();
  });

  // Paginated subset of filtered orders
  readonly paginatedOrders = computed(() => {
    const list = this.filteredOrders();
    const size = this.pageSize();
    const totalPages = Math.ceil(list.length / size) || 1;
    const page = Math.min(this.currentPage(), totalPages);
    const startIndex = (page - 1) * size;
    return list.slice(startIndex, startIndex + size);
  });

  // Pagination status details for UI controls
  readonly paginationInfo = computed(() => {
    const totalItems = this.filteredOrders().length;
    const size = this.pageSize();
    const totalPages = Math.ceil(totalItems / size) || 1;
    const page = Math.min(this.currentPage(), totalPages);
    
    const start = totalItems === 0 ? 0 : (page - 1) * size + 1;
    const end = Math.min(page * size, totalItems);

    return {
      totalItems,
      totalPages,
      currentPage: page,
      start,
      end,
      hasPrev: page > 1,
      hasNext: page < totalPages
    };
  });

  formatDate(dateObj: any): string {
    if (!dateObj) return '';
    try {
      const date = dateObj instanceof Date ? dateObj : new Date(dateObj);
      return date.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  calculateTotal(qty: number): string {
    const total = qty * environment.productPrice;
    return total.toLocaleString('es-CO');
  }

  getWhatsAppLink(order: Order): string {
    let phone = (order.phone || '').trim();
    phone = phone.replace(/\D/g, '');
    if (phone.length === 10 && !phone.startsWith('57')) {
      phone = '57' + phone;
    }

    // Dynamic checkout URL construction using origin matching
    let originUrl = 'https://orovivo.osaneli.com';
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      originUrl = window.location.origin;
    }
    const checkoutLink = `${originUrl}/order?id=${order.id}`;

    const text = `¡Hola! 👋 Te escribimos de Osaneli.\n\nNotamos que te interesaste en nuestra camiseta de la colección Oro Vivo 🇨🇴✨ para apoyar a la Selección, pero no alcanzaste a completar tu pago.\n\nPuedes completar tu pago ingresando al siguiente enlace:\n${checkoutLink}\n\nQueremos asegurarnos de que no te quedes sin la tuya, ya que las unidades de este drop son limitadas y el próximo partido está cerca. ⚽🔥\n\n¿Tuviste algún problema con la plataforma?`;

    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  }

  openOrderModal(order: Order, mode: 'edit' | 'shipping' | 'bold'): void {
    this.selectedOrder.set(order);
    this.selectedOrderMode.set(mode);
    this.emailSuccess.set(false);
    this.emailError.set('');
    this.syncSuccess.set(false);
    this.syncError.set('');
    this.showMetadata.set(false);
    
    if (order.items && order.items.length > 0) {
      this.editOrderItems.set(order.items.map(it => ({ ...it, serialNumbers: it.serialNumbers ? [...it.serialNumbers] : [] })));
    } else {
      this.editOrderItems.set([{
        version: order.version || 'oro_vivo',
        size: order.size || 'M',
        gender: order.gender || 'Unisex',
        quantity: order.quantity || 1,
        serialNumbers: order.serialNumber ? [order.serialNumber] : []
      }]);
    }
    this.currentEditItemVersion.set('oro_vivo');
    this.currentEditItemSize.set('M');
    this.currentEditItemGender.set('Unisex');
    this.currentEditItemQuantity.set(1);

    this.adminForm.patchValue({
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city || '',
      country: order.country || '',
      version: order.version || 'oro_vivo',
      size: order.size || 'M',
      gender: order.gender || 'Unisex',
      status: order.status,
      isShipped: !!order.isShipped,
      carrier: order.carrier || '',
      trackingNumber: order.trackingNumber || '',
      adminNotes: order.adminNotes || ''
    });
  }

  closeModal(): void {
    this.selectedOrder.set(null);
    this.selectedOrderMode.set(null);
    this.editOrderItems.set([]);
    this.emailSuccess.set(false);
    this.emailError.set('');
    this.syncSuccess.set(false);
    this.syncError.set('');
    this.showMetadata.set(false);
  }

  onEditItemVersionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentEditItemVersion.set(select.value as 'oro_vivo' | 'edicion_secreta');
  }

  onEditItemSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentEditItemSize.set(select.value as 'S' | 'M' | 'L' | 'XL' | 'XXL');
  }

  onEditItemGenderChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentEditItemGender.set(select.value);
  }

  onEditItemQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentEditItemQuantity.set(Math.max(1, Number(input.value || 1)));
  }

  addGarmentToEditOrder(): void {
    const version = this.currentEditItemVersion();
    const size = this.currentEditItemSize();
    const gender = this.currentEditItemGender();
    const qty = this.currentEditItemQuantity();

    const currentList = this.editOrderItems();
    const existingIndex = currentList.findIndex(it => it.version === version && it.size === size && it.gender === gender);
    if (existingIndex !== -1) {
      const updatedList = [...currentList];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        quantity: updatedList[existingIndex].quantity + qty
      };
      this.editOrderItems.set(updatedList);
    } else {
      this.editOrderItems.set([...currentList, {
        version,
        size,
        gender,
        quantity: qty,
        serialNumbers: []
      }]);
    }
    this.currentEditItemQuantity.set(1);
  }

  removeGarmentFromEditOrder(index: number): void {
    const currentList = this.editOrderItems();
    this.editOrderItems.set(currentList.filter((_, i) => i !== index));
  }

  updateEditItemField(index: number, field: 'version' | 'size' | 'gender', event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    const currentList = [...this.editOrderItems()];
    if (currentList[index]) {
      currentList[index] = {
        ...currentList[index],
        [field]: value
      };
      this.editOrderItems.set(currentList);
    }
  }

  openManualOrderModal(): void {
    this.manualOrderForm.reset({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      status: 'APPROVED',
      adminNotes: ''
    });
    this.manualOrderItems.set([]);
    this.currentManualItemVersion.set('oro_vivo');
    this.currentManualItemSize.set('M');
    this.currentManualItemGender.set('Unisex');
    this.currentManualItemQuantity.set(1);
    this.manualOrderError.set('');
    this.showManualOrderModal.set(true);
  }

  closeManualOrderModal(): void {
    this.showManualOrderModal.set(false);
  }

  onManualItemVersionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentManualItemVersion.set(select.value as 'oro_vivo' | 'edicion_secreta');
  }

  onManualItemSizeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentManualItemSize.set(select.value as 'S' | 'M' | 'L' | 'XL' | 'XXL');
  }

  onManualItemGenderChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.currentManualItemGender.set(select.value);
  }

  onManualItemQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentManualItemQuantity.set(Math.max(1, Number(input.value || 1)));
  }

  addGarmentToManualOrder(): void {
    const version = this.currentManualItemVersion();
    const size = this.currentManualItemSize();
    const gender = this.currentManualItemGender();
    const qty = this.currentManualItemQuantity();

    const currentList = this.manualOrderItems();
    const existingIndex = currentList.findIndex(it => it.version === version && it.size === size && it.gender === gender);
    if (existingIndex !== -1) {
      const updatedList = [...currentList];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        quantity: updatedList[existingIndex].quantity + qty
      };
      this.manualOrderItems.set(updatedList);
    } else {
      this.manualOrderItems.set([...currentList, {
        version,
        size,
        gender,
        quantity: qty,
        serialNumbers: []
      }]);
    }

    // Reset item quantity back to 1
    this.currentManualItemQuantity.set(1);
  }

  removeGarmentFromManualOrder(index: number): void {
    const currentList = this.manualOrderItems();
    this.manualOrderItems.set(currentList.filter((_, i) => i !== index));
  }

  generateUniqueOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const existingIds = new Set(this.firebaseService.orders().map(o => o.id.toUpperCase()));
    let code = '';
    do {
      code = 'OSN-';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (existingIds.has(code));
    return code;
  }

  async createManualOrder(): Promise<void> {
    if (this.manualOrderForm.invalid || this.manualOrderItems().length === 0) return;
    this.manualOrderLoading.set(true);
    this.manualOrderError.set('');

    const formVal = this.manualOrderForm.value;
    const items = this.manualOrderItems().map(it => ({
      version: it.version,
      size: it.size,
      gender: it.gender,
      quantity: it.quantity,
      serialNumbers: [] as string[]
    }));

    // Compute sequential serial numbers for APPROVED order items
    let nextIndex = 1;
    const orders = this.firebaseService.orders();
    const approvedOrders = orders.filter(o => o.status === 'APPROVED' && o.id?.toUpperCase().startsWith('OSN'));
    approvedOrders.forEach(o => {
      if (o.items && o.items.length > 0) {
        nextIndex += o.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      } else {
        nextIndex += (o.quantity || 1);
      }
    });

    if (formVal.status === 'APPROVED') {
      const limit = this.dropLimit || 100;
      items.forEach(it => {
        if (it.version === 'oro_vivo') {
          const serials: string[] = [];
          for (let i = 0; i < it.quantity; i++) {
            const index = nextIndex++;
            const paddedIndex = String(index).padStart(3, '0');
            const serial = `OSN-ORO-${paddedIndex}/${limit}`;
            serials.push(serial);
          }
          it.serialNumbers = serials;
        }
      });
    }

    // Find first generated serial number
    let firstSerial = '';
    const firstOroVivoItem = items.find(it => it.version === 'oro_vivo' && it.serialNumbers && it.serialNumbers.length > 0);
    if (firstOroVivoItem && firstOroVivoItem.serialNumbers && firstOroVivoItem.serialNumbers.length > 0) {
      firstSerial = firstOroVivoItem.serialNumbers[0];
    }

    // Total quantity is sum of all item quantities
    const totalQty = items.reduce((sum, it) => sum + it.quantity, 0);

    const newOrder: Order = {
      id: this.generateUniqueOrderId(),
      fullName: formVal.fullName || '',
      email: formVal.email || '',
      phone: formVal.phone || '',
      address: formVal.address || '',
      city: formVal.city || '',
      country: formVal.country || '',
      status: formVal.status as Order['status'] || 'APPROVED',
      version: items[0].version as Order['version'], // fallback compatibility
      size: items[0].size as Order['size'], // fallback compatibility
      gender: items[0].gender as Order['gender'], // fallback compatibility
      quantity: totalQty,
      items,
      serialNumber: firstSerial,
      createdAt: new Date(),
      adminNotes: formVal.adminNotes || ''
    };

    try {
      await this.firebaseService.saveOrder(newOrder);
      this.closeManualOrderModal();
    } catch (err) {
      console.error('Failed to create manual order:', err);
      this.manualOrderError.set('Error al guardar el pedido en la base de datos.');
    } finally {
      this.manualOrderLoading.set(false);
    }
  }

  async saveChanges(): Promise<void> {
    const ord = this.selectedOrder();
    if (!ord || this.adminForm.invalid) return;

    this.saveLoading.set(true);
    const formVal = this.adminForm.value;

    const items = this.editOrderItems().map(it => ({
      version: it.version,
      size: it.size,
      gender: it.gender,
      quantity: it.quantity,
      serialNumbers: (it.serialNumbers ? [...it.serialNumbers] : []) as string[]
    }));

    // Calculate sum of quantities
    const totalQty = items.reduce((sum, it) => sum + it.quantity, 0);

    // Check if items changed
    const originalItems = ord.items ? ord.items.map((it: OrderItem) => ({
      version: it.version,
      size: it.size,
      gender: it.gender,
      quantity: it.quantity,
      serialNumbers: it.serialNumbers ? [...it.serialNumbers] : []
    })) : [{
      version: ord.version || 'oro_vivo',
      size: ord.size || 'M',
      gender: ord.gender || 'Unisex',
      quantity: ord.quantity || 1,
      serialNumbers: ord.serialNumber ? [ord.serialNumber] : []
    }];

    const itemsChanged = JSON.stringify(originalItems) !== JSON.stringify(items);

    // If status is APPROVED and items changed, regenerate serials
    if (formVal.status === 'APPROVED' && itemsChanged) {
      let nextIndex = 1;
      const orders = this.firebaseService.orders();
      const approvedOrders = orders.filter(o => o.status === 'APPROVED' && o.id?.toUpperCase().startsWith('OSN') && o.id !== ord.id);
      approvedOrders.forEach(o => {
        if (o.items && o.items.length > 0) {
          nextIndex += o.items.reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
        } else {
          nextIndex += (o.quantity || 1);
        }
      });

      const limit = this.dropLimit || 100;
      items.forEach(it => {
        if (it.version === 'oro_vivo') {
          const serials: string[] = [];
          for (let i = 0; i < it.quantity; i++) {
            const index = nextIndex++;
            const paddedIndex = String(index).padStart(3, '0');
            const serial = `OSN-ORO-${paddedIndex}/${limit}`;
            serials.push(serial);
          }
          it.serialNumbers = serials;
        } else {
          it.serialNumbers = [];
        }
      });
    }

    // Find first generated serial number
    let firstSerial = '';
    const firstOroVivoItem = items.find(it => it.version === 'oro_vivo' && it.serialNumbers && it.serialNumbers.length > 0);
    if (firstOroVivoItem && firstOroVivoItem.serialNumbers && firstOroVivoItem.serialNumbers.length > 0) {
      firstSerial = firstOroVivoItem.serialNumbers[0];
    }

    const updates: Partial<Order> = {
      fullName: formVal.fullName || '',
      email: formVal.email || '',
      phone: formVal.phone || '',
      address: formVal.address || '',
      city: formVal.city || '',
      country: formVal.country || '',
      version: items[0]?.version as Order['version'] || 'oro_vivo',
      size: items[0]?.size as Order['size'] || 'M',
      gender: items[0]?.gender as Order['gender'] || 'Unisex',
      status: formVal.status as Order['status'],
      isShipped: !!formVal.isShipped,
      carrier: formVal.carrier || '',
      trackingNumber: formVal.trackingNumber || '',
      adminNotes: formVal.adminNotes || '',
      quantity: totalQty,
      items: items,
      serialNumber: firstSerial
    };

    // If shipping status was toggled to true, record current timestamp
    if (updates.isShipped && !ord.isShipped) {
      updates.shippedAt = new Date().toISOString();
    } else if (!updates.isShipped) {
      updates.shippedAt = '';
    }

    try {
      await this.firebaseService.updateOrderFields(ord.id, updates);
      this.closeModal();
    } catch (err) {
      console.error('Failed to save manual order updates:', err);
    } finally {
      this.saveLoading.set(false);
    }
  }

  async sendManualEmail(orderId: string): Promise<void> {
    this.emailSending.set(true);
    this.emailError.set('');
    this.emailSuccess.set(false);

    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem('osaneli_admin_token');

    if (!token) {
      this.emailError.set('No autorizado. Vuelve a ingresar.');
      this.emailSending.set(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/notify-shipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        this.emailSuccess.set(true);
      } else {
        this.emailError.set(data.error || 'Falla al disparar la notificación por correo.');
      }
    } catch (err) {
      console.error('Network error requesting manual email shipment trigger:', err);
      this.emailError.set('Error de red al conectar con el servidor.');
    } finally {
      this.emailSending.set(false);
    }
  }

  toggleMetadataCollapsed(): void {
    this.showMetadata.update(v => !v);
  }

  async syncBoldTransaction(orderId: string, paymentId: string): Promise<void> {
    this.syncBoldLoading.set(true);
    this.syncSuccess.set(false);
    this.syncError.set('');

    if (!isPlatformBrowser(this.platformId)) return;
    const token = localStorage.getItem('osaneli_admin_token');

    if (!token) {
      this.syncError.set('No autorizado. Vuelve a ingresar.');
      this.syncBoldLoading.set(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/sync-bold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, paymentId })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        this.syncSuccess.set(true);
        // Update local order reference so template updates reactively with bold_metadata
        const currentOrder = this.selectedOrder();
        if (currentOrder && currentOrder.id === orderId) {
          this.selectedOrder.set({
            ...currentOrder,
            bold_metadata: data.bold_metadata
          });
        }
      } else {
        this.syncError.set(data.error || 'Falla al sincronizar la transacción con Bold.');
      }
    } catch (err) {
      console.error('Network error during Bold synchronization:', err);
      this.syncError.set('Error de red al intentar sincronizar con el servidor.');
    } finally {
      this.syncBoldLoading.set(false);
    }
  }

  onTaxTypeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.taxTypeInput.set(input.value);
    this.taxError.set('');
  }

  onTaxValueInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value ? Number(input.value) : null;
    this.taxValueInput.set(val);
    this.taxError.set('');
  }

  async saveTax(orderId: string): Promise<void> {
    const typeVal = this.taxTypeInput().trim();
    const valueVal = this.taxValueInput();

    if (!typeVal) {
      this.taxError.set('El tipo de impuesto es obligatorio.');
      return;
    }
    if (valueVal === null || isNaN(valueVal) || valueVal < 0) {
      this.taxError.set('El valor del impuesto debe ser un número válido mayor o igual a 0.');
      return;
    }

    this.saveTaxLoading.set(true);
    this.taxError.set('');

    try {
      const newTax = {
        type: typeVal,
        value: valueVal
      };

      await this.firebaseService.updateOrderFields(orderId, {
        taxes: [newTax]
      });

      // Update local state reactively
      const currentOrder = this.selectedOrder();
      if (currentOrder && currentOrder.id === orderId) {
        this.selectedOrder.set({
          ...currentOrder,
          taxes: [newTax]
        });
      }

      this.showAddTaxForm.set(false);
      this.taxTypeInput.set('VAT');
      this.taxValueInput.set(null);
    } catch (err) {
      console.error('Error saving tax:', err);
      this.taxError.set('Ocurrió un error al guardar el impuesto.');
    } finally {
      this.saveTaxLoading.set(false);
    }
  }

  cancelAddTax(): void {
    this.showAddTaxForm.set(false);
    this.taxTypeInput.set('VAT');
    this.taxValueInput.set(null);
    this.taxError.set('');
  }

  exportToCSV(): void {
    const list = this.filteredOrders();
    if (list.length === 0) return;

    // Header fields
    const headers = [
      'Orden ID',
      'Fecha',
      'Cliente',
      'Correo',
      'Teléfono',
      'Dirección de Envío',
      'Ciudad',
      'País',
      'Prenda Edición',
      'Talla',
      'Género',
      'Cantidad',
      'Total COP',
      'Estado Pago',
      'Despachado',
      'Transportadora',
      'Número de Guía',
      'Notas Internas'
    ];

    // Map rows
    const rows = list.map(o => [
      o.id,
      this.formatDate(o.createdAt),
      `"${o.fullName.replace(/"/g, '""')}"`,
      o.email,
      `"${o.phone}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${(o.city || '').replace(/"/g, '""')}"`,
      `"${(o.country || '').replace(/"/g, '""')}"`,
      o.version === 'oro_vivo' ? 'Oro Vivo' : 'Edición Negra',
      o.size,
      o.gender || 'Unisex',
      o.quantity,
      o.quantity * environment.productPrice,
      o.status,
      o.isShipped ? 'SI' : 'NO',
      o.carrier || '',
      o.trackingNumber || '',
      `"${(o.adminNotes || '').replace(/"/g, '""')}"`
    ]);

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    // Create download blob
    if (isPlatformBrowser(this.platformId)) {
      const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `OSANELI_PEDIDOS_EXPORT_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
