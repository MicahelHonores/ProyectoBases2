import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamenService } from 'src/app/services/examenes.service';

@Component({
  selector: 'app-examenes',
  templateUrl: './examenes.component.html',
  styleUrls: ['./examenes.component.css']
})
export class ExamenesComponent implements OnInit {
  examenes: any[] = [];

  constructor(private examenService: ExamenService, private router: Router) {}

  ngOnInit(): void {
    this.obtenerExamenesProfesor();
  }

  obtenerExamenesProfesor(): void {
    this.examenService.obtenerExamenesProfesor().subscribe(
      (data) => {
        this.examenes = data;
        console.log('Exámenes obtenidos:', this.examenes);
      },
      (error) => {
        console.error('Error al obtener los exámenes del profesor:', error);
      }
    );
  }

  editarExamen(idExamen: number): void {
    this.router.navigate(['/editar-examen', idExamen]);
  }

  eliminarExamen(idExamen: string): void {
    console.log(`Eliminando examen con ID: ${idExamen}`);
    this.examenService.eliminarExamen(idExamen).subscribe(
      () => {
        console.log(`Examen ${idExamen} eliminado correctamente.`);
        this.obtenerExamenesProfesor(); // Recargar la lista de exámenes
      },
      (error) => {
        console.error(`Error al eliminar el examen ${idExamen}:`, error);
      }
    );
  }
}
