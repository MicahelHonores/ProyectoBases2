import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstudiantesServicioService {

  private apiUrl = 'https://8f5d-181-53-99-60.ngrok-free.app/examenes-asignados'; // Reemplaza con tu URL de API

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerExamenesNoPresentados(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  getContenidosEstudiante(): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>('https://8f5d-181-53-99-60.ngrok-free.app/contenidos-estudiante-notas', { headers });
  }

}
