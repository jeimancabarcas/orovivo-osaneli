import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { HeroComponent } from './hero.component';
import { ShowcaseComponent } from './showcase.component';
import { DetailsComponent } from './details.component';
import { PreOrderFormComponent } from './pre-order-form.component';

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
export class HomeComponent implements OnInit {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);

  ngOnInit(): void {
    this.titleService.setTitle('OSANELI | ORO VIVO - Edición Limitada Streetwear');
    
    // Core description
    this.metaService.updateTag({ name: 'description', content: "No es una camiseta de fútbol. Es una declaración de identidad. Adquiere en preventa exclusiva la camiseta 'ORO VIVO' de Osaneli. Corte boxy, tejido de alta densidad (333g), lujo y herencia colombiana." });
    
    // Open Graph / Facebook
    this.metaService.updateTag({ property: 'og:title', content: 'OSANELI | ORO VIVO - Edición Limitada Streetwear' });
    this.metaService.updateTag({ property: 'og:description', content: "No es una camiseta de fútbol. Es una declaración de identidad. Adquiere en preventa exclusiva la camiseta 'ORO VIVO' de Osaneli. Corte boxy, tejido de alta densidad (333g), lujo y herencia colombiana." });
    this.metaService.updateTag({ property: 'og:image', content: 'https://orovivo.osaneli.com/meta-crop-og.png' });
    this.metaService.updateTag({ property: 'og:image:width', content: '1200' });
    this.metaService.updateTag({ property: 'og:image:height', content: '630' });
    this.metaService.updateTag({ property: 'og:url', content: 'https://orovivo.osaneli.com/' });
    this.metaService.updateTag({ property: 'og:type', content: 'website' });

    // Twitter Card
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: 'OSANELI | ORO VIVO - Edición Limitada Streetwear' });
    this.metaService.updateTag({ name: 'twitter:description', content: "No es una camiseta de fútbol. Es una declaración de identidad. Adquiere en preventa exclusiva la camiseta 'ORO VIVO' de Osaneli. Corte boxy, tejido de alta densidad (333g), lujo y herencia colombiana." });
    this.metaService.updateTag({ name: 'twitter:image', content: 'https://orovivo.osaneli.com/meta-crop-twitter.png' });
  }
}
