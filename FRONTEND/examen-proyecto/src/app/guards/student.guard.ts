import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StudentGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');

    if (token) {
      // Verificar el tipo de usuario
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const isProfessor = tokenPayload.is_professor;
      const expirationDate = new Date(tokenPayload.exp * 1000);
      if (expirationDate < new Date()) {
        // Token expirado, redirigir al usuario al componente de login
        localStorage.removeItem('authToken');
        this.router.navigate(['/login']);
        return false;
      }
      // Si el usuario es un estudiante, permitir acceso
      if (!isProfessor) {
        return true;
      } else {
        // Si el usuario no es un estudiante, redirigir al usuario al componente de login
        this.router.navigate(['/login']);
        return false;
      }
    }

    // No hay token, redirigir al usuario al componente de login
    this.router.navigate(['/login']);
    return false;
  }
}
