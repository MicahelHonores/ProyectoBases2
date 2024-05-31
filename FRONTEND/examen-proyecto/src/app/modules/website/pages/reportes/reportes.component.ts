import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-reporte',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  selectedReport: string = '';
  reports: any[] = [];
  reportData: any[] = [];
  loading: boolean = false;
  error: string = '';

  reportOptions = [
    { value: 'examenes-grupo', label: 'Exámenes por Grupo' },
    { value: 'estudiantes-grupo', label: 'Estudiantes por Grupo' },
    { value: 'estudiantes-mejor-puntaje', label: 'Estudiantes con Mejor Puntaje' },
    { value: 'examenes-grupo-especifico', label: 'Exámenes por Grupo Específico' },
    { value: 'cursos-examenes-programados', label: 'Cursos y Exámenes Programados' },
    { value: 'estudiantes-puntaje-maximo', label: 'Estudiantes con Puntaje Máximo' },
    { value: 'grupos-estudiantes', label: 'Grupos y Número de Estudiantes' }
  ];

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
  }

  onReportChange(): void {
    this.reportData = [];
    this.loading = true;
    this.error = '';

    let reportObservable;
    switch (this.selectedReport) {
      case 'examenes-grupo':
        reportObservable = this.reportService.getExamenesGrupo();
        break;
      case 'estudiantes-grupo':
        reportObservable = this.reportService.getEstudiantesGrupo();
        break;
      case 'estudiantes-mejor-puntaje':
        reportObservable = this.reportService.getEstudiantesMejorPuntaje();
        break;
      case 'examenes-grupo-especifico':
        const grupo = prompt('Ingrese el nombre del grupo:');
        reportObservable = this.reportService.getExamenesGrupoEspecifico(grupo);
        break;
      case 'cursos-examenes-programados':
        reportObservable = this.reportService.getCursosExamenesProgramados();
        break;
      case 'estudiantes-puntaje-maximo':
        reportObservable = this.reportService.getEstudiantesPuntajeMaximo();
        break;
      case 'grupos-estudiantes':
        reportObservable = this.reportService.getGruposEstudiantes();
        break;
      default:
        this.loading = false;
        return;
    }

    reportObservable.subscribe(
      (data: any) => {
        this.reportData = data;
        this.loading = false;
      },
      (error: any) => {
        this.error = 'Error al cargar el reporte';
        this.loading = false;
      }
    );
  }

  getTableHeaders(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}
