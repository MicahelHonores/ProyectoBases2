import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  userType: number | null = null; // Inicialización en el constructor

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.userType = this.authService.getUserType();
    }
  }

  activeMenu = false;

  isLoginRoute(): boolean {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.userType = this.authService.getUserType();
    }
    return this.router.url === '/login';
  }

  isHomeRoute(): boolean {
    return this.router.url === '/home';
  }

  isStudentRoute(): boolean {
    return this.router.url === '/estudiante';
  }

  toggleMenu() {
    this.activeMenu = !this.activeMenu;
  }

  borrarToken() {
    localStorage.removeItem('authToken');
    this.userType =-1;
  }
}
