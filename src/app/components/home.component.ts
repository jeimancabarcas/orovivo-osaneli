import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID, AfterViewInit, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { HeroComponent } from './hero.component';
import { ShowcaseComponent } from './showcase.component';
import { DetailsComponent } from './details.component';
import { PreOrderFormComponent } from './pre-order-form.component';
import { gsap } from 'gsap';

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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements AfterViewInit, OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  ngOnInit(): void {
    this.titleService.setTitle('OSANELI | ORO VIVO - Edición Limitada Streetwear');
    
    // Core description
    this.metaService.updateTag({ name: 'description', content: "No es una camiseta de fútbol. Es una declaración de identidad. Adquiere en preventa exclusiva la camiseta 'ORO VIVO' de Osaneli. Corte boxy, tejido de alta densidad (333g), lujo y herencia colombiana." });
    
    // Open Graph / Facebook
    this.metaService.updateTag({ property: 'og:title', content: 'OSANELI | ORO VIVO - Edición Limitada Streetwear' });
    this.metaService.updateTag({ property: 'og:description', content: "No es una camiseta de fútbol. Es una declaración de identidad. Adquiere en preventa exclusiva la camiseta 'ORO VIVO' de Osaneli. Corte boxy, tejido de alta densidad (333g), lujo y herencia colombiana." });
    this.metaService.updateTag({ property: 'og:image', content: 'https://orovivo.osaneli.com/oro_vivo_front.png' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://orovivo.osaneli.com/' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'OSANELI | ORO VIVO - Edición Limitada Streetwear' });
    this.metaService.updateTag({ name: 'twitter:description', content: "No es una camiseta de fútbol. Es una declaración de identidad. Adquiere en preventa exclusiva la camiseta 'ORO VIVO' de Osaneli. Corte boxy, tejido de alta densidad (333g), lujo y herencia colombiana." });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://orovivo.osaneli.com/oro_vivo_front.png' });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const revealElements = document.querySelectorAll('#preorder-section [data-reveal], #showcase-section [data-reveal], #details-section [data-reveal], [data-reveal]');
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const delay = parseFloat(el.getAttribute('data-delay') || '0') || 0;
              
              gsap.to(el, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.4,
                delay: delay,
                ease: 'power4.out',
                onComplete: () => {
                  el.style.willChange = 'auto';
                }
              });
              
              observer.unobserve(el);
            }
          });
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px -50px 0px'
        }
      );
      
      revealElements.forEach((el) => {
        gsap.set(el, { opacity: 0, y: 30, scale: 0.98 });
        observer.observe(el);
      });
    }
  }
}
