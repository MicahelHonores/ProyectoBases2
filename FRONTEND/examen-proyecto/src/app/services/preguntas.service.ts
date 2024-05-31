import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  private apiUrl = 'https://8f5d-181-53-99-60.ngrok-free.app/preguntas';  // la URL de tu API

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createQuestion(questionData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/crear`, questionData, { headers });
  }

  updateQuestion(questionId: string | number, questionData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/actualizar/${questionId}`, questionData, { headers });
  }

  deleteQuestion(questionId: string | number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/eliminar/${questionId}`, { headers });
  }

  obtenerPreguntasPorExamen(idExamen: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/examen/${idExamen}`, { headers });
  }

  getBancoPreguntas(idProfe: number, tema: string | null = null): Observable<any[]> {
    const headers = this.getHeaders();
    let url = `https://8f5d-181-53-99-60.ngrok-free.app/banco_preguntas/${idProfe}`;
    if (tema) {
      url += `?tema=${tema}`;
    }
    return this.http.get<any[]>(url, { headers });
  }
}
