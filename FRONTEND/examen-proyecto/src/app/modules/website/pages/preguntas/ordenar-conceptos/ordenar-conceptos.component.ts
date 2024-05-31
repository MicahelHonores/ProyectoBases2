import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/preguntas.service';  // Ajusta la ruta según tu estructura de proyecto

@Component({
  selector: 'app-ordenar-conceptos',
  templateUrl: './ordenar-conceptos.component.html',
  styleUrls: ['./ordenar-conceptos.component.css']
})
export class OrdenarConceptosComponent implements OnChanges {
  questionText: string = '';
  pairs: { element: string }[] = [{ element: '' }];
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
    this.pairs = pregunta[2].split(',').map((element: string) => ({ element: element.trim() }));
    this.privacy = pregunta[6] === 'PRIVADA';
  }

  addPair() {
    this.pairs.push({ element: '' });
  }

  removePair(index: number) {
    this.pairs.splice(index, 1);
  }

  addQuestion() {
    const options: string[] = [];
    const correctAnswers: string[] = [];

    for (let i = 0; i < this.pairs.length; i++) {
      options.push("" + (i + 1));
      correctAnswers.push(this.pairs[i].element); // La segunda parte del par se considera la respuesta correcta
    }

    const questionData = {
      id_pregunta: this.pregunta ? this.pregunta[0] : undefined, // Mantener el ID si se está editando
      texto: this.questionText,
      opciones: options.join(','), // Convertir opciones a cadena separada por puntos
      respuestas_correctas: correctAnswers.join(','), // Convertir respuestas correctas a cadena separada por puntos
      id_tipo: 2, // ID correspondiente al tipo de pregunta de emparejamiento
      tema: '', // Añade el tema correspondiente
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
    this.pairs = [{ element: '' }];
    this.privacy = false;
  }
}
