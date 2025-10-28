import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from '../../../services/auth.service';

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
  pageSize: number = 5;
  totalPaginas: number = 1;

  faseActual: string = '';
  convocatoriaActual: any = null;
  archivosExistentes: any[] = [];
  modalInfoMasiva: any;

  codUsuario: number | null;

  // Variable para controlar columna POSTULA AQUÍ
  tieneEnProceso: boolean = false;

  constructor(private api: ApiService, private authService: AuthService) {
    this.codUsuario = this.authService.getUserId();
  }

  archivos: { anexo3?: File; anexosMult?: File } = {};
  convocatoriaSeleccionada: any = null;

  abrirModalSubidaArchivos(convocatoria: any) {
    this.convocatoriaSeleccionada = convocatoria;
    console.log(this.convocatoriaSeleccionada);
    this.archivos = {};
    const modal = new bootstrap.Modal(document.getElementById('modalSubidaDocumentos')!);
    modal.show();
  }

  archivosValidos(): boolean {
    return !!this.archivos.anexo3 && !!this.archivos.anexosMult;
  }

  enviarPostulacion() {
    if (!this.convocatoriaSeleccionada) {
      return;
    }

    Swal.fire({
      title: '¿Deseas postular a la convocatoria?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, postular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (!result.isConfirmed) return;

      // Datos para registrar la postulación
      const data = {
        iCodPostulacion: 0,
        iCodUsuario: this.codUsuario,
        iCodConvocatoria: this.convocatoriaSeleccionada.iCodConvocatoria || 0,
        iCodUsuarioRegistra: this.codUsuario,
      };

      // 1️⃣ Registrar la postulación
      this.api.insertarPostulacion(data).subscribe({
        next: (response: any) => {
          // ✅ Obtener iCodPostulacion del backend
          const iCodPostulacion = response?.iCodPostulacion;
          console.log('Código de postulación creado:', iCodPostulacion);

          if (!iCodPostulacion) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se obtuvo el código de postulación del servidor.',
              confirmButtonColor: '#dc3545'
            });
            return;
          }

          // 2️⃣ Construir FormData con el código correcto
          const formData = new FormData();
          formData.append('codUsuario', String(this.codUsuario));
          formData.append('codPostulacion', String(iCodPostulacion)); // ✅ Usar el código real

          // Archivos seleccionados
          formData.append('files', this.archivos.anexo3!);
          formData.append('files', this.archivos.anexosMult!);

          // Formatos (puedes ajustar los IDs si lo requieres)
          formData.append('formatos', '1'); // Anexo 3
          formData.append('formatos', '2'); // Anexos múltiples

          // 3️⃣ Subir archivos
          this.api.subirArchivosPostulacion(formData).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: '¡Postulación exitosa!',
                text: 'Tu postulación y documentos fueron registrados correctamente.',
                confirmButtonColor: '#28a745'
              });

              // Cerrar modal
              const modalEl = document.getElementById('modalSubidaDocumentos');
              const modalInstance = bootstrap.Modal.getInstance(modalEl!);
              modalInstance?.hide();

              // Limpiar datos
              this.archivos = {};
              this.convocatoriaSeleccionada = null;
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Error al subir documentos',
                text: 'Tu postulación fue registrada, pero ocurrió un error al subir los archivos.',
                confirmButtonColor: '#dc3545'
              });
              console.error('Error al subir archivos:', err);
            }
          });
        },
        error: (err) => {
          const mensajeError = err?.error?.mensaje || '';
          if (mensajeError.includes('El usuario ya está postulado')) {
            Swal.fire({
              icon: 'warning',
              title: 'Atención',
              text: 'Ya te has postulado a esta convocatoria anteriormente.',
              confirmButtonColor: '#f8bb86'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo registrar la postulación. Intenta nuevamente.',
              confirmButtonColor: '#dc3545'
            });
          }
          console.error('Error al registrar postulación:', err);
        }
      });
    });
  }

  onFileSelected(event: Event, tipo: 'anexo3' | 'anexosMult') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      if (archivo.type !== 'application/pdf') {
        Swal.fire({
          icon: 'error',
          title: 'Archivo inválido',
          text: 'Solo se permiten archivos PDF.',
        });
        input.value = ''; // Limpiar input
        return;
      }
      this.archivos[tipo] = archivo;
    }
  }

  ngOnInit(): void {
    this.buscarConvocatorias();
  }


  buscarConvocatorias(): void {
    this.api.getConvocatoriasPaginadoconFase({}).subscribe({
      next: (resp: any[]) => {
        if (!Array.isArray(resp)) {
          this.convocatorias = [];
          this.totalPaginas = 1;
          this.tieneEnProceso = false;
          return;
        }

        // Filtrar solo las convocatorias en estado 'EN PROCESO'
        const convocatoriasEnProceso = resp.filter(c => c.vEstadoConvocatoria === 'EN PROCESO');

        // Total de registros 'EN PROCESO'
        const totalRegistros = convocatoriasEnProceso.length;

        // Calcular total de páginas
        this.totalPaginas = Math.ceil(totalRegistros / this.pageSize);

        // Aplicar paginación sobre el array filtrado
        const startIndex = (this.paginaActual - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.convocatorias = convocatoriasEnProceso.slice(startIndex, endIndex);

        // Como estamos mostrando solo EN PROCESO, esta variable será true si hay al menos uno
        this.tieneEnProceso = totalRegistros > 0;
      },
      error: () => {
        this.convocatorias = [];
        this.totalPaginas = 1;
        this.tieneEnProceso = false;
      }
    });
  }

  postular(convocatoria: any) {
    Swal.fire({
      title: '¿Deseas postular a la convocatoria?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, postular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (result.isConfirmed) {
        // Armar data según schema
        const data = {
          iCodPostulacion: 0,
          iCodUsuario: this.codUsuario,
          // vNumDocumento: this.usuario.vNumDocumento,
          // vNombreCompleto: this.usuario.vNombreCompleto,
          // vCorreoElectronico: this.usuario.vCorreoElectronico,
          iCodConvocatoria: convocatoria.iCodConvocatoria || 0,
          // vTituloConvocatoria: convocatoria.vTitulo,
          // iCodTipoConvocatoria: convocatoria.iCodTipoConvocatoria || 0,
          // vTipoConvocatoria: convocatoria.vTipoConvocatoria || '',
          // iCodUnidadZonal: convocatoria.iCodUnidadZonal || 0,
          // vUnidadZonal: convocatoria.vUnidadZonal || '',
          // dtFechaInicio: convocatoria.dtFechaInicio || new Date().toISOString(),
          // dtFechaFin: convocatoria.dtFechaFin || new Date().toISOString(),
          // vRequisitos: convocatoria.vRequisitos || '',
          // dtFechaPostulacion: new Date().toISOString(),
          iCodUsuarioRegistra: this.codUsuario,
          // bActivo: true
        };

        // Llamar al servicio API para insertar postulacion
        this.api.insertarPostulacion(data).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Postulación exitosa!',
              text: 'Tu postulación ha sido registrada correctamente.',
              confirmButtonColor: '#28a745'
            });
          },
          error: (err) => {
            // Revisamos si el backend nos da el mensaje específico
            const mensajeError = err?.error?.mensaje || '';
            if (mensajeError.includes('El usuario ya está postulado')) {
              Swal.fire({
                icon: 'warning',
                title: 'Atención',
                text: 'Ya te has postulado a esta convocatoria anteriormente.',
                confirmButtonColor: '#f8bb86'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo realizar la postulación. Intenta nuevamente.',
                confirmButtonColor: '#dc3545'
              });
            }
            console.error('Error al postular:', err);
          }
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

  abrirModal(convocatoria: any, tipo: string) {
    this.convocatoriaActual = convocatoria;
    this.faseActual = tipo;

    const codFormato = this.obtenerCodFormato(tipo);
    if (!codFormato) return;

    this.api.getArchivosConvocatoria(convocatoria.iCodConvocatoria, codFormato).subscribe({
      next: (archivos: any[]) => {
        this.archivosExistentes = archivos.map(a => ({ ...a, urlArchivo: a.urlArchivo }));

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
    //const url = `${this.api.baseUrlConvocatoriaDoc}${rutaArchivo}`;
    const url = `${rutaArchivo}`;
    window.open(url, '_blank');
  }
}
