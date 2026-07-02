import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private themeSubject = new BehaviorSubject<ThemeMode>('light');

  theme$ = this.themeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme') as ThemeMode | null;

    if (savedTheme === 'dark') {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  getCurrentTheme(): ThemeMode {
    return this.themeSubject.value;
  }
}