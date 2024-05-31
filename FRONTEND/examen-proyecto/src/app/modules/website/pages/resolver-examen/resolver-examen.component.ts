import { Component, Input, OnInit } from '@angular/core';
import { Question } from 'src/app/models/question';
import { ExamenService } from 'src/app/services/examenes.service';
import { QuestionService } from 'src/app/services/preguntas.service';

@Component({
  selector: 'app-resolver-examen',
  templateUrl: './resolver-examen.component.html',
  styleUrls: ['./resolver-examen.component.css']
})
export class ResolverExamenComponent implements OnInit {
  preguntas: any[] = [];
  idProfe: number = 1;  // el ID del profesor
  tema: string | null = null;  // Opcional: el tema puede ser null
  questionsData: any[][] = [];
  questions: Question[] = [];
  @Input() examId: any;

  constructor(
    private examenService: ExamenService,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    this.cargarPreguntas();
  }

  cargarPreguntas(): void {
    this.examenService.obtenerPreguntasPorExamen(this.examId).subscribe(
      (data) => {
        this.questionsData = data;
        for (let index = 0; index < this.questionsData.length; index++) {
          this.questions.push(
            {
            id_pregunta: this.questionsData[index][0],
            texto: this.questionsData[index][1],
            opciones : this.questionsData[index][2].split(','),
            respuestas_correctas : this.questionsData[index][3].split(','),
            id_tipo: this.questionsData[index][4],
            tema: this.questionsData[index][5],
            privacidad: this.questionsData[index][6],
          })
        }
        this.preguntas = data;
      },
      (error) => {
        console.error('Error al cargar las preguntas del examen:', error);
      }
    );
  }
}
