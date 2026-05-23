import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
export class HomeComponent implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

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
