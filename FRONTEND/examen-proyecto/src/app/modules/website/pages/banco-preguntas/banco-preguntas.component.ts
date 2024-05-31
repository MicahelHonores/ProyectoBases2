import { Component, OnInit } from '@angular/core';
import { QuestionService } from 'src/app/services/preguntas.service';

@Component({
  selector: 'app-banco-preguntas',
  templateUrl: './banco-preguntas.component.html',
  styleUrls: ['./banco-preguntas.component.css']
})
export class BancoPreguntasComponent implements OnInit {
  preguntas: any[] = [];
  idProfe: number = 1;  // el ID del profesor
  tema: string | null = null;  // Opcional: el tema puede ser null

  constructor(private questionService: QuestionService) {}

  ngOnInit(): void {
    this.cargarBancoPreguntas();
  }

  cargarBancoPreguntas(): void {
    this.questionService.getBancoPreguntas(this.idProfe, this.tema).subscribe(
      (data) => {
        this.preguntas = data;
        console.log('Preguntas cargadas:', this.preguntas);
      },
      (error) => {
        console.error('Error al cargar las preguntas:', error);
      }
    );
  }
}
