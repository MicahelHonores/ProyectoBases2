import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HorariosService } from 'src/app/services/horarios.service';

@Component({
  selector: 'app-horarios',
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css']
})
export class HorariosComponent implements OnInit, AfterViewInit {
  horarios: any[] = [];
  semestres: any[] = [];
  indiceSeleccionado: number = 0; // Inicialmente no hay ningún índice seleccionado
  semanas: number = 1;
  lunes: any[] = [];
  martes: any[] = [];
  miercoles: any[] = [];
  jueves: any[] = [];
  viernes: any[] = [];
  semestreActual: string = "2023-1";
  semanaActual: number = 1;

  // Definir un array con los nombres de las clases de colores disponibles
  colores: string[] = ['writing', 'ent-law', 'corp-fi', 'securities'];
  // Variable para almacenar el índice actual del color
  colorIndex: number = 0;

  constructor(private horariosService: HorariosService) {}

  ngOnInit(): void {
    // No llames a fetchSemestres() aquí, sino en ngAfterViewInit()
  }

  ngAfterViewInit(): void {
    this.fetchSemestres();
  }

  fetchSemestres(): void {
    this.horariosService.getSemestres().subscribe(
      (data: any[]) => {
        // Filtrar los semestres y las semanas en arreglos separados
        this.semestres = data.map(item => item[0]); // Obtener solo los semestres
        this.semanas = data[this.indiceSeleccionado][1];
        // Después de obtener los semestres, obtén los horarios utilizando el primer semestre
        if (this.semestres.length > 0) {
          const primerSemestre = this.semestres[this.indiceSeleccionado]; // Acceder al primer semestre
          this.fetchHorarios(primerSemestre);
          console.log(this.semestres);
          console.log(this.semanas);
        } else {
          console.error('No se encontraron semestres.');
        }
      },
      (error) => {
        console.error('Error fetching semestres:', error);
      }
    );
  }

  fetchHorarios(semestre: string): void {
    this.semestreActual = semestre;
    this.horariosService.getHorarios(this.semanaActual, semestre).subscribe(
      (data: any[]) => {
        this.horarios = data;
        this.organizarHorariosPorDia();
      },
      (error) => {
        console.error('Error fetching horarios:', error);
      }
    );
  }

  // Dentro de la clase HorariosComponent
  previousWeek(): void {
    if (this.semanaActual > 1) {
      this.semanaActual--;
      this.fetchHorariosSemana(this.semanaActual);
    }
  }

  nextWeek(): void {
    if (this.semanaActual < this.semanas) {
      this.semanaActual++;
      this.fetchHorariosSemana(this.semanaActual);
    }
  }

  fetchHorariosSemana(semana: number): void {
    // No necesitas asignar this.semanaActual aquí, ya lo haces en previousWeek() y nextWeek()
    this.horariosService.getHorarios(semana, this.semestreActual).subscribe(
      (data: any[]) => {
        this.horarios = data;
        this.organizarHorariosPorDia();
      },
      (error) => {
        console.error('Error fetching horarios:', error);
      }
    );
  }

  getArray(numero: number): any[] {
    return Array(numero).fill(0).map((x, i) => i + 1);
  }

  organizarHorariosPorDia(): void {
    this.lunes = this.horarios.filter(horario => horario[1] === 'Lunes');
    this.martes = this.horarios.filter(horario => horario[1] === 'Martes');
    this.miercoles = this.horarios.filter(horario => horario[1] === 'Miércoles');
    this.jueves = this.horarios.filter(horario => horario[1] === 'Jueves');
    this.viernes = this.horarios.filter(horario => horario[1] === 'Viernes');
  }

  onSemestreSelect(semestre: string): void {
    this.indiceSeleccionado = this.semestres.indexOf(semestre);
    this.fetchSemestres();
    this.fetchHorarios(semestre);
  }

  getStartClass(startTime: string): number {
    // Parsea la hora de inicio y obtiene el primer dígito como número entero
    return parseInt(startTime.split(':')[0]);
  }

  getEndClass(startTime: string): number {
    // Parsea la hora de inicio y le suma 2 horas, luego obtiene el primer dígito como número entero
    const endHour = parseInt(startTime.split(':')[0]) + 2;
    return endHour; // Ajusta a formato de 12 horas si es necesario
  }

  // Método para obtener el siguiente color y actualizar el índice
  getNextColor(): string {
    // Obtener el color actual
    const color = this.colores[this.colorIndex];
    // Incrementar el índice, si alcanza el final del array, volver al principio
    this.colorIndex = (this.colorIndex + 1) % this.colores.length;
    // Devolver el color actual
    return color;
  }
}
