import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from './components/header.component';
import { HeroComponent } from './components/hero.component';
import { ShowcaseComponent } from './components/showcase.component';
import { DetailsComponent } from './components/details.component';
import { PreOrderFormComponent } from './components/pre-order-form.component';

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
export class App {}

