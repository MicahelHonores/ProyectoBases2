// src/app/components/contenidos/contenidos.component.ts
import { Component, OnInit } from '@angular/core';
import { Contenido } from 'src/app/models/Contenido';
import { EstudiantesServicioService } from 'src/app/services/estudiantes-servicio.service';

@Component({
  selector: 'app-contenidos',
  templateUrl: './contenidos.component.html',
  styleUrls: ['./contenidos.component.css']
})
export class ContenidosComponent implements OnInit {
  cursos: { [key: string]: Contenido[] } = {};
  isLoading: boolean = true;

  constructor(private contenidosService: EstudiantesServicioService) { }

  ngOnInit(): void {
    this.contenidosService.getContenidosEstudiante().subscribe(data => {
      this.procesarDatos(data);
      this.isLoading = false; // Información cargada, desactivar estado de carga
    }, error => {
      console.error('Error al obtener los contenidos', error);
      this.isLoading = false; // En caso de error, también desactivar estado de carga
    });
  }

  procesarDatos(data: any[]): void {
    data.forEach(item => {
      const curso = item[0];
      const unidad = item[2];
      const contenido = item[1];
      const examen = item[3];

      if (!this.cursos[curso]) {
        this.cursos[curso] = [];
      }

      this.cursos[curso].push({ curso, unidad, contenido, examen });
    });
  }

  toggleContenido(curso: string): void {
    const element = document.getElementById(`curso-${curso}`);
    if (element) {
      element.classList.toggle('hidden');
    }
  }
}
