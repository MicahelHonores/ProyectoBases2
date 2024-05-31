import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');

    if (token) {
      // Verificar si el token expiró
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(tokenPayload.exp * 1000);
      if (expirationDate < new Date()) {
        // Token expirado, redirigir al usuario al componente de login
        this.router.navigate(['/login']);
        return false;
      }

      // Token válido, permitir acceso
      return true;
    }

    // No hay token, redirigir al usuario al componente de login
    this.router.navigate(['/login']);
    return false;
  }
}
