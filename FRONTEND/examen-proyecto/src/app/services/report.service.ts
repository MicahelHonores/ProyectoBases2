import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private baseUrl = 'https://8f5d-181-53-99-60.ngrok-free.app/reporte'; // Asegúrate de que esta URL sea correcta

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getExamenesGrupo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/examenes-grupo`, { headers: this.getHeaders() });
  }

  getEstudiantesGrupo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estudiantes-grupo`, { headers: this.getHeaders() });
  }

  getEstudiantesMejorPuntaje(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estudiantes-mejor-puntaje`, { headers: this.getHeaders() });
  }

  getExamenesGrupoEspecifico(grupo: string | null): Observable<any> {
    grupo=grupo+"";
    return this.http.get(`${this.baseUrl}/examenes-grupo-especifico`, { headers: this.getHeaders(), params: { grupo } });
  }

  getCursosExamenesProgramados(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cursos-examenes-programados`, { headers: this.getHeaders() });
  }

  getEstudiantesPuntajeMaximo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estudiantes-puntaje-maximo`, { headers: this.getHeaders() });
  }

  getGruposEstudiantes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/grupos-estudiantes`, { headers: this.getHeaders() });
  }

  getNotasEstudiantes(): Observable<any> {
    return this.http.get(`https://8f5d-181-53-99-60.ngrok-free.app/obtener-notas`, { headers: this.getHeaders() });
  }
}
