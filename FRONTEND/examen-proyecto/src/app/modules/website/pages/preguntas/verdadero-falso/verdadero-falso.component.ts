import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/preguntas.service';  // Ajusta la ruta según tu estructura de proyecto

@Component({
  selector: 'app-verdadero-falso',
  templateUrl: './verdadero-falso.component.html',
  styleUrls: ['./verdadero-falso.component.css']
})
export class VerdaderoFalsoComponent implements OnChanges {
  questionText: string = '';
  isTrue: boolean = false;
  privacy: boolean = false;

  @Input() pregunta: any;
  @Output() questionAdded = new EventEmitter<any>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private questionService: QuestionService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pregunta'] && changes['pregunta'].currentValue) {
      this.loadQuestion(changes['pregunta'].currentValue);
    }
  }

  loadQuestion(pregunta: any) {
    this.questionText = pregunta[1];
    this.isTrue = pregunta[3] === 'Verdadero';
    this.privacy = pregunta[6] === 'PRIVADA';
  }

  addQuestion() {
    const questionData = {
      id_pregunta: this.pregunta ? this.pregunta[0] : undefined, // Mantener el ID si se está editando
      texto: this.questionText,
      opciones: 'Verdadero,Falso', // Dos opciones: Verdadero y Falso
      respuestas_correctas: this.isTrue ? 'Verdadero' : 'Falso', // Respuesta correcta basada en el estado de isTrue
      id_tipo: 4, // ID correspondiente al tipo de pregunta Verdadero/Falso
      tema: this.pregunta ? this.pregunta[4] : '', // Mantener el tema si se está editando
      privacidad: this.privacy ? 1 : 0 // Convertir la privacidad booleana a un número
    };

    // Verificar si estamos en la ruta /banco-preguntas para actualizar
    if (this.router.url.includes('/banco-preguntas')) {
      if (this.pregunta && this.pregunta[0]) {
        this.updateQuestion(this.pregunta[0], questionData);
      }
    } else {
      this.questionAdded.emit(questionData);

      // Limpiar los campos después de agregar la pregunta si es una nueva pregunta
      if (!this.pregunta) {
        this.resetForm();
      }
    }
  }

  updateQuestion(id: string | number, questionData: any) {
    this.questionService.updateQuestion(id, questionData).subscribe(
      response => {
        console.log('Pregunta actualizada con éxito', response);
        // Aquí puedes manejar una respuesta exitosa, como mostrar una notificación o redirigir a otra página
      },
      error => {
        console.error('Error actualizando la pregunta', error);
        // Aquí puedes manejar el error, como mostrar un mensaje de error
      }
    );
  }

  validarRutaBanco() {
    return this.router.url.includes('/banco-preguntas');
  }

  resetForm() {
    this.questionText = '';
    this.isTrue = false;
    this.privacy = false;
  }
}
