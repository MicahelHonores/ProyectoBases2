import { Component, OnInit } from '@angular/core';
import { EstudiantesServicioService } from 'src/app/services/estudiantes-servicio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asignados',
  templateUrl: './asignados.component.html',
  styleUrls: ['./asignados.component.css']
})
export class AsignadosComponent implements OnInit {

  examenes: any[] = [];

  constructor(private estudiantesServicio: EstudiantesServicioService, private router: Router) { }

  ngOnInit(): void {
    this.estudiantesServicio.obtenerExamenesNoPresentados().subscribe((data: any[]) => {
      this.examenes = data;
    });
  }

  presentarExamen(idExamen: number): void {
    this.router.navigate(['/presentar-examen', idExamen]);
  }
}
