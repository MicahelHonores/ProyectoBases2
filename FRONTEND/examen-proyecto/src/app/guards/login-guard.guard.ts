import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      const token = localStorage.getItem('authToken');
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const isProfessor = tokenPayload.is_professor;
        if (isProfessor) {
          this.router.navigate(['/home']); // Redirigir a home si es profesor
        } else {
          this.router.navigate(['/estudiante']); // Redirigir a estudiante si es estudiante
        }
        return false; // No permitir acceso a la página de login si ya está autenticado
      }
    }
    return true; // Permitir acceso si no está autenticado o si no hay token
  }
}
