import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header.component';
import { PreOrderService } from './services/pre-order.service';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  protected readonly preOrderService = inject(PreOrderService);
}
