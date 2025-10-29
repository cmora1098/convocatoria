import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
declare var bootstrap: any;

@Component({
  selector: 'app-convocatoriasasignadas',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './convocatoriasasignadas.component.html',
  styleUrls: ['./convocatoriasasignadas.component.scss']
})
export class ConvocatoriasAsignadasComponent {
  codUsuario: number | null;
  filtroActivo = 'Todos';
  convocatorias: any[] = [];
  cargando = false;

  mostrarDetalle = false;
  detalleConvocatoria: any = null;
  cargandoDetalle = false;

  convocatoriaSeleccionada: any = null;
  postulantes: any[] = [];
  cargandoPostulantes = false;

  // Modales
  @ViewChild('modalDatos') modalDatos!: TemplateRef<any>;
  @ViewChild('modalDocumentos') modalDocumentos!: TemplateRef<any>;
  modalRef!: NgbModalRef;

  datosPersonales: any = null;
  documentos: any[] = [];
  documentosPaginados: any[] = [];
  pagina = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private http: HttpClient,
    private modalService: NgbModal
  ) {
    this.codUsuario = this.authService.getUserId();
  }

  ngOnInit(): void {
    this.cargarConvocatorias(Number(this.codUsuario));
  }

  cargarConvocatorias(iCodUsuarioEvaluador: number) {
    this.cargando = true;
    this.apiService.getCEListarConvocatoria(iCodUsuarioEvaluador).subscribe({
      next: (data) => {
        this.convocatorias = data.map(item => ({
          id: item.iCodConvocatoria,
          titulo: item.vTitulo,
          fechaInicio: this.formatearFecha(item.dtFechaInicio),
          fechaFin: this.formatearFecha(item.dtFechaFin),
          estado: this.calcularEstado(item.dtFechaInicio, item.dtFechaFin)
        }));
        this.cargando = false;
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron cargar las convocatorias', 'error');
        this.cargando = false;
      }
    });
  }

  formatearFecha(fechaIso: string) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  calcularEstado(inicio: string, fin: string) {
    const hoy = new Date();
    const fInicio = new Date(inicio);
    const fFin = new Date(fin);
    if (hoy > fFin) return 'Finalizadas';
    if (hoy >= fInicio && hoy <= fFin) {
      const dias = (fFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
      return dias <= 5 ? 'Próxima a vencer' : 'En progreso';
    }
    return 'Pendiente';
  }

  get convocatoriasFiltradas() {
    return this.filtroActivo === 'Todos'
      ? this.convocatorias
      : this.convocatorias.filter(c => c.estado === this.filtroActivo);
  }

  setFiltro(filtro: string) {
    this.filtroActivo = filtro;
  }

  verDetalles(convocatoria: any) {
    this.mostrarDetalle = true;
    this.cargandoDetalle = true;
    this.detalleConvocatoria = null;
    this.convocatoriaSeleccionada = null;
    this.postulantes = [];

    const params = { buscar: convocatoria.titulo };

    this.apiService.getConvocatoriasPaginado(params).subscribe({
      next: (resp) => {
        if (resp.items && resp.items.length > 0) {
          this.detalleConvocatoria = resp.items[0];
          this.convocatoriaSeleccionada = this.detalleConvocatoria;
          this.cargarPostulantes(this.detalleConvocatoria.iCodConvocatoria);
        }
        this.cargandoDetalle = false;
      },
      error: () => (this.cargandoDetalle = false)
    });
  }

  cargarPostulantes(codConvocatoria: number) {
    this.cargandoPostulantes = true;
    const params = { iCodConvocatoria: codConvocatoria, soloActivos: true, PageNumber: 1, PageSize: 100 };
    this.apiService.gePostulaciones(params).subscribe({
      next: (resp) => {
        this.postulantes = resp.items || [];
        this.cargandoPostulantes = false;
      },
      error: () => (this.cargandoPostulantes = false)
    });
  }

  cerrarDetalle() {
    this.mostrarDetalle = false;
  }

  // 🔸 Modal Datos personales
  abrirModalDetalle(iCodUsuario: number) {
    this.apiService.getDatosPersonales(iCodUsuario).subscribe({
      next: (data) => {
        this.datosPersonales = data;
        this.modalService.open(this.modalDatos, { size: 'md', centered: true });
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar los datos personales.', 'error');
      }
    });
  }

  obtenerSexo(codigo: number): string {
    return { 1: 'Masculino', 2: 'Femenino' }[codigo] || 'No especificado';
  }

  obtenerEstadoCivil(codigo: number): string {
    const estados: any = { 1: 'Soltero(a)', 2: 'Casado(a)', 3: 'Viudo(a)', 4: 'Divorciado(a)', 5: 'Conviviente(a)', 6: 'Separado(a)' };
    return estados[codigo] || 'No especificado';
  }

  generarFichaCurricular(iCodUsuario: number, iNombreCompleto: string) {
    this.apiService.generarFichaCurricular({ iCodUsuario }).subscribe({
      next: (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ficha_curricular_${iNombreCompleto}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => Swal.fire('Error', 'No se pudo generar la ficha curricular.', 'error')
    });
  }

  // 📁 Modal Documentos
  abrirModalDocumentos(iCodUsuario: number) {
    this.apiService.getArchivosPostulante(iCodUsuario).subscribe({
      next: (archivos: any[]) => {
        if (!archivos?.length) {
          Swal.fire('Sin documentos', 'El postulante no tiene documentos subidos.', 'info');
          return;
        }
        this.documentos = archivos.map(a => ({
          nombre: a.vNombreArchivo,
          tipo: a.vDescFormato,
          fecha: new Date(a.dtFechaRegistro).toLocaleDateString(),
          urlArchivo: a.urlArchivo
        }));
        this.pagina = 1;
        this.totalPaginas = Math.ceil(this.documentos.length / this.elementosPorPagina);
        this.actualizarDocumentosPaginados();
        this.modalRef = this.modalService.open(this.modalDocumentos, { size: 'lg' });
      },
      error: () => Swal.fire('Error', 'No se pudieron cargar los documentos.', 'error')
    });
  }

  cerrarModal() {
    this.modalRef.close();
  }

  actualizarDocumentosPaginados() {
    const ini = (this.pagina - 1) * this.elementosPorPagina;
    const fin = ini + this.elementosPorPagina;
    this.documentosPaginados = this.documentos.slice(ini, fin);
  }

  paginaAnterior() {
    if (this.pagina > 1) {
      this.pagina--;
      this.actualizarDocumentosPaginados();
    }
  }

  paginaSiguiente() {
    if (this.pagina < this.totalPaginas) {
      this.pagina++;
      this.actualizarDocumentosPaginados();
    }
  }

  verArchivo(urlArchivo: string) {
    window.open(urlArchivo, '_blank');
  }

  exportarPostulantes() {
    if (!this.convocatoriaSeleccionada) return;

    const nombreArchivo = `Reporte_${this.convocatoriaSeleccionada.vTitulo}.xlsx`;
    const data = this.postulantes.map(p => ({
      'Nombre Completo': p.nombre,
      'DNI': p.dni,
      'Correo Electrónico': p.correo,
      'Fecha Postulación': new Date(p.fechaPostulacion).toLocaleString('es-PE')
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Postulantes');
    XLSX.writeFile(workbook, nombreArchivo);

    Swal.fire({
      icon: 'success',
      title: 'Reporte generado',
      text: `Se generó correctamente el ${nombreArchivo}`,
      confirmButtonColor: '#2e7d32'
    });
  }


  // Subir Resultados
  private obtenerCodFormato(tipo: string): number {
    switch (tipo) {
      case 'bases': return 1;
      case 'comunicado': return 2;
      case 'resultados': return 3;
      case 'perfil': return 4;
      case 'cronograma': return 5;
      default: return 0;
    }
  }

  archivosSeleccionados: File[] = [];
  archivosExistentes: any[] = [];

  faseActual: string = ''; // 'bases', 'comunicado', 'resultados'
  convocatoriaActual: any = null;

  modalInfoMasiva: any; // Bootstrap modal 
  abrirModal(convocatoria: any, tipo: string) {
    this.convocatoriaActual = convocatoria;
    this.faseActual = tipo;
    this.archivosSeleccionados = [];
    this.archivosExistentes = [];

    this.cargarArchivosExistentes();

    const modalElement = document.getElementById('modalInfoMasiva');
    if (modalElement) {
      this.modalInfoMasiva = new bootstrap.Modal(modalElement);
      this.modalInfoMasiva.show();
    }
  }

  cargarArchivosExistentes() {
    const codFormato = this.obtenerCodFormato(this.faseActual);
    if (!this.convocatoriaActual || codFormato === 0) return;

    this.apiService.getArchivosConvocatoria(this.convocatoriaActual.iCodConvocatoria, codFormato).subscribe({
      next: (archivos: any[]) => {
        this.archivosExistentes = archivos.map(a => ({
          ...a,
          // Deja solo la ruta tal cual para pasar al método de descarga/ver
          urlArchivo: a.urlArchivo
        }));
      },
      error: (err) => {
        console.error('Error al obtener archivos:', err);
      }
    });
  }

  verArchivoResultado(rutaArchivo: string) {
    const url = `${rutaArchivo}`;
    window.open(url, '_blank');
  }

  eliminarArchivoGuardado(idAdjunto: string) {
    const url = `${this.apiService.baseUrl}/ArchivosConvocatoria/${idAdjunto}`;

    this.http.delete(url).subscribe({
      next: () => {
        Swal.fire({
          title: 'Archivo eliminado',
          text: 'Se eliminó correctamente el archivo seleccionado.',
          icon: 'success',
          confirmButtonColor: '#2e7d32'
        }).then(() => {
          window.location.reload(); // Esto recarga toda la página
        });
      },
      error: (error) => {
        console.error('Error al eliminar el archivo:', error);
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al eliminar el archivo.',
          icon: 'error',
          confirmButtonColor: '#d32f2f'
        });
      }
    });
  }

  eliminarArchivo(index: number) {
    this.archivosSeleccionados.splice(index, 1);
  }

  onArchivosSeleccionados(event: any) {
    const archivos: FileList = event.target.files;
    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      if (!this.archivosSeleccionados.find(f => f.name === archivo.name && f.size === archivo.size)) {
        this.archivosSeleccionados.push(archivo);
      }
    }
  }

  subirArchivo() {
    if (
      this.archivosSeleccionados.length === 0 ||
      !this.convocatoriaActual ||
      !this.faseActual ||
      !this.codUsuario
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Falta información',
        text: 'Verifica que hayas seleccionado archivos, convocatoria y tipo de fase.',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }
 
    const codFormato = this.obtenerCodFormato(this.faseActual);
    if (codFormato === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo no válido',
        text: 'El tipo de fase no es válido.',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    const formData = new FormData();

    this.archivosSeleccionados.forEach((archivo) => {
      formData.append('files', archivo);
      formData.append('formatos', codFormato.toString()); 
    });

    formData.append('codConvocatoria', this.convocatoriaActual.iCodConvocatoria);
    formData.append('codUsuario', this.codUsuario.toString());

    this.apiService.subirArchivoMasivo(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Archivos subidos!',
          text: 'Los archivos se han subido correctamente.',
          confirmButtonColor: '#2e7d32'
        });
        this.archivosSeleccionados = [];
        this.cargarArchivosExistentes();
      },
      error: (error) => {
        console.error('Error al subir archivos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al subir',
          text: 'No se pudo subir los archivos. Intente nuevamente.',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }








}

// filtroActivo: string = 'Todos';

// convocatorias = [
//   {
//     id: 1,
//     titulo: 'Desarrollador de Software',
//     fechaInicio: '01/05/2025',
//     fechaFin: '30/06/2025',
//     estado: 'En progreso'
//   },
//   {
//     id: 2,
//     titulo: 'Jefe de Proyectos',
//     fechaInicio: '01/05/2025',
//     fechaFin: '30/06/2025',
//     estado: 'En progreso'
//   },
//   {
//     id: 3,
//     titulo: 'Analista Legal II',
//     fechaInicio: '01/05/2025',
//     fechaFin: '10/06/2025',
//     estado: 'Próxima a vencer'
//   },
//   {
//     id: 4,
//     titulo: 'Analista de Datos',
//     fechaInicio: '01/05/2025',
//     fechaFin: '01/06/2025',
//     estado: 'Finalizadas'
//   }
// ];

// get convocatoriasFiltradas() {
//   if (this.filtroActivo === 'Todos') return this.convocatorias;
//   return this.convocatorias.filter(c => c.estado === this.filtroActivo);
// }

// setFiltro(filtro: string) {
//   this.filtroActivo = filtro;
// }

// verDetalles(convocatoria: any) {
//   Swal.fire({
//     title: convocatoria.titulo,
//     html: `
//       <p><b>Fecha:</b> ${convocatoria.fechaInicio} - ${convocatoria.fechaFin}</p>
//       <p><b>Estado:</b> ${convocatoria.estado}</p>
//     `,
//     icon: 'info',
//     confirmButtonText: 'Cerrar'
//   });
// }