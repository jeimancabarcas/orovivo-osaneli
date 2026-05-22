import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hero',
  imports: [],
  template: `
    <section class="relative min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8 py-24 overflow-hidden bg-gradient-to-b from-[#0A1721] via-[#111111] to-[#111111]">
      
      <!-- Caribbean Sunset Backdrop Glows -->
      <div class="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-petroleum opacity-20 blur-[120px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-burnt-red opacity-10 blur-[100px] pointer-events-none"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[150px] rounded-full bg-gold-aged opacity-5 blur-[150px] pointer-events-none animate-pulse"></div>

      <!-- Content Container -->
      <div class="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-6 sm:gap-8 mt-12">
        
        <!-- Brand Premium Tag -->
        <span class="px-4 py-1.5 rounded-full border border-gold-aged/20 bg-gold-aged/5 text-gold-aged font-sans text-xs tracking-[0.3em] font-semibold uppercase animate-fade-in shadow-[0_0_15px_rgba(197,168,84,0.1)]">
          OSANELI CONCEPT DROP
        </span>

        <!-- Main Monumental Heading -->
        <h1 class="font-serif text-6xl sm:text-8xl md:text-9.5xl font-black tracking-tight leading-none text-white select-none">
          <span class="block text-glow-gold text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-aged to-gold-light animate-shimmer">
            ORO VIVO
          </span>
        </h1>

        <!-- High-Impact Tagline -->
        <p class="font-serif text-xl sm:text-2xl md:text-3xl text-neutral-300 font-light max-w-3xl italic tracking-wide">
          "Una camiseta que no representa a Colombia... <span class="text-white font-semibold">la eleva</span>."
        </p>

        <!-- Dynamic Visual Divider -->
        <div class="w-16 h-[2px] bg-gradient-to-r from-transparent via-gold-aged to-transparent"></div>

        <!-- Storytelling Block -->
        <div class="max-w-2xl text-center flex flex-col gap-4">
          <p class="font-sans text-sm sm:text-base text-neutral-400 leading-relaxed tracking-wider">
            No es una camiseta de fútbol. <strong class="text-white">Es una declaración de identidad.</strong>
            Colombia no es solo pasión... Es ritmo indomable, lujo natural, resiliencia pura y elegancia urbana.
          </p>
        </div>

        <!-- Call to Actions -->
        <div class="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <button
            (click)="scrollToPreOrder()"
            class="px-8 py-4 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-extrabold text-sm tracking-widest uppercase transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 shadow-[0_10px_30px_rgba(197,168,84,0.3)] cursor-pointer"
          >
            SEPARAR PREVENTA
          </button>
          
          <button
            (click)="scrollToShowcase()"
            class="px-8 py-4 rounded-xl border border-white/10 hover:border-gold-aged/40 bg-white/5 hover:bg-gold-aged/5 text-white hover:text-gold-aged font-sans font-bold text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer"
          >
            VER DETALLES
          </button>
        </div>

      </div>

      <!-- Floating Scroll Indicator -->
      <div 
        (click)="scrollToShowcase()"
        class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500 hover:text-gold-aged transition-colors duration-300 cursor-pointer"
      >
        <span class="text-[10px] tracking-[0.25em] uppercase font-bold">DESCUBRE</span>
        <div class="w-5 h-8 rounded-full border border-neutral-600 flex justify-center p-1.5">
          <div class="w-1 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
        </div>
      </div>

    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent {
  scrollToPreOrder(): void {
    const el = document.getElementById('preorder-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollToShowcase(): void {
    const el = document.getElementById('showcase-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
