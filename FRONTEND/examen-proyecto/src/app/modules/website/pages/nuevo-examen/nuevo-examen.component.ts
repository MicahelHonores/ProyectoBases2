import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question } from 'src/app/models/question';  // Importa el modelo de pregunta
import { Exam } from 'src/app/models/exam';   // Importa el modelo de examen
import { ExamenService } from 'src/app/services/examenes.service';
import { QuestionService } from 'src/app/services/preguntas.service';
import { CursosService } from 'src/app/services/cursos.service'; // Importa el servicio de cursos
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-examen',
  templateUrl: './nuevo-examen.component.html',
  styleUrls: ['./nuevo-examen.component.css']
})
export class NuevoExamenComponent implements OnInit {
  questions: Question[] = []; // Arreglo para almacenar las preguntas
  tituloCuestionario: string = '';
  cantidadDePreguntas: number = 0;
  descripcionCuestionario: string = '';
  categoriaCuestionario: string = '';
  orden: string = ''; // En orden o Aleatorio
  exams: Exam[] = []; // Arreglo para almacenar los exámenes creados
  horarioId: string = '0';
  cursos: any[] = []; // Arreglo para almacenar los cursos
  showNotification: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private examenService: ExamenService,
    private questionService: QuestionService,
    private cursosService: CursosService, // Inyecta el servicio de cursos
    private router: Router // Importa el servicio Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.horarioId = "" + params.get('id');
      console.log('ID del horario recibido:', this.horarioId);
    });

    // Cargar los cursos desde el servicio
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.cursosService.getCursos().subscribe(
      (data) => {
        this.cursos = data;
        console.log('Cursos cargados:', this.cursos);
      },
      (error) => {
        console.error('Error al cargar los cursos:', error);
      }
    );
  }

  addQuestion(questionData: Question) {
    questionData.id_pregunta = this.generateUniqueId();
    this.questions.push(questionData);
  }

  eliminarPregunta(id: string) {
    this.questions = this.questions.filter(question => question.id_pregunta !== id);
  }

  private generateUniqueId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  guardarExamen() {
    const newExam = {
      nombre: this.tituloCuestionario,
      descripcion: this.descripcionCuestionario,
      cantidad_preguntas: this.cantidadDePreguntas,
      tiempo_limite: 60, // Puedes definir el tiempo límite aquí
      id_curso: this.categoriaCuestionario,
      orden: this.orden,
      horario: this.horarioId
    };

    // Enviar el examen a la API
    this.examenService.crearExamen(newExam).subscribe(
      (response) => {
        const examId = response.id; // Asume que la respuesta contiene el ID del examen creado
        this.guardarPreguntas(examId);
        this.showNotification = false;
        // En caso de éxito
        // Redirigir a /examenes
        this.router.navigate(['/examenes']);
      },
      (error) => {
        console.error('Error al crear el examen:', error);
        // En caso de error
        this.showNotification = true;
        setTimeout(() => {
          this.showNotification = false;
        }, 3500); // Oculta la notificación después de 5 segundos
      }
    );
  }

  guardarPreguntas(examId: string) {
    this.questions.forEach((question, index) => {
      const questionData = {
        texto: question.texto,
        opciones: question.opciones.join(','),
        respuestas_correctas: question.respuestas_correctas.join(','),
        id_tipo: question.id_tipo,
        tema: question.tema,
        privacidad: question.privacidad,
        id_examen: examId // Asume que necesitas enviar el ID del examen
      };

      this.questionService.createQuestion(questionData).subscribe(
        (response) => {
          console.log(`Pregunta ${index + 1} guardada correctamente.`);
        },
        (error) => {
          console.error(`Error al guardar la pregunta ${index + 1}:`, error);
        }
      );
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

  printExams() {
    console.log('Exámenes almacenados:');
    this.exams.forEach((exam, index) => {
      console.log(`Examen ${index + 1}:`);
      console.log('Nombre:', exam.nombre);
      console.log('Descripción:', exam.descripcion);
      console.log('Categoría:', exam.idCurso);
      console.log('Orden:', exam.orden);
      console.log('Cantidad de Preguntas:', exam.cantidadDePreguntas);
      console.log('Tiempo Límite:', exam.tiempoLimite);
      console.log('Preguntas:', exam.preguntas);
      console.log('Horario:', this.horarioId);
    });
  }
}
