import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirebaseService, Order } from '../services/firebase.service';
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
                  <span class="text-2xl sm:text-3xl font-serif font-black text-gold-aged leading-none">{{ stats().totalItemsSold }} / 100 U.</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Volumen de stock real comprado</span>
                </div>

                <!-- Card: Remaining Inventory -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">STOCK DISPONIBLE</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-white leading-none">{{ stats().remainingStock }} Piezas</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Límite oficial: 100 piezas (Filtro OSN)</span>
                </div>

                <!-- Card: Pending/Created Drafts -->
                <div class="glass-effect rounded-2xl p-6 border border-white/5 shadow flex flex-col gap-2 relative overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none"></div>
                  <span class="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">RESERVAS EN ESPERA</span>
                  <span class="text-2xl sm:text-3xl font-serif font-black text-white leading-none">{{ stats().totalDrafts }} Borradores</span>
                  <span class="text-[10px] text-neutral-500 italic mt-2">Estados de pago: CREATED y PENDING</span>
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
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
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
                              <span class="font-bold text-white uppercase">{{ ord.version === 'oro_vivo' ? 'Oro Vivo' : 'Edición Negra' }}</span>
                              <span class="text-[10px] text-neutral-400">Talla: {{ ord.size }} | Género: {{ ord.gender || 'Unisex' }}</span>
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
                            <button 
                              (click)="selectOrder(ord)"
                              class="px-3 py-1.5 rounded-lg border border-white/10 hover:border-gold-aged bg-white/5 hover:bg-gold-aged hover:text-matte-black font-sans font-bold text-[10px] tracking-wider uppercase transition-all duration-200 cursor-pointer"
                            >
                              Gestionar
                            </button>
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
            <span class="text-[9px] font-bold text-gold-aged tracking-[0.2em] uppercase font-mono">GESTIÓN DE RESERVA</span>
            <h3 class="font-serif text-xl sm:text-2xl font-black text-white">Orden ID: {{ ord.id }}</h3>
          </div>

          <!-- Logistical actions and changes -->
          <form [formGroup]="adminForm" class="flex flex-col gap-5 text-xs font-sans">
            
            <!-- Group 1: Shipping and Tracking Details -->
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

            <!-- Group 2: Client Edit Details -->
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

            <!-- Address and details config -->
            <div class="flex flex-col gap-1.5">
              <label for="address" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Dirección de Envío</label>
              <input 
                type="text" 
                id="address"
                formControlName="address"
                class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs"
              />
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div class="flex flex-col gap-1.5">
                <label for="version" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Edición</label>
                <select 
                  id="version"
                  formControlName="version"
                  class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                >
                  <option value="oro_vivo">Oro Vivo</option>
                  <option value="edicion_secreta">Edición Negra</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label for="size" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Talla</label>
                <select 
                  id="size"
                  formControlName="size"
                  class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer font-serif"
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>
              <div class="flex flex-col gap-1.5">
                <label for="gender" class="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Género</label>
                <select 
                  id="gender"
                  formControlName="gender"
                  class="px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-xl focus:border-gold-aged/40 focus:outline-none text-white text-xs cursor-pointer"
                >
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Unisex">Unisex</option>
                </select>
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
                class="w-full sm:flex-1 py-3 rounded-xl bg-gold-aged hover:bg-gold-light disabled:bg-neutral-800 text-matte-black disabled:text-neutral-500 font-sans font-extrabold tracking-wider text-[10px] uppercase transition-all duration-200 cursor-pointer text-center flex justify-center items-center gap-1.5"
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

        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackofficeComponent implements OnInit {
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
  readonly saveLoading = signal<boolean>(false);

  // Email shipment state
  readonly emailSending = signal<boolean>(false);
  readonly emailSuccess = signal<boolean>(false);
  readonly emailError = signal<string>('');

  // Admin Reactive Form
  readonly adminForm = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    version: ['oro_vivo', [Validators.required]],
    size: ['M', [Validators.required]],
    gender: ['Unisex', [Validators.required]],
    status: ['CREATED', [Validators.required]],
    isShipped: [false],
    carrier: [''],
    trackingNumber: [''],
    adminNotes: ['']
  });

  ngOnInit(): void {
    // Check if there is an active session stored in the browser
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = sessionStorage.getItem('osaneli_admin_token');
      if (storedToken) {
        try {
          const decoded = Buffer.from(storedToken, 'base64').toString('ascii');
          if (decoded.startsWith('OSANELI-ADMIN-SESSION-')) {
            this.isAuthenticated.set(true);
          }
        } catch (e) {
          sessionStorage.removeItem('osaneli_admin_token');
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
          sessionStorage.setItem('osaneli_admin_token', data.token);
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
      sessionStorage.removeItem('osaneli_admin_token');
    }
    this.isAuthenticated.set(false);
    this.activeTab.set('dashboard');
  }

  // Reactive Computed stats for the dashboard overview
  readonly stats = computed(() => {
    const orders = this.firebaseService.orders();
    // Only count approved orders starting with "OSN" for inventory metrics
    const approvedOsnOrders = orders.filter(o => o.status === 'APPROVED' && o.id.toUpperCase().startsWith('OSN'));
    
    // Total income
    const totalItemsSold = approvedOsnOrders.reduce((sum, o) => sum + (o.quantity || 1), 0);
    const totalSales = totalItemsSold * environment.productPrice;
    
    // Total drafts (borradores)
    const totalDrafts = orders.filter(o => o.status === 'CREATED' || o.status === 'PENDING').length;

    // Versions breakdown
    const oroVivo = approvedOsnOrders.filter(o => o.version === 'oro_vivo').reduce((sum, o) => sum + (o.quantity || 1), 0);
    const edicionSecreta = approvedOsnOrders.filter(o => o.version === 'edicion_secreta').reduce((sum, o) => sum + (o.quantity || 1), 0);
    
    // Sizes breakdown
    const sizes: Record<string, number> = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    approvedOsnOrders.forEach(o => {
      const sz = o.size || 'M';
      if (sizes[sz] !== undefined) {
        sizes[sz] += (o.quantity || 1);
      }
    });

    // Genders breakdown
    const genders: Record<string, number> = { Hombre: 0, Mujer: 0, Unisex: 0 };
    approvedOsnOrders.forEach(o => {
      const g = o.gender || 'Unisex';
      if (genders[g] !== undefined) {
        genders[g] += (o.quantity || 1);
      }
    });

    const pct = (val: number) => totalItemsSold > 0 ? Math.round((val / totalItemsSold) * 100) : 0;

    return {
      totalSalesFormatted: totalSales.toLocaleString('es-CO'),
      totalItemsSold,
      remainingStock: Math.max(0, 100 - totalItemsSold),
      totalDrafts,
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

  selectOrder(order: Order): void {
    this.selectedOrder.set(order);
    this.emailSuccess.set(false);
    this.emailError.set('');
    
    this.adminForm.patchValue({
      fullName: order.fullName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      version: order.version,
      size: order.size,
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
    this.emailSuccess.set(false);
    this.emailError.set('');
  }

  async saveChanges(): Promise<void> {
    const ord = this.selectedOrder();
    if (!ord || this.adminForm.invalid) return;

    this.saveLoading.set(true);
    const formVal = this.adminForm.value;

    const updates: Partial<Order> = {
      fullName: formVal.fullName || '',
      email: formVal.email || '',
      phone: formVal.phone || '',
      address: formVal.address || '',
      version: formVal.version as Order['version'],
      size: formVal.size as Order['size'],
      gender: formVal.gender || 'Unisex',
      status: formVal.status as Order['status'],
      isShipped: !!formVal.isShipped,
      carrier: formVal.carrier || '',
      trackingNumber: formVal.trackingNumber || '',
      adminNotes: formVal.adminNotes || ''
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
    const token = sessionStorage.getItem('osaneli_admin_token');

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
