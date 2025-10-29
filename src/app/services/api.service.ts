// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public baseUrl = 'https://intranet.agrorural.gob.pe/convocatoriasAPI/api';
  public baseUrlConvocatoriaDoc = 'https://intranet.agrorural.gob.pe/convocatoriasAPI';
  private apiUbigeoDpto = 'https://intranet.agrorural.gob.pe/apiubigeo';

  // public baseUrl = 'https://localhost:7106/api';

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

  // Listado con Paginado con Fase
  getConvocatoriasPaginadoconFase(params: any) {  // Listar  
    return this.http.get<any>(`${this.baseUrl}/Convocatorias/listar-paginado-conFase`, { params });
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

  // =================================
  // Buscar Convocatorias - Postulante
  // =================================
  gePostulaciones(params: any) {
    return this.http.get<any>(`${this.baseUrl}/Postulaciones/listar-paginado`, { params });
  }

  insertarPostulacion(data: any) {
    return this.http.post(`${this.baseUrl}/Postulaciones/insertar`, data);
  }

  subirArchivosPostulacion(data: FormData) {
    return this.http.post(`${this.baseUrl}/ArchivoPostulacion/subir-multiple`, data);
  }

  eliminarPostulacion(iCodPostulacion: number) {
    return this.http.delete(`${this.baseUrl}/Postulaciones/eliminar/${iCodPostulacion}`);
  }

  getArchivosPostulante(iCodUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/ArchivoPostulacion/listar-por-Postulante/?iCodUsuario=${iCodUsuario}`);
  }

  asignarEvaluadores(iCodConvocatoria: number, iCodUsuarioEvaluador: number, iCodUsuarioRegistra: number) {
    const params = {
      iCodConvocatoria,
      iCodUsuarioEvaluador,
      iCodUsuarioRegistra
    };

    // Body va vacío porque los datos van por query string
    return this.http.post(`${this.baseUrl}/ConvocatoriaEvaluador/asignar`, null, { params });
  }

  getEvaluadoresPorConvocatoria(iCodConvocatoria: number) {
    return this.http.get<any[]>(`${this.baseUrl}/ConvocatoriaEvaluador/evaluadores/${iCodConvocatoria}`);
  }
  postDesactivarEvaluador(params: any) {
    return this.http.post<any>(`${this.baseUrl}/ConvocatoriaEvaluador/desactivar`, null, { params });
  }

  // ======================
  // Comite de Evaluación
  // ====================== 

  getCEListarConvocatoria(iCodUsuarioEvaluador: number) {
    return this.http.get<any[]>(`${this.baseUrl}/ConvocatoriaEvaluador/convocatorias/${iCodUsuarioEvaluador}`);
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
  getColegiaturaPorUsuario(idUsuario: number) {
    return this.http.get(`${this.baseUrl}/Colegiatura/usuario/${idUsuario}`);
  }

  insertarColegiatura(data: any) {
    return this.http.post(`${this.baseUrl}/Colegiatura`, data);
  }

  actualizarColegiatura(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/Colegiatura/${id}`, data);
  }

  eliminarColegiatura(id: number) {
    return this.http.delete(`${this.baseUrl}/Colegiatura/${id}`);
  }

  // *******************************************************************
  // EXPERIENCIA LABORAL
  // *******************************************************************  
  getExperienciaLaboral(iCodUsuario: number) {
    return this.http.get<any[]>(`${this.baseUrl}/ExperienciaLaboral/usuario/${iCodUsuario}`);
  }

  actualizarExperienciaLaboral(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/ExperienciaLaboral/${id}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  insertarExperienciaLaboral(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ExperienciaLaboral`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  eliminarExperienciaLaboral(id: number) {
    return this.http.delete(`${this.baseUrl}/ExperienciaLaboral/${id}`);
  }

  // *******************************************************************
  //  CURSOS, DIPLOMADOS Y/O ESPECIALIZACIÓN
  // *******************************************************************
  getCursoDiplomadoPorUsuario(iCodUsuario: number) {
    return this.http.get<any[]>(`${this.baseUrl}/CursoDiplomado/listar/${iCodUsuario}`);
  }

  insertarCursosDiplomado(data: any, options?: any) {
    return this.http.post(`${this.baseUrl}/CursoDiplomado/insertar`, data, { ...options, responseType: 'text' });
  }

  actualizarCursoDiplomado(data: any, options?: any) {
    return this.http.put(`${this.baseUrl}/CursoDiplomado/actualizar`, data, { ...options, responseType: 'text' });
  }

  eliminarCursoDiplomado(iCodCursoDiplomado: number) {
    return this.http.delete(`${this.baseUrl}/CursoDiplomado/eliminar/${iCodCursoDiplomado}`, { responseType: 'text' });
  }

  // *******************************************************************
  // IDIOMAS
  // *******************************************************************
  getListarIdiomas(iCodUsuario: number) {
    return this.http.get<any>(`${this.baseUrl}/Idioma/listar/${iCodUsuario}`);
  }

  insertarIdioma(data: any, options?: any) {
    return this.http.post(`${this.baseUrl}/Idioma/insertar`, data, options);
  }

  actualizarIdioma(data: any, options?: any) {
    return this.http.put(`${this.baseUrl}/Idioma/actualizar`, data, options);
  }

  eliminarIdioma(iCodIdioma: number) {
    return this.http.delete(`${this.baseUrl}/Idioma/eliminar/${iCodIdioma}`);
  }

  // *******************************************************************
  // OFIMATICA
  // *******************************************************************
  getOfimaticaByPostulante(iCodUsuario: number) {
    const params = new HttpParams().set('iCodUsuario', iCodUsuario.toString());
    return this.http.get<any>(`${this.baseUrl}/OfimaticaNivelIntermedio/listar`, { params });
  }

  insertarOfimatica(data: any) {
    return this.http.post(`${this.baseUrl}/OfimaticaNivelIntermedio/insertar`, data);
  }

  actualizarOfimatica(data: any) {
    return this.http.put(`${this.baseUrl}/OfimaticaNivelIntermedio/actualizar`, data);
  }

  // *******************************************************************
  // BONIFICACIONES ADICIONALES
  // *******************************************************************
  getBonificacionesAdicionales(iCodUsuario: number) {
    const params = new HttpParams().set('iCodUsuario', iCodUsuario.toString());
    return this.http.get<any>(`${this.baseUrl}/BonificacionesAdicionales/listar`, { params });
  }

  insertarBonificacionesAdicionales(data: any) {
    return this.http.post(`${this.baseUrl}/BonificacionesAdicionales/insertar`, data);
  }

  actualizarBonificacionesAdicionales(data: any) {
    return this.http.put(`${this.baseUrl}/BonificacionesAdicionales/actualizar`, data);
  }

  // *******************************************************************
  // DECLARACIÓN JURADA
  // *******************************************************************
  getDeclaracionJuradaPostulante(iCodUsuario: number) {
    const params = new HttpParams().set('iCodUsuario', iCodUsuario.toString());
    return this.http.get<any>(`${this.baseUrl}/DeclaracionJuradaPostulante/listar`, { params });
  }

  insertarDeclaracionJurada(data: any) {
    return this.http.post(`${this.baseUrl}/DeclaracionJuradaPostulante/insertar`, data);
  }

  actualizarDeclaracionJurada(data: any) {
    return this.http.post<any>(`${this.baseUrl}/DeclaracionJuradaPostulante/actualizar`, data);
  }

  // *******************************************************************
  // GENERAR ANEXO 3
  // *******************************************************************
  generarFichaCurricular(data: any) {
    return this.http.post(`${this.baseUrl}/FichaCurricular/generar`, data, {
      responseType: 'blob', // <-- Importante, porque devuelve un PDF
    });
  }

}
