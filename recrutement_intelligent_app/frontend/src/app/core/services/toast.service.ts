import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  title: string;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastsSubject = new BehaviorSubject<Toast[]>([]);

  toasts$ = this.toastsSubject.asObservable();

  show(title: string, message: string, type: ToastType = 'info'): void {
    const toast: Toast = {
      id: Date.now(),
      title,
      message,
      type
    };

    this.toastsSubject.next([
      ...this.toastsSubject.value,
      toast
    ]);

    setTimeout(() => {
      this.remove(toast.id);
    }, 3500);
  }

  remove(id: number): void {
    this.toastsSubject.next(
      this.toastsSubject.value.filter(toast => toast.id !== id)
    );
  }
}