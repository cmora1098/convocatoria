// import { Component } from '@angular/core';
// import { RouterModule } from '@angular/router';
// import { SharedModule } from 'src/app/theme/shared/shared.module';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-inicio',
//   standalone: true,
//   imports: [SharedModule, RouterModule, FormsModule],
//   templateUrl: './inicio.component.html',
//   styleUrls: ['./inicio.component.scss']
// })
// export class InicioComponent {

//   tipoConvocatoria: string = ''; // TODOS por defecto
//   textoBusqueda: string = '';

//   convocatorias: any[] = [];

//   ngOnInit(): void {
//     this.buscarConvocatorias();
//   }

//   buscarConvocatorias(): void {
//     // Datos en duro (mock)
//     this.convocatorias = [
//       {
//         proceso: '129-OGRH-2025',
//         detalle: 'POR SUPLENCIA DE UN (01) ANALISTA I EN SELECCIÓN DE PERSONAL PARA LA OFICINA DE DESARROLLO DE RECURSOS HUMANOS',
//         sede: 'Av. Plaza 30 de Agosto S/N, San Isidro - Lima',
//         estado: 'NUEVA',
//         bases: true,
//         comunicado: false,
//         resultados: false
//       },
//       {
//         proceso: '128-OGRH-2025',
//         detalle: 'ANALISTA I DE GESTIÓN ADMINISTRATIVA PARA LA OFICINA GENERAL DE ASESORÍA JURÍDICA DEL MININTER',
//         sede: 'Av. Plaza 30 de Agosto S/N, San Isidro - Lima',
//         estado: 'NUEVA',
//         bases: true,
//         comunicado: false,
//         resultados: false
//       },
//       {
//         proceso: '127-OGRH-2025',
//         detalle: 'ESPECIALISTA II EN COMUNICACIÓN, DIFUSIÓN Y PROTOCOLO PARA EL DESPACHO VICEMINISTERIAL DE SEGURIDAD PÚBLICA',
//         sede: 'Av. Plaza 30 de Agosto S/N, San Isidro - Lima',
//         estado: 'NUEVA',
//         bases: true,
//         comunicado: false,
//         resultados: false
//       }
//     ];
//   }
// }
import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  imports: [CommonModule, FormsModule],
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
      pageNumber: this.paginaActual,
      pageSize: this.pageSize
    };

    if (this.tipoConvocatoria) {
      params.codTipoConvocatoria = this.tipoConvocatoria;
    }

    if (this.textoBusqueda) {
      params.buscar = this.textoBusqueda;
    }

    this.api.getConvocatoriasPaginado(params).subscribe({
      next: (resp) => {
        this.convocatorias = resp.items;
        this.totalPaginas = Math.ceil(resp.totalRecords / this.pageSize);
      },
      error: (err) => {
        console.error('Error al cargar convocatorias', err);
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
          urlArchivo: a.vRutaArchivo
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
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información de los archivos.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  verArchivo(rutaArchivo: string) {
    const url = `${this.api.baseUrlConvocatoriaDoc}${rutaArchivo}`;
    window.open(url, '_blank');
  }


}
