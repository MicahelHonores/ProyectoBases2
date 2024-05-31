import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from 'src/app/services/preguntas.service';  // Ajusta la ruta según tu estructura de proyecto

@Component({
  selector: 'app-emparejamiento',
  templateUrl: './emparejamiento.component.html',
  styleUrls: ['./emparejamiento.component.css']
})
export class EmparejamientoComponent implements OnChanges {
  questionText: string = '';
  pairs: { element1: string, element2: string }[] = [{ element1: '', element2: '' }];
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
    this.privacy = pregunta[6] === 'PRIVADA';

    const opciones = pregunta[2].split(',');
    const respuestasCorrectas = pregunta[3].split(',');

    this.pairs = opciones.map((option: string, index: number) => ({
      element1: option,
      element2: respuestasCorrectas[index]
    }));
  }

  addPair() {
    this.pairs.push({ element1: '', element2: '' });
  }

  removePair(index: number) {
    this.pairs.splice(index, 1);
  }

  addQuestion() {
    const options: string[] = [];
    const correctAnswers: string[] = [];

    for (let i = 0; i < this.pairs.length; i++) {
      options.push(this.pairs[i].element1);
      correctAnswers.push(this.pairs[i].element2);
    }

    const questionData = {
      id_pregunta: this.pregunta ? this.pregunta[0] : undefined, // Mantener el ID si se está editando
      texto: this.questionText,
      opciones: options.join(','),
      respuestas_correctas: correctAnswers.join(','),
      id_tipo: 2, // ID correspondiente al tipo de pregunta de emparejamiento
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
    this.pairs = [{ element1: '', element2: '' }];
    this.privacy = false;
  }
}
