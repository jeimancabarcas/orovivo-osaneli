import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-hero',
  imports: [],
  template: `
    <section 
      class="relative min-h-screen w-full flex flex-col justify-center items-center px-4 sm:px-8 py-24 overflow-hidden bg-gradient-to-b from-[#0A1721] via-[#111111] to-[#111111]"
    >
      
      <!-- Caribbean Sunset Backdrop Glows -->
      <div class="glow-circle-1 absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-petroleum opacity-20 blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div class="glow-circle-2 absolute bottom-1/4 right-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full bg-burnt-red opacity-10 blur-[100px] pointer-events-none animate-pulse-glow" style="animation-delay: 2s;"></div>
      <div class="glow-circle-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[150px] rounded-full bg-gold-aged opacity-5 blur-[150px] pointer-events-none animate-pulse-glow" style="animation-delay: 4s;"></div>

      <!-- Floating World Cup Trophy Background Graphic (Text-cropped) -->
      <div class="floating-trophy absolute left-[4%] sm:left-[8%] top-[25%] sm:top-[30%] w-[130px] sm:w-[200px] h-[190px] sm:h-[270px] pointer-events-none opacity-20 mix-blend-screen overflow-hidden rounded-3xl border border-white/5 bg-black/25 backdrop-blur-[3px] hidden md:block select-none">
        <img 
          src="/gold_cup_trophy.png" 
          alt="Golden Cup Trophy Graphic" 
          class="absolute top-0 left-0 w-full h-[142%] object-cover -translate-y-[18%] scale-105"
        />
      </div>

      <!-- Floating Golden Soccer Ball Background Graphic (Text-cropped) -->
      <div class="floating-ball absolute right-[4%] sm:right-[8%] top-[15%] sm:top-[20%] w-[120px] sm:w-[180px] h-[120px] sm:h-[180px] pointer-events-none opacity-25 mix-blend-screen overflow-hidden rounded-full border border-white/5 bg-black/20 backdrop-blur-[2px] select-none">
        <img 
          src="/gold_soccer_ball.png" 
          alt="Golden Soccer Ball Graphic" 
          class="absolute top-0 left-0 w-full h-[135%] object-cover object-top -translate-y-[2%]"
        />
      </div>

      <!-- Content Container -->
      <div class="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-6 sm:gap-8 mt-12">
        
        <!-- Brand Premium Tag -->
        <span class="hero-tag opacity-0 px-4 py-1.5 rounded-full border border-gold-aged/20 bg-gold-aged/5 text-gold-aged font-sans text-xs tracking-[0.3em] font-semibold uppercase shadow-[0_0_15px_rgba(197,168,84,0.1)]">
          OSANELI CONCEPT DROP
        </span>

        <!-- Main Monumental Heading -->
        <h1 class="hero-title opacity-0 font-display text-6xl sm:text-8xl md:text-9.5xl font-black tracking-tight leading-none text-white select-none">
          <span class="block text-glow-gold text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold-aged to-gold-light">
            ORO VIVO
          </span>
        </h1>

        <!-- High-Impact Tagline -->
        <p class="hero-quote opacity-0 font-serif text-xl sm:text-2xl md:text-3xl text-neutral-300 font-light max-w-3xl italic tracking-wide">
          "Una camiseta que no representa a Colombia... <span class="text-white font-semibold">la eleva</span>."
        </p>

        <!-- Dynamic Visual Divider -->
        <div class="hero-divider origin-center scale-x-0 w-16 h-[2px] bg-gradient-to-r from-transparent via-gold-aged to-transparent"></div>

        <!-- Storytelling Block -->
        <div class="hero-story opacity-0 max-w-2xl text-center flex flex-col gap-4">
          <p class="font-sans text-sm sm:text-base text-neutral-400 leading-relaxed tracking-wider">
            No es una camiseta de fútbol. <strong class="text-white">Es una declaración de identidad.</strong>
            Colombia no es solo pasión... Es ritmo indomable, lujo natural, resiliencia pura y elegancia urbana.
          </p>
        </div>

        <!-- Call to Actions -->
        <div class="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <button
            (click)="scrollToPreOrder()"
            class="hero-btn-1 opacity-0 px-8 py-4 rounded-xl bg-gold-aged hover:bg-gold-light text-matte-black font-sans font-extrabold text-sm tracking-widest uppercase transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_35px_rgba(197,168,84,0.4)] active:translate-y-0 shadow-[0_10px_30px_rgba(197,168,84,0.25)] cursor-pointer gold-btn-effect"
          >
            SEPARAR PREVENTA
          </button>
          
          <button
            (click)="scrollToShowcase()"
            class="hero-btn-2 opacity-0 px-8 py-4 rounded-xl border border-white/10 hover:border-gold-aged/40 bg-white/5 hover:bg-gold-aged/5 text-white hover:text-gold-aged font-sans font-bold text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer"
          >
            VER DETALLES
          </button>
        </div>

      </div>

      <!-- Floating Scroll Indicator -->
      <div 
        (click)="scrollToShowcase()"
        class="hero-scroll opacity-0 absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-500 hover:text-gold-aged transition-colors duration-300 cursor-pointer"
      >
        <span class="text-[10px] tracking-[0.25em] uppercase font-bold">DESCUBRE</span>
        <div class="w-5 h-8 rounded-full border border-neutral-600 flex justify-center p-1.5">
          <div class="w-1 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
        </div>
      </div>

    </section>
  `,
  host: {
    '(mousemove)': 'onMouseMove($event)'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      
      // Animate floating items in first
      gsap.fromTo('.floating-trophy', 
        { opacity: 0, x: -55, rotate: -12, scale: 0.9 },
        { opacity: 0.2, x: 0, rotate: -4, scale: 1, duration: 2.2, ease: 'power3.out' }
      );
      
      gsap.fromTo('.floating-ball', 
        { opacity: 0, x: 55, rotate: 15, scale: 0.9 },
        { opacity: 0.25, x: 0, rotate: 0, scale: 1, duration: 2.2, ease: 'power3.out' }
      );
      
      // Infinite floating loop for trophy (drift + rotate)
      gsap.to('.floating-trophy img', {
        yPercent: 7,
        rotation: 3,
        duration: 5.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });

      // Infinite floating and slow spin loop for soccer ball
      gsap.to('.floating-ball img', {
        yPercent: -9,
        rotation: 360,
        duration: 32,
        ease: 'none',
        repeat: -1
      });
      
      tl.to('.hero-tag', { opacity: 1, y: 0, duration: 1 })
        .to('.hero-title', { opacity: 1, scale: 1, y: 0, duration: 1.5 }, '-=0.8')
        .to('.hero-quote', { opacity: 1, y: 0, duration: 1 }, '-=1')
        .to('.hero-divider', { scaleX: 1, duration: 0.8 }, '-=0.8')
        .to('.hero-story', { opacity: 1, y: 0, duration: 1 }, '-=0.8')
        .to('.hero-btn-1', { opacity: 1, x: 0, duration: 0.8 }, '-=0.8')
        .to('.hero-btn-2', { opacity: 1, x: 0, duration: 0.8 }, '-=0.8')
        .to('.hero-scroll', { opacity: 1, y: 0, duration: 1 }, '-=0.5');
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const x = (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    const y = (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    
    // Parallax interactive depth on sunset glows
    gsap.to('.glow-circle-1', { x: x * -40, y: y * -40, duration: 1.5, ease: 'power2.out' });
    gsap.to('.glow-circle-2', { x: x * 20, y: y * 20, duration: 2.0, ease: 'power2.out' });
    gsap.to('.glow-circle-3', { x: x * -15, y: y * 15, duration: 2.5, ease: 'power2.out' });
    
    // Parallax interactive depth on floating world cup graphics
    gsap.to('.floating-trophy', { x: x * -25, y: y * -25, duration: 1.8, ease: 'power2.out' });
    gsap.to('.floating-ball', { x: x * 30, y: y * -30, duration: 2.2, ease: 'power2.out' });
  }

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
