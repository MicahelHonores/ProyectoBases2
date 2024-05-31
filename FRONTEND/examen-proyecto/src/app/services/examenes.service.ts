import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExamenService {
  private apiUrl = 'https://8f5d-181-53-99-60.ngrok-free.app';  // la URL de tu API

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  crearExamen(examenData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.apiUrl}/examen/crear`, examenData, { headers });
  }

  actualizarExamen(examenData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiUrl}/examen/actualizar`, examenData, { headers });
  }

  eliminarExamen(idExamen: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.request<any>('delete', `${this.apiUrl}/examen/eliminar`, {
      headers,
      body: ""+idExamen
    });
  }

  obtenerExamenesProfesor(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${this.apiUrl}/examenes`, { headers });
  }

  obtenerExamenPorId(idExamen: string | number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/examen/${idExamen}`, { headers });
  }

  obtenerPreguntasPorExamen(idPregunta: string | number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiUrl}/preguntas-examen/${idPregunta}`, { headers });
  }

  almacenarPresentacionExamen(presentacionData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/almacenar_presentacion_examen`, presentacionData, { headers });
  }
}
