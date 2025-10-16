import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { ApiService } from 'src/app/services/api.service';

declare var bootstrap: any;

@Component({
  selector: 'app-buscarconvocatoria_adm',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './buscarconvocatoria.component.html',
  styleUrls: ['./buscarconvocatoria.component.scss']
})
export class BuscarConvocatoriaComponent implements OnInit {

  convocatorias: any[] = [];  // Siempre inicializado como array
  paginaActual: number = 1;
  pageSize: number = 10;
  totalPaginas: number = 1;

  faseActual: string = '';
  convocatoriaActual: any = null;
  archivosExistentes: any[] = [];
  modalInfoMasiva: any;

  // Variable para controlar columna POSTULA AQUÍ
  tieneEnProceso: boolean = false;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.buscarConvocatorias();
  }

  buscarConvocatorias(): void {
    const params: any = { PageNumber: this.paginaActual, PageSize: this.pageSize };

    this.api.getConvocatoriasPaginadoconFase(params).subscribe({
      next: (resp: any[]) => {
        const filtradas = Array.isArray(resp)
          ? resp.filter(c => c.vEstadoConvocatoria && c.vEstadoConvocatoria.trim() !== '')
          : [];

        this.convocatorias = filtradas;

        // Actualizamos la variable para la columna POSTULA AQUÍ
        this.tieneEnProceso = this.convocatorias.some(c => c.vEstadoConvocatoria === 'EN PROCESO');

        const totalRegistros = resp && resp.length > 0 ? resp[0].totalRegistros || resp.length : 0;
        this.totalPaginas = Math.ceil(totalRegistros / this.pageSize);
      },
      error: () => {
        this.convocatorias = [];
        this.totalPaginas = 1;
        this.tieneEnProceso = false;
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

  abrirModal(convocatoria: any, tipo: string) {
    this.convocatoriaActual = convocatoria;
    this.faseActual = tipo;

    const codFormato = this.obtenerCodFormato(tipo);
    if (!codFormato) return;

    this.api.getArchivosConvocatoria(convocatoria.iCodConvocatoria, codFormato).subscribe({
      next: (archivos: any[]) => {
        this.archivosExistentes = archivos.map(a => ({ ...a, urlArchivo: a.vRutaArchivo }));

        if (this.archivosExistentes.length === 0) {
          Swal.fire({
            icon: 'info',
            title: `Sin ${tipo}`,
            text: `Actualmente no hay ${tipo} disponibles para esta convocatoria.`,
            confirmButtonColor: '#2e7d32'
          });
          return;
        }

        const modalElement = document.getElementById('modalInfoMasiva');
        if (modalElement) {
          this.modalInfoMasiva = new bootstrap.Modal(modalElement);
          this.modalInfoMasiva.show();
        }
      },
      error: (err) => {
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
    const url = `${this.api.baseUrlConvocatoriaDoc}${rutaArchivo}`;
    window.open(url, '_blank');
  }
}
