import { Component, ChangeDetectionStrategy, signal, computed, inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

type ViewMode = 'front' | 'back' | 'collar';
type EditionMode = 'oro_vivo' | 'edicion_secreta';

@Component({
  selector: 'app-showcase',
  imports: [],
  template: `
    <section id="showcase-section" class="relative py-24 sm:py-32 px-4 sm:px-8 bg-[#111111] overflow-hidden">
      
      <!-- Subtle BG Grids -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,84,0.03),transparent_60%)] pointer-events-none"></div>

      <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
        
        <!-- Interactive Visualizer (Left Column) -->
        <div class="w-full lg:w-1/2 flex flex-col items-center gap-8" data-reveal>
          
          <!-- Image Frame with Dynamic Overlay Effects -->
          <div 
            class="perspective-1000 w-full aspect-square max-w-[500px] rounded-3xl glass-effect p-6 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden group shirt-card cursor-crosshair"
            (mousemove)="onMouseMoveCard($event)"
            (mouseleave)="onMouseLeaveCard($event)"
          >
            
            <!-- Texture Pattern Overlay Toggle Effect -->
            @if (showPattern() && currentView() !== 'collar') {
              <div class="absolute inset-0 z-20 pointer-events-none opacity-45 mix-blend-overlay transition-opacity duration-500 animate-pulse">
                <!-- SVG geometric texture resembling Hat Vueltiao and Carribean waves -->
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="text-gold-aged">
                  <defs>
                    <pattern id="vueltiao-grid" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                      <path d="M 0 10 L 40 10 M 0 30 L 40 30 M 10 0 L 10 40 M 30 0 L 30 40" fill="none" stroke="currentColor" stroke-width="0.7" opacity="0.3"/>
                      <path d="M 0 20 Q 10 10, 20 20 T 40 20" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#vueltiao-grid)"/>
                </svg>
              </div>
            }

            <!-- Collar Lifting Light Glow -->
            @if (currentView() === 'collar') {
              <div class="absolute inset-0 z-10 bg-radial-gradient from-gold-aged/20 via-transparent to-transparent pointer-events-none mix-blend-screen animate-pulse"></div>
            }

            <!-- Product Main Image -->
            <img 
              [src]="activeImage()" 
              [alt]="activeImageAlt()"
              class="shirt-img w-full h-full object-contain max-h-[420px] transition-transform duration-300 transform group-hover:scale-105"
            />

            <!-- Limited Edition Tag Overlay -->
            <div class="absolute top-4 left-4 z-20 px-3 py-1 rounded-lg bg-matte-black/80 border border-white/10 text-[10px] tracking-widest text-neutral-400 font-bold uppercase">
              {{ currentEdition() === 'oro_vivo' ? 'PREMIUM DROP' : 'VIP INFLUENCER ONLY' }}
            </div>

            <!-- "SOMOS ORO" Floating Text inside collar view -->
            @if (currentView() === 'collar') {
              <div class="absolute bottom-6 z-20 px-4 py-2 rounded-xl bg-matte-black/90 border border-gold-aged/40 text-gold-aged text-center text-xs tracking-[0.2em] font-serif shadow-lg animate-bounce">
                SECRETO REVELADO: “SOMOS ORO”
              </div>
            }
          </div>

          <!-- Quick Interactive View Controls -->
          <div class="flex items-center gap-3 p-1.5 rounded-2xl bg-neutral-900 border border-white/5 shadow-inner">
            <button 
              (click)="setView('front')"
              class="px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase cursor-pointer transition-all duration-300 transform active:scale-95"
              [class.bg-gold-aged]="currentView() === 'front'"
              [class.text-matte-black]="currentView() === 'front'"
              [class.text-neutral-400]="currentView() !== 'front'"
              [class.hover:text-white]="currentView() !== 'front'"
            >
              FRENTE
            </button>
            <button 
              (click)="setView('back')"
              class="px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase cursor-pointer transition-all duration-300 transform active:scale-95"
              [class.bg-gold-aged]="currentView() === 'back'"
              [class.text-matte-black]="currentView() === 'back'"
              [class.text-neutral-400]="currentView() !== 'back'"
              [class.hover:text-white]="currentView() !== 'back'"
            >
              DORSO
            </button>
            <button 
              (click)="setView('collar')"
              class="px-4 py-2 rounded-xl text-xs font-bold tracking-widest uppercase cursor-pointer transition-all duration-300 flex items-center gap-1.5 transform active:scale-95"
              [class.bg-gold-aged]="currentView() === 'collar'"
              [class.text-matte-black]="currentView() === 'collar'"
              [class.text-neutral-400]="currentView() !== 'collar'"
              [class.hover:text-white]="currentView() !== 'collar'"
            >
              CUELLO
              <span class="w-1.5 h-1.5 rounded-full bg-burnt-red animate-ping" [class.hidden]="currentView() === 'collar'"></span>
            </button>
          </div>

        </div>

        <!-- Specifications & Details (Right Column) -->
        <div class="w-full lg:w-1/2 flex flex-col gap-8" data-reveal data-delay="0.2">
          
          <div class="flex flex-col gap-3">
            <span class="text-gold-aged text-xs font-bold tracking-[0.25em] uppercase font-sans">EXPERIENCIA E INTERACTIVIDAD</span>
            <h2 class="font-display text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Ingeniería Streetwear <br class="hidden sm:inline">y Lujo Conceptual
            </h2>
          </div>

          <!-- Dynamic Version Switcher -->
          <div class="flex flex-col gap-4">
            <label class="text-xs tracking-widest font-semibold text-neutral-400 uppercase">Seleccionar Edición</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <!-- Oro Vivo Standard -->
              <div 
                (click)="setEdition('oro_vivo')"
                class="relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-neutral-900/50 hover:bg-neutral-900 hover:border-gold-aged/50 hover:scale-[1.02] transform active:scale-95"
                [class.border-gold-aged]="currentEdition() === 'oro_vivo'"
                [class.border-white/5]="currentEdition() !== 'oro_vivo'"
                [class.shadow-[0_8px_25px_rgba(197,168,84,0.15)]]="currentEdition() === 'oro_vivo'"
              >
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-[#C5A854] border border-white/20"></span>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-white tracking-wider">ORO VIVO</span>
                    <span class="text-xs text-neutral-400 font-serif italic">Edición Standard Drop</span>
                  </div>
                </div>
              </div>

              <!-- Edición Secreta / Black -->
              <div 
                (click)="setEdition('edicion_secreta')"
                class="relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 bg-neutral-900/50 hover:bg-neutral-900 hover:border-gold-aged/50 hover:scale-[1.02] transform active:scale-95"
                [class.border-gold-aged]="currentEdition() === 'edicion_secreta'"
                [class.border-white/5]="currentEdition() !== 'edicion_secreta'"
                [class.shadow-[0_8px_25px_rgba(197,168,84,0.15)]]="currentEdition() === 'edicion_secreta'"
              >
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-[#111111] border-2 border-gold-aged"></span>
                  <div class="flex flex-col">
                    <div class="flex items-center gap-1.5">
                      <span class="text-sm font-bold text-white tracking-wider">EDICIÓN NEGRA</span>
                    </div>
                    <span class="text-xs text-gold-aged font-semibold font-serif italic">Preferida por Artistas & Influencers</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Feature Description (Storytelling details dynamic with selected ViewMode) -->
          <div class="glass-effect rounded-2xl p-6 flex flex-col gap-4">
            
            @switch (currentView()) {
              @case ('front') {
                <div class="flex flex-col gap-2">
                  <h3 class="text-sm font-bold tracking-widest text-white font-serif uppercase">Escudo en Relieve Monocromático</h3>
                  <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Hemos reinventado el escudo nacional. Eliminamos la sobrecarga de colores estridentes para dar paso a un relieve monocromático táctil del mismo tono del textil. Elegancia pura que representa pero no grita.
                  </p>
                </div>
              }
              @case ('back') {
                <div class="flex flex-col gap-2">
                  <h3 class="text-sm font-bold tracking-widest text-white font-serif uppercase">Estructura Boxy Streetwear</h3>
                  <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Un corte con hombros caídos y longitud ligeramente recortada que crea una caída estructurada inigualable. El textil pesado premium de 333g le confiere cuerpo a la prenda, luciendo como una pieza de alta sastrería urbana.
                  </p>
                </div>
              }
              @case ('collar') {
                <div class="flex flex-col gap-2">
                  <h3 class="text-sm font-bold tracking-widest text-gold-aged font-serif uppercase">Detalle Oculto: "SOMOS ORO"</h3>
                  <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    Un bordado de alta precisión en hilo oro metalizado y fondo azul petróleo escondido estratégicamente en la costura interior del cuello. Diseñado para revelarse únicamente al levantar la tela: una declaración mística de identidad.
                  </p>
                </div>
              }
            }

            <!-- Texture pattern toggle button -->
            <div class="h-[1px] bg-white/5 my-2"></div>
            
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-white tracking-wider">Patrón Cultural Invisible</span>
                <span class="text-[10px] text-neutral-400">Reinterpretación del Sombrero Vueltiao y Ondas de Cumbia</span>
              </div>
              <button 
                (click)="togglePattern()"
                class="px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer border transition-colors duration-300"
                [class.border-gold-aged]="showPattern()"
                [class.text-gold-aged]="showPattern()"
                [class.bg-gold-aged/10]="showPattern()"
                [class.border-white/10]="!showPattern()"
                [class.text-neutral-400]="!showPattern()"
              >
                {{ showPattern() ? 'DESACTIVAR' : 'EVALUAR TEXTURA' }}
              </button>
            </div>

          </div>

          <button 
            (click)="scrollToPreOrder()"
            class="px-6 py-4 rounded-xl bg-gradient-to-r from-gold-aged to-gold-light hover:brightness-110 text-matte-black font-sans font-extrabold text-xs tracking-widest uppercase transition-all duration-300 text-center shadow-lg cursor-pointer gold-btn-effect"
          >
            PREORDENAR ESTE DISEÑO
          </button>

        </div>

      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShowcaseComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

  // Signals for state
  readonly currentView = signal<ViewMode>('front');
  readonly currentEdition = signal<EditionMode>('oro_vivo');
  readonly showPattern = signal<boolean>(false);

  // Computeds for dynamic images & text
  readonly activeImage = computed(() => {
    const view = this.currentView();
    const edition = this.currentEdition();
    
    if (edition === 'oro_vivo') {
      if (view === 'collar') {
        return '/oro_vivo_collar.png';
      }
      return view === 'front' ? '/oro_vivo_front.png' : '/oro_vivo_back.png';
    } else {
      if (view === 'collar') {
        return '/oro_vivo_black_collar.jpeg';
      }
      return view === 'front' ? '/oro_vivo_black_front.jpeg' : '/oro_vivo_black_back.jpeg';
    }
  });

  readonly activeImageAlt = computed(() => {
    const view = this.currentView();
    const edition = this.currentEdition();
    const editionText = edition === 'oro_vivo' ? 'Oro Vivo' : 'Edición Negra';
    
    if (view === 'collar') {
      return `Detalle de cuello oculto SOMOS ORO de Osaneli - ${editionText}`;
    }
    return `Camiseta Osaneli ${editionText} - vista ${view === 'front' ? 'frontal' : 'trasera'}`;
  });

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Gentle floating baseline loop to replace CSS float
      gsap.fromTo('.shirt-card', 
        { y: 0 }, 
        { y: -8, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 }
      );
    }
  }

  // Showcase image spring transition
  private animateImageTransition(callback: () => void): void {
    if (isPlatformBrowser(this.platformId)) {
      gsap.to('.shirt-img', {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          callback();
          gsap.fromTo('.shirt-img', 
            { opacity: 0, scale: 0.88 }, 
            { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.4)' }
          );
        }
      });
    } else {
      callback();
    }
  }

  setView(mode: ViewMode): void {
    this.animateImageTransition(() => {
      this.currentView.set(mode);
    });
  }

  setEdition(mode: EditionMode): void {
    this.animateImageTransition(() => {
      this.currentEdition.set(mode);
    });
  }

  togglePattern(): void {
    this.showPattern.update(p => !p);
  }

  onMouseMoveCard(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const card = event.currentTarget as HTMLElement;
    const bounds = card.getBoundingClientRect();
    const mouseX = event.clientX - bounds.left;
    const mouseY = event.clientY - bounds.top;
    
    // Normalize coordinates: -0.5 to 0.5
    const xPct = (mouseX / bounds.width) - 0.5;
    const yPct = (mouseY / bounds.height) - 0.5;
    
    // Tilt the card physically in 3D
    gsap.to(card, {
      rotateY: xPct * 16, // max 16deg tilt
      rotateX: -yPct * 16,
      scale: 1.015,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });
    
    // Slide internal shirt image slightly in same direction (parallax depth layer)
    gsap.to('.shirt-img', {
      x: xPct * 12,
      y: yPct * 12,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  }

  onMouseLeaveCard(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const card = event.currentTarget as HTMLElement;
    
    // Return gently to center with a beautiful spring damping bounce
    gsap.to(card, {
      rotateY: 0,
      rotateX: 0,
      scale: 1,
      duration: 1.0,
      ease: 'elastic.out(1, 0.65)',
      overwrite: 'auto'
    });
    
    gsap.to('.shirt-img', {
      x: 0,
      y: 0,
      duration: 1.0,
      ease: 'elastic.out(1, 0.65)',
      overwrite: 'auto'
    });
  }

  scrollToPreOrder(): void {
    const el = document.getElementById('preorder-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
