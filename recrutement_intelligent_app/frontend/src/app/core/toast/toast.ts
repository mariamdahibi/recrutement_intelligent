import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ToastService,
  Toast
} from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class ToastComponent {

  private toastService = inject(ToastService);

  toasts$ = this.toastService.toasts$;

  remove(toast: Toast): void {
    this.toastService.remove(toast.id);
  }

}