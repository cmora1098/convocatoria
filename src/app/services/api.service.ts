// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public baseUrl = 'https://localhost:7106/api';
  public baseUrlConvocatoriaDoc = 'https://localhost:7106';
  // private baseUrl = 'https://intranet.agrorural.gob.pe/convocatoriasAPI/api';

  constructor(private http: HttpClient) { }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  // ======================
  // Catálogos para combos
  // ======================
  getTipoDocumentos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/TipoDocumento/listar`);
  }

  getTipoConvocatoria(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/TipoConvocatoria/listar`);
  }

  getUnidadZonal(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/UnidadZonal/listar`);
  }

  // ======================
  // Usuarios
  // ======================
  register(data: any) {
    return this.http.post(`${this.baseUrl}/Usuarios/insertar`, data);
  }

  // ======================
  // Convocatorias
  // ====================== 



  // Listar 
  getConvocatoriasPaginado(params: any) {
    return this.http.get<any>(`${this.baseUrl}/Convocatorias/paginado`, { params });
  }

  subirArchivoMasivo(formData: FormData) {
    return this.http.post(`${this.baseUrl}/ArchivosConvocatoria/subir-multiple`, formData);
  }

  insertarConvocatoria(data: any) {
    return this.http.post(`${this.baseUrl}/Convocatorias/insertar`, data);
  }

  getArchivosConvocatoria(codConvocatoria: number, codFormato: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ArchivosConvocatoria/listar/${codConvocatoria}?iCodFormato=${codFormato}`);
  }






  // Pruebas
  eliminarConvocatoria(data: any) {
    return this.http.post(`${this.baseUrl}/X`, data);
  }
}
