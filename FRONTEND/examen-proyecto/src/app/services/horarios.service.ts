import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HorariosService {
  private apiUrl = 'https://8f5d-181-53-99-60.ngrok-free.app'; // la URL de tu API

  constructor(private http: HttpClient) {}

  getHorarios(semana?: number, semestre?: string): Observable<any[]> {
    // Obtener el token de autenticación del almacenamiento local
    const token = localStorage.getItem('authToken');

    // Verificar si se ha autenticado el usuario
    if (token) {
      // Crear encabezados con el token de autenticación
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Hacer la solicitud HTTP con los encabezados adecuados y los parámetros de consulta
      return this.http.get<any[]>(`${this.apiUrl}/horarios?semana=${semana}&semestre=${semestre}`, { headers });
    } else {
      // Si no hay token, retorna un observable vacío o maneja el error según sea necesario
      return new Observable<any[]>(observer => {
        observer.error('No se proporcionó un token de autenticación');
      });
    }
  }

  getHorariosEstudiante(semana?: number, semestre?: string): Observable<any[]> {
    // Obtener el token de autenticación del almacenamiento local
    const token = localStorage.getItem('authToken');

    // Verificar si se ha autenticado el usuario
    if (token) {
      // Crear encabezados con el token de autenticación
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Hacer la solicitud HTTP con los encabezados adecuados y los parámetros de consulta
      return this.http.get<any[]>(`${this.apiUrl}/estudiante_horarios?semana=${semana}&semestre=${semestre}`, { headers });
    } else {
      // Si no hay token, retorna un observable vacío o maneja el error según sea necesario
      return new Observable<any[]>(observer => {
        observer.error('No se proporcionó un token de autenticación');
      });
    }
  }

  getSemestres(): Observable<any[]> {
    // Obtener el token de autenticación del almacenamiento local
    const token = localStorage.getItem('authToken');

    // Verificar si se ha autenticado el usuario
    if (token) {
      // Crear encabezados con el token de autenticación
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      // Hacer la solicitud HTTP con los encabezados adecuados
      return this.http.get<any[]>(`${this.apiUrl}/semestres`, { headers });
    } else {
      // Si no hay token, retorna un observable vacío o maneja el error según sea necesario
      return new Observable<any[]>(observer => {
        observer.error('No se proporcionó un token de autenticación');
      });
    }
  }
}
