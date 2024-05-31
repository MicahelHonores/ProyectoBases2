import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  id: number;
  password: string;
  is_professor: boolean;

  constructor(private authService: AuthService, private router: Router) {
    this.id = 0;
    this.password = '';
    this.is_professor = false;
  }

  login() {
    this.authService.login({ id: this.id, password: this.password, is_professor: this.is_professor ? 1 : 0 }).subscribe(success => {
      if (success) {
        if(this.is_professor){
          this.router.navigate(['/home']);
        }else{
          this.router.navigate(['/estudiante']); // Aquí se redirige a '/estudiante' si es estudiante
        }
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    });
  }
}
