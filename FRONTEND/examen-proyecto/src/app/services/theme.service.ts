import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemePalette = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _theme: BehaviorSubject<ThemePalette> = new BehaviorSubject<ThemePalette>('light');
  theme = this._theme.asObservable();

  constructor() {
    // Detectar el tema del sistema al inicio
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      this.setTheme('dark');
    }
  }

  setTheme(theme: ThemePalette) {
    this._theme.next(theme);
    document.body.classList.toggle('dark-theme', theme === 'dark');
  }
}
