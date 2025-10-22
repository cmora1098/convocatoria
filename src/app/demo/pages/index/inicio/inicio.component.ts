import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  imports: [CommonModule, FormsModule, RouterModule],
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent implements OnInit {

  tipoConvocatoria: string = '';
  textoBusqueda: string = '';
  paginaActual: number = 1;
  totalPaginas: number = 1;
  pageSize: number = 10;

  faseActual: string = '';
  convocatoriaActual: any = null;
  archivosExistentes: any[] = [];
  modalInfoMasiva: any;

  convocatorias: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.buscarConvocatorias();
  }

  buscarConvocatorias(): void {
    const params: any = {
      PageNumber: this.paginaActual,
      PageSize: this.pageSize
    };

    if (this.tipoConvocatoria) {
      params.iCodTipoConvocatoria = this.tipoConvocatoria;
    }

    if (this.textoBusqueda) {
      params.FiltroGeneral = this.textoBusqueda;
    }

    this.api.getConvocatoriasPaginadoconFase(params).subscribe({
      next: (resp: any[]) => {
        if (Array.isArray(resp)) {
          console.log(resp);
          // Filtramos solo aquellas convocatorias que tengan vEstadoConvocatoria
          this.convocatorias = resp.filter(c => c.vEstadoConvocatoria && c.vEstadoConvocatoria.trim() !== '');

          // Total de registros viene en cada elemento (ej. totalRegistros)
          const totalRegistros = resp.length > 0 ? resp[0].totalRegistros || resp.length : 0;
          this.totalPaginas = Math.ceil(totalRegistros / this.pageSize);
        } else {
          this.convocatorias = [];
          this.totalPaginas = 1;
        }
      },
      error: (err) => {
        console.error('Error al cargar convocatorias', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las convocatorias.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
 
  irPagina(n: number): void {
    this.paginaActual = n;
    this.buscarConvocatorias();
  }

  anteriorPagina(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.buscarConvocatorias();
    }
  }

  siguientePagina(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.buscarConvocatorias();
    }
  }

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

  private obtenerLabelFase(tipo: string): string {
    switch (tipo) {
      case 'bases': return 'bases';
      case 'comunicado': return 'comunicados';
      case 'resultados': return 'resultados';
      case 'perfil': return 'perfil';
      case 'cronograma': return 'cronograma';
      default: return 'documentos';
    }
  }

  abrirModal(convocatoria: any, tipo: string) {
    this.convocatoriaActual = convocatoria;
    this.faseActual = tipo;

    const codFormato = this.obtenerCodFormato(tipo);
    if (!codFormato) return;

    this.api.getArchivosConvocatoria(convocatoria.iCodConvocatoria, codFormato).subscribe({
      next: (archivos: any[]) => {
        const archivosFiltrados = archivos.map(a => ({
          ...a,
          urlArchivo: a.urlArchivo
        }));

        if (archivosFiltrados.length === 0) {
          const label = this.obtenerLabelFase(tipo);
          Swal.fire({
            icon: 'info',
            title: `Sin ${label}`,
            text: `Actualmente no hay ${label} disponibles para esta convocatoria.`,
            confirmButtonColor: '#2e7d32'
          });
          return;
        }

        this.archivosExistentes = archivosFiltrados;

        const modalElement = document.getElementById('modalInfoMasiva');
        if (modalElement) {
          this.modalInfoMasiva = new bootstrap.Modal(modalElement);
          this.modalInfoMasiva.show();
        }
      },
      error: (err: any) => {
        console.error('Error al obtener archivos:', err);
        Swal.fire({
          icon: 'warning',
          title: '¡Atención!',
          // text: 'No se pudo cargar la información de los archivos.',
          text: 'No existen archivos subidos.',
          confirmButtonColor: '#f8bb86'
        });
      }
    });
  }

  verArchivo(rutaArchivo: string) {
    //const url = `${this.api.baseUrlConvocatoriaDoc}${rutaArchivo}`;
    const url = `${rutaArchivo}`;
    window.open(url, '_blank');
  }

}
