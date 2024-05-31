import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamenService } from 'src/app/services/examenes.service';
import { QuestionService } from 'src/app/services/preguntas.service';
import { CursosService } from 'src/app/services/cursos.service';
import { Question } from 'src/app/models/question';

@Component({
  selector: 'app-editar-examen',
  templateUrl: './editar-examen.component.html',
  styleUrls: ['./editar-examen.component.css']
})
export class EditarExamenComponent implements OnInit {
  questions: Question[] = [];
  questionsData: any[][] = [];
  tituloCuestionario: string = '';
  cantidadDePreguntas: number = 0;
  tiempo: number = 0;
  descripcionCuestionario: string = '';
  categoriaCuestionario: string = '';
  orden: string = ''; // En orden o Aleatorio
  horarioId: string = '0';
  cursos: any[] = [];
  showNotification: boolean = false;
  examId: string = '';
  isDataLoaded: boolean = false; // Para controlar la carga de datos

  constructor(
    private route: ActivatedRoute,
    private examenService: ExamenService,
    private questionService: QuestionService,
    private cursosService: CursosService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.examId = "" + params.get('id');
      this.cargarExamen();
      this.cargarPreguntas();
    });

    this.cargarCursos();
  }

  cargarCursos(): void {
    this.cursosService.getCursos().subscribe(
      (data) => {
        this.cursos = data;
      },
      (error) => {
        console.error('Error al cargar los cursos:', error);
      }
    );
  }

  cargarExamen(): void {
    this.examenService.obtenerExamenPorId(this.examId).subscribe(
      (data) => {
        this.tituloCuestionario = data[0][1];
        this.descripcionCuestionario =  data[0][2];
        this.cantidadDePreguntas =  data[0][3];
        this.tiempo =  data[0][4];
        this.categoriaCuestionario =  data[0][5];
        this.orden =  data[0][6];
        this.isDataLoaded = true; // Marcar como cargado
      },
      (error) => {
        console.error('Error al cargar el examen:', error);
      }
    );
  }

  cargarPreguntas(): void {
    this.examenService.obtenerPreguntasPorExamen(this.examId).subscribe(
      (data) => {
        this.questionsData = data;
        console.log(this.questionsData[0][1]);
        console.log(data);
      },
      (error) => {
        console.error('Error al cargar las preguntas del examen:', error);
      }
    );
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
  }

  addQuestion(questionData: Question) {
    questionData.id_pregunta = this.generateUniqueId();
    this.questions.push(questionData);
  }

  eliminarPregunta(id: string) {
    this.questions = this.questions.filter(question => question.id_pregunta !== id);
    // Lógica para eliminar la pregunta de la base de datos
    this.questionService.deleteQuestion(id).subscribe(
      () => {
        console.log(`Pregunta ${id} eliminada correctamente.`);
      },
      (error) => {
        console.error(`Error al eliminar la pregunta ${id}:`, error);
      }
    );
  }

  private generateUniqueId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  guardarExamen() {
    const updatedExam = {
      id: this.examId,
      nombre: this.tituloCuestionario,
      descripcion: this.descripcionCuestionario,
      cantidad_preguntas: this.cantidadDePreguntas,
      tiempo_limite: 60, // Puedes definir el tiempo límite aquí
      id_curso: this.categoriaCuestionario,
      orden: this.orden,
      horario: this.horarioId
    };

    this.examenService.actualizarExamen(updatedExam).subscribe(
      () => {
        this.guardarPreguntas();
        this.showNotification = false;
        this.router.navigate(['/examenes']);
      },
      (error) => {
        console.error('Error al actualizar el examen:', error);
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
        }, 3500);
      }
    );
  }

  guardarPreguntas() {
    this.questions.forEach((question, index) => {
      const questionData = {
        texto: question.texto,
        opciones: question.opciones.join(','),
        respuestas_correctas: question.respuestas_correctas.join(','),
        id_tipo: question.id_tipo,
        tema: question.tema,
        privacidad: question.privacidad,
        id_examen: this.examId
      };

      if ((question.id_pregunta+"").startsWith('_')) {
        // Nueva pregunta
        this.questionService.createQuestion(questionData).subscribe(
          (response) => {
            console.log(`Pregunta ${index + 1} guardada correctamente.`);
          },
          (error) => {
            console.error(`Error al guardar la pregunta ${index + 1}:`, error);
          }
        );
      } else {
        // Pregunta existente
        this.questionService.updateQuestion(question.id_pregunta+"", questionData).subscribe(
          (response) => {
            console.log(`Pregunta ${index + 1} actualizada correctamente.`);
          },
          (error) => {
            console.error(`Error al actualizar la pregunta ${index + 1}:`, error);
          }
        );
      }
    });

    // Limpia los campos después de guardar el examen
    this.tituloCuestionario = '';
    this.descripcionCuestionario = '';
    this.categoriaCuestionario = '';
    this.orden = '';
    this.questions = [];
  }

  closeNotification() {
    this.showNotification = false;
  }
}
