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
  private apiUbigeoDpto = 'https://localhost:7068';

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

  getFaseEstados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Estado/listar`);
  }

  getUbigeoDpto(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUbigeoDpto}/departamentos`);
  }

  getUbigeoProv(codigodepa: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUbigeoDpto}/provincias/${codigodepa}`);
  }

  getUbigeoDis(codigoprovincia: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUbigeoDpto}/distritos/${codigoprovincia}`);
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

  getConvocatoriasPaginado(params: any) {  // Listar  
    return this.http.get<any>(`${this.baseUrl}/Convocatorias/paginado`, { params });
  }

  subirArchivoMasivo(formData: FormData) {
    return this.http.post(`${this.baseUrl}/ArchivosConvocatoria/subir-multiple`, formData);
  }

  insertarConvocatoria(data: any) {
    return this.http.post(`${this.baseUrl}/Convocatorias/insertar`, data);
  }

  actualizarConvocatoria(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/Convocatorias/${id}`, data);
  }

  getArchivosConvocatoria(codConvocatoria: number, codFormato: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ArchivosConvocatoria/listar/${codConvocatoria}?iCodFormato=${codFormato}`);
  }

  eliminarConvocatoria(idConvocatoria: any) {
    return this.http.delete(`${this.baseUrl}/Convocatorias/${idConvocatoria}`);
  }

  // Fases de Convocatorias
  insertarFasesConvocatoria(data: any) {
    return this.http.post(`${this.baseUrl}/ConvocatoriaFase/insertar-multiple`, data);
  }

  eliminarFaseConvocatoria(iCodFase: number) {
    return this.http.delete(`${this.baseUrl}/ConvocatoriaFase/${iCodFase}`);
  }


  listarFasesConvocatoria(iCodConvocatoria: any) {
    return this.http.get<any>(`${this.baseUrl}/ConvocatoriaFase/listar/${iCodConvocatoria}`);
  }

  // ======================
  // Usuario
  // ====================== 

  getUsuarioPaginado(params: any) {  // Listar - Menú Principal
    return this.http.get<any>(`${this.baseUrl}/Usuarios/listar`, { params });
  }

  actualizarUsuario(idUsuario: number, data: any) {
    return this.http.put(`${this.baseUrl}/Usuarios/Actualizar/${idUsuario}`, data);
  }

  eliminarUsuario(idConvocatoria: any) {
    return this.http.delete(`${this.baseUrl}/Usuarios/eliminar/${idConvocatoria}`);
  }





  // ======================
  // Mi Perfil - Postulante
  // ====================== 

  // *******************************************************************
  // DATOS PERSONALES
  // *******************************************************************
  getDatosPersonales(iCodUsuario: number) {
    return this.http.get<any>(`${this.baseUrl}/DatosPersonales/${iCodUsuario}`);
  }

  insertarDatosPersonales(data: any) {
    return this.http.post(`${this.baseUrl}/DatosPersonales`, data);
  }

  actualizarDatosPersonales(data: any) {
    return this.http.put(`${this.baseUrl}/DatosPersonales`, data);
  }
  // *******************************************************************
  // FORMACIÓN ACADÉMICA
  // *******************************************************************
  getFormacionAcademicaPorUsuario(iCodUsuario: number) {
    return this.http.get<any[]>(`${this.baseUrl}/FormacionAcademica/usuario/${iCodUsuario}`);
  }

  insertarFormacionAcademica(data: any) {
    return this.http.post(`${this.baseUrl}/FormacionAcademica`, data);
  }

  actualizarFormacionAcademica(data: any) {
    return this.http.put(`${this.baseUrl}/FormacionAcademica`, data);
  }

  eliminarFormacionAcademica(id: number) {
    return this.http.delete(`${this.baseUrl}/FormacionAcademica/${id}`);
  }

  // *******************************************************************
  // COLEGIATURA
  // *******************************************************************

  insertarColegiatura(data: any) {
    return this.http.post(`${this.baseUrl}/Colegiatura`, data);
  }



  // *******************************************************************
  // IDIOMAS
  // *******************************************************************
  insertarIdioma(data: any) {
    return this.http.post(`${this.baseUrl}/Idioma/insert`, data);
  }

  getListarIdiomas(idPostulante: number) {
    return this.http.get<any>(`${this.baseUrl}/Idioma/getbypostulante/${idPostulante}`);
  }

  actualizarIdioma(data: any) {
    return this.http.put(`${this.baseUrl}/Idioma/update`, data);
  }

  eliminarIdioma(id: number) {
    return this.http.delete(`${this.baseUrl}/Idioma/delete/${id}`);
  }

  // *******************************************************************
  // OFIMATICA
  // *******************************************************************
  getOfimaticaByPostulante(iCodPostulante: number) {
    return this.http.get<any>(`${this.baseUrl}/OfimaticaNivelIntermedio/getByPostulante/${iCodPostulante}`);
  }

  insertarOfimatica(data: any) {
    return this.http.post(`${this.baseUrl}/OfimaticaNivelIntermedio/insert`, data);
  }

  actualizarOfimatica(id: number, estado: boolean) {
    return this.http.put(`${this.baseUrl}/OfimaticaNivelIntermedio/update/${id}`, estado);
  }





}
