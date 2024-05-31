import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/preguntas.service';  // Ajusta la ruta según tu estructura de proyecto

@Component({
  selector: 'app-opcion-multiple',
  templateUrl: './opcion-multiple.component.html',
  styleUrls: ['./opcion-multiple.component.css']
})
export class OpcionMultipleComponent implements OnChanges {
  questionText: string = '';
  options: { element: string }[] = [{ element: '' }];
  correctAnswers: boolean[] = [false];
  userAnswers: boolean[] = [false];
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
    this.questionText = pregunta[1] ;
    this.options = pregunta[2].split(',').map((opcion: string) => ({ element: opcion.trim() }));
    const correctAnswersArray = pregunta[3].split(',').map((answer: string) => answer.trim());
    this.correctAnswers = this.options.map((option, index) => correctAnswersArray.includes(option.element));
    this.userAnswers = this.options.map((option, index) => false);
    this.privacy = pregunta[6] === 'PRIVADA';
  }

  addOption() {
    this.options.push({ element: '' });
    this.correctAnswers.push(false);
  }

  removeOption(index: number) {
    this.options.splice(index, 1);
    this.correctAnswers.splice(index, 1);
  }

  addQuestion() {
    const selectedOptions: string[] = [];
    for (let i = 0; i < this.options.length; i++) {
      if (this.correctAnswers[i]) {
        selectedOptions.push(this.options[i].element);
      }
    }

    const questionData = {
      id_pregunta: this.pregunta ? this.pregunta[0] : undefined, // Mantener el ID si se está editando
      texto: this.questionText,
      opciones: this.options.map(option => option.element).join(','), // Convertir opciones a cadena separada por puntos
      respuestas_correctas: selectedOptions.join(','), // Convertir respuestas correctas a cadena separada por puntos
      id_tipo: 1,
      tema: '',
      privacidad: this.privacy ? 1 : 0
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

  validarRutaBanco(){
    return this.router.url.includes('/banco-preguntas');
  }

  validarRutaPresentacion() {
    return this.router.url.includes('/presentar-examen');
  }

  resetForm() {
    this.questionText = '';
    this.options = [{ element: '' }];
    this.correctAnswers = [false];
  }
}
