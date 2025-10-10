// Angular imports
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';  // Importamos SweetAlert2

import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

declare var bootstrap: any;

@Component({
  selector: 'app-gestionconvocatoria',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './gestionconvocatoria.component.html',
  styleUrls: ['./gestionconvocatoria.component.scss']
})

export class GestionConvocatoriaComponent {

  constructor(private apiService: ApiService, private authService: AuthService, private http: HttpClient) {
    this.codUsuario = this.authService.getUserId(); // ✅ Ya tienes codUsuario aquí   
  }

  ngOnInit(): void {
    this.apiService.getTipoConvocatoria().subscribe({
      next: (data) => {
        this.tiposRegimen = data;
      },
      error: (err) => {
        console.error('Error al cargar tipos de regimen', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar los tipos de regimen.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
      }
    });

    this.apiService.getUnidadZonal().subscribe({
      next: (data) => {
        this.tiposUnidadZonal = data;
      },
      error: (err) => {
        console.error('Error al cargar tipos de regimen', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar los tipos de Unidad Zonal.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
      }
    });

    this.apiService.getFaseEstados().subscribe({
      next: (data) => {
        this.estadosFase = data;
      },
      error: (err) => {
        console.error('Error al cargar tipos de regimen', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar los tipos de Unidad Zonal.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
      }
    });

    this.listarConvocatorias();
  }


  // Listado
  convocatorias: any[] = [];
  paginaActual: number = 1;
  totalPaginas: number = 0;
  pageSize: number = 10;

  filtros: any = {
    codTipoConvocatoria: '',
    fechaInicio: '',
    fechaFin: '',
    buscar: '',
    bActivo: ''
  };


  listarConvocatorias() {
    const params: any = {
      pageNumber: this.paginaActual,
      pageSize: this.pageSize
    };

    if (this.filtros.codTipoConvocatoria) {
      params.codTipoConvocatoria = Number(this.filtros.codTipoConvocatoria);
    }

    if (this.filtros.fechaInicio) {
      params.fechaInicio = new Date(this.filtros.fechaInicio).toISOString();
    }

    if (this.filtros.fechaFin) {
      params.fechaFin = new Date(this.filtros.fechaFin).toISOString();
    }

    if (this.filtros.buscar) {
      params.buscar = this.filtros.buscar;
    }

    if (this.filtros.bActivo !== '' && this.filtros.bActivo !== null && this.filtros.bActivo !== undefined) {
      params.bActivo = this.filtros.bActivo; // true o false
    }

    this.apiService.getConvocatoriasPaginado(params).subscribe({
      next: (data) => {
        this.convocatorias = data.items || [];
        this.totalPaginas = Math.ceil(data.totalRecords / this.pageSize);
        this.paginaActual = this.paginaActual;
      },
      error: (error) => {
        console.error('Error al cargar convocatorias:', error);
      }
    });
  }


  irPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.listarConvocatorias();
  }

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.listarConvocatorias();
    }
  }

  anteriorPagina() {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.listarConvocatorias();
    }
  }

  eliminarConvocatoria(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.eliminarConvocatoria(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La convocatoria ha sido eliminada.', 'success');
            this.listarConvocatorias(); // Recargar la lista
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar la convocatoria.', 'error');
          }
        });
      }
    });
  }

  // Subida de Archivos por Fases.  
  // Nueva Convocatoria
  codUsuario: number | null;

  // Estado del componente
  mostrarLista: boolean = true;
  modoEdicion: boolean = false;

  // ComboBox
  tiposRegimen: any[] = []; // Para almacenar los tipos de documentos que vienen de la API
  tiposUnidadZonal: any[] = [];



  // Nueva Convocatoria
  // Modelo de convocatoria 
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

  onArchivosSeleccionados(event: any) {
    const archivos: FileList = event.target.files;
    for (let i = 0; i < archivos.length; i++) {
      const archivo = archivos[i];
      if (!this.archivosSeleccionados.find(f => f.name === archivo.name && f.size === archivo.size)) {
        this.archivosSeleccionados.push(archivo);
      }
    }
  }

  eliminarArchivo(index: number) {
    this.archivosSeleccionados.splice(index, 1);
  }

  verArchivo(rutaArchivo: string) {
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
      formData.append('formatos', codFormato.toString()); // uno por archivo
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

  // Volver a la lista
  volverALista() {
    this.mostrarLista = true;
  }


  // **********************************************
  // ******   CREAR NUEVA CONVOCATORIA     ********
  // **********************************************

  // Quitar etiquetas HTML de Quill
  private limpiarHtml(texto: string): string {
    const div = document.createElement('div');
    div.innerHTML = texto;
    return div.textContent || div.innerText || '';
  }

  convocatoriaSeleccionada: any = {
    requisitos: '',
    tipo: ''
  };

  nuevaConvocatoria() {
    this.modoEdicion = false;
    this.mostrarLista = false;
    this.convocatoriaSeleccionada = {
      requisitos: '',
      tipo: '',
      unidadzonal: ''
    };
  }

  guardarConvocatoria() {
    if (!this.convocatoriaSeleccionada.nombre || !this.convocatoriaSeleccionada.tipo || !this.convocatoriaSeleccionada.unidadzonal || !this.convocatoriaSeleccionada.fechaInicio || !this.convocatoriaSeleccionada.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: '¡Campos incompletos!',
        text: 'Por favor, complete todos los campos obligatorios.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    // 👇 Convertimos a formato ISO que .NET entiende bien
    const fechaInicioISO = new Date(this.convocatoriaSeleccionada.fechaInicio).toISOString();
    const fechaFinISO = new Date(this.convocatoriaSeleccionada.fechaFin).toISOString();

    const nuevaConvocatoria = {
      titulo: this.convocatoriaSeleccionada.nombre,
      codTipoConvocatoria: Number(this.convocatoriaSeleccionada.tipo),
      fechaInicio: fechaInicioISO,
      fechaFin: fechaFinISO,
      codUnidadZonal: Number(this.convocatoriaSeleccionada.unidadzonal),
      requisitos: this.limpiarHtml(this.convocatoriaSeleccionada.requisitos),
      codUsuarioRegistra: this.codUsuario
    };

    this.apiService.insertarConvocatoria(nuevaConvocatoria).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Convocatoria registrada!',
          text: 'La convocatoria ha sido guardada correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        }).then(() =>
          //this.volverALista()
          window.location.reload()
        );
      },
      error: (err) => {
        console.error('❌ Error al guardar convocatoria:', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'No se pudo registrar la convocatoria. Intente nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }

  // **********************************************
  // ****** FIN CREAR NUEVA CONVOCATORIA   ********
  // **********************************************



  // **********************************************
  // ************         FASES     ***************
  // **********************************************

  modalFasesMasiva: any; // Bootstrap modal
  estadosFase: any[] = []; // Para el ComboBox de estados
  currentCodConvocatoria: number | null = null;

  // Data existente (del backend)
  fasesExistentes: any[] = [];

  // Data temporal (nuevas fases antes de guardar)
  fasesTemp: any[] = [];

  // Fase en edición
  fase: any = {
    codEstado: 0,
    fechaInicio: '',
    fechaFin: ''
  };

  // =========================
  // Abrir modal y listar data
  // =========================
  abrirModalFases(convocatoria: any, tipo: string) {
    this.currentCodConvocatoria = convocatoria.iCodConvocatoria;

    // Limpiar fases temporales al abrir
    this.fasesTemp = [];

    // Cargar fases existentes desde API
    this.apiService.listarFasesConvocatoria(this.currentCodConvocatoria).subscribe({
      next: (data) => {
        console.log('📥 Fases desde API:', data);
        this.fasesExistentes = data.map((f: any) => ({
          codFase: f.iCodFase,
          codConvocatoria: f.iCodConvocatoria,
          codEstado: f.iCodEstado,
          descripcion: f.vDescripcionEstado,
          fechaInicio: f.dtFechaInicio,
          fechaFin: f.dtFechaFin,
          activo: f.bActivo
        }));
      },
      error: (err) => {
        console.error('❌ Error al listar fases:', err);
        this.fasesExistentes = [];
      }
    });

    // Abrir Modal
    const modalFasesElement = document.getElementById('modalFases');
    if (modalFasesElement) {
      this.modalFasesMasiva = new bootstrap.Modal(modalFasesElement);
      this.modalFasesMasiva.show();
    }
  }

  // =========================
  // Agregar Fase Temporal
  // =========================
  agregarFase() {
    if (!this.fase.codEstado || !this.fase.fechaInicio || !this.fase.fechaFin) {
      Swal.fire('Error', 'Debe completar todos los campos antes de agregar.', 'warning');
      return;
    }

    // Buscar la descripción del estado seleccionado
    const estadoSel = this.estadosFase.find(e => e.codEstado == this.fase.codEstado);

    // Clonar fase y añadir descripción
    this.fasesTemp.push({
      codEstado: this.fase.codEstado,
      descripcion: estadoSel ? estadoSel.descripcion : '',
      fechaInicio: this.fase.fechaInicio,
      fechaFin: this.fase.fechaFin
    });

    // Reset form
    this.fase = { codEstado: 0, fechaInicio: '', fechaFin: '' };
  }

  // =========================
  // Eliminar Fase Temporal
  // =========================
  eliminarFase(index: number) {
    this.fasesTemp.splice(index, 1);
  }

  // =========================
  // Guardar Fases
  // =========================
  guardarFases() {
    if (this.fasesTemp.length === 0) {
      Swal.fire('Advertencia', 'Debes agregar al menos una fase antes de guardar.', 'warning');
      return;
    }

    // Mapeamos fases al formato que espera el API
    const fasesPayload = this.fasesTemp.map(f => ({
      codConvocatoria: this.currentCodConvocatoria,
      codEstado: f.codEstado,
      fechaInicio: new Date(f.fechaInicio).toISOString(),
      fechaFin: new Date(f.fechaFin).toISOString(),
      codUsuarioRegistra: this.codUsuario
    }));

    this.apiService.insertarFasesConvocatoria(fasesPayload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Fases registradas!',
          text: 'Las fases se guardaron correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        }).then(() => {
          this.modalFasesMasiva.hide();
          this.fasesTemp = []; // limpiar temporal
          // Recargar fases existentes para verlas en la tabla
          if (this.currentCodConvocatoria) {
            this.abrirModalFases({ iCodConvocatoria: this.currentCodConvocatoria }, 'fases');
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al guardar fases:', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'No se pudieron guardar las fases. Intente nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }

  eliminarFaseExistente(iCodFase: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará la fase seleccionada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.eliminarFaseConvocatoria(iCodFase).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'La fase ha sido eliminada.', 'success').then(() => {
              // 🔄 Refresca toda la página después de eliminar
              window.location.reload();
            });
          },
          error: (err) => {
            console.error('❌ Error al eliminar fase:', err);
            Swal.fire('Error', 'No se pudo eliminar la fase. Intente nuevamente.', 'error');
          }
        });
      }
    });
  }



  // **********************************************
  // ************    FIN  FASES     ***************
  // **********************************************
 
  editarConvocatoria(convocatoria: any): void {
    this.modoEdicion = true;
    this.mostrarLista = false;

    // Cargar la data seleccionada en el formulario
    this.convocatoriaSeleccionada = {
      id: convocatoria.iCodConvocatoria,
      tipo: convocatoria.iCodTipoDocumento,
      unidadzonal: convocatoria.iCodUnidadZonal,
      fechaInicio: convocatoria.dtFechaInicio ? convocatoria.dtFechaInicio.split("T")[0] : null,
      fechaFin: convocatoria.dtFechaFin ? convocatoria.dtFechaFin.split("T")[0] : null,
      estado: convocatoria.bActivo ? 'Activo' : 'Inactivo',
      nombre: convocatoria.vTitulo,
      requisitos: convocatoria.vRequisitos
    };

  }

  actualizarConvocatoria() {
    // Validaciones
    if (
      !this.convocatoriaSeleccionada.nombre ||
      this.convocatoriaSeleccionada.tipo === '0' ||
      !this.convocatoriaSeleccionada.fechaInicio ||
      !this.convocatoriaSeleccionada.fechaFin
    ) {
      Swal.fire({
        icon: 'warning',
        title: '¡Campos incompletos!',
        text: 'Por favor, complete todos los campos obligatorios.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    // Convertir estado "Activo/Inactivo" a número
    const estadoNumerico = this.convocatoriaSeleccionada.estado === 'Activo' ? 1 : 0;

    const data = {
      iCodConvocatoria: this.convocatoriaSeleccionada.id,
      vTitulo: this.convocatoriaSeleccionada.nombre,
      iCodTipoConvocatoria: this.convocatoriaSeleccionada.tipo,
      dtFechaInicio: this.convocatoriaSeleccionada.fechaInicio ? new Date(this.convocatoriaSeleccionada.fechaInicio).toISOString() : null,
      dtFechaFin: this.convocatoriaSeleccionada.fechaFin ? new Date(this.convocatoriaSeleccionada.fechaFin).toISOString() : null,
      vRequisitos: this.limpiarHtml(this.convocatoriaSeleccionada.requisitos),
      iCodUnidadZonal: this.convocatoriaSeleccionada.unidadzonal,
      iCodUsuarioRegistra: this.codUsuario,
      // bActivo: estadoNumerico // 👈 lo agregamos para enviar el estado
    };

    // Llamada al service con el ID
    this.apiService.actualizarConvocatoria(this.convocatoriaSeleccionada.id, data).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Convocatoria actualizada!',
          text: 'Los cambios han sido guardados correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        }).then(() => window.location.reload());
      },
      error: (err) => {
        console.error('❌ Error al guardar convocatoria:', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'No se pudo registrar la convocatoria. Intente nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }




}