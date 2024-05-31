import { Component, OnInit } from '@angular/core';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.css']
})
export class NotasComponent implements OnInit {
  selectedReport: string = '';
  reports: any[] = [];
  reportData: any[] = [];
  loading: boolean = false;
  error: string = '';

  customHeaders: string[] = [
    'PUNTAJE',
    'EXAMEN',
    'DESCRIPCION',
    'N° PREGUNTAS',
    'CURSO',
    'PROFESOR'
  ];

  headerMapping: { [key: string]: string } = {
    score: 'PUNTAJE',
    exam: 'EXAMEN',
    description: 'DESCRIPCION',
    question_count: 'N° PREGUNTAS',
    curse: 'CURSO',
    instructor: 'PROFESOR'
  };

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.selectedReport = '1';
    this.bringNotes();
  }

  bringNotes(): void {
    this.reportData = [];
    this.loading = true;
    this.error = '';

    let reportObservable;
    reportObservable = this.reportService.getNotasEstudiantes();
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
    return obj ? Object.keys(obj).map(key => this.headerMapping[key] || key) : [];
  }
}
