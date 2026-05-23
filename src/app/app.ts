import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './components/header.component';
import { HeroComponent } from './components/hero.component';
import { ShowcaseComponent } from './components/showcase.component';
import { DetailsComponent } from './components/details.component';
import { PreOrderFormComponent } from './components/pre-order-form.component';
import { gsap } from 'gsap';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    HeroComponent,
    ShowcaseComponent,
    DetailsComponent,
    PreOrderFormComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const revealElements = document.querySelectorAll('[data-reveal]');
      
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

