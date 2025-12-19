// // Angular imports
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// // Project imports
// import { SharedModule } from 'src/app/theme/shared/shared.module';
// import { QuillModule } from 'ngx-quill';

// @Component({
//   selector: 'app-asignarevaluadores',
//   standalone: true,
//   imports: [CommonModule, FormsModule, SharedModule, QuillModule],
//   templateUrl: './asignarevaluadores.component.html',
//   styleUrls: ['./asignarevaluadores.component.scss']
// })
// export class AsignarEvaluadoresComponent {
//   evaluadoresDisponibles = [
//     { id: 1, nombre: 'Juan Pérez', seleccionado: false },
//     { id: 2, nombre: 'María González', seleccionado: false },
//     { id: 3, nombre: 'Carlos Ruiz', seleccionado: false },
//   ];

//   evaluadoresAsignados = [
//     { id: 4, nombre: 'Laura Torres', seleccionado: false },
//   ];

//   // Alterna selección al hacer clic en la fila
//   toggleSeleccion(evaluador: any, tipo: 'disponibles' | 'asignados') {
//     evaluador.seleccionado = !evaluador.seleccionado;
//   }

//   // Mover de disponibles a asignados
//   asignarSeleccionados() {
//     const seleccionados = this.evaluadoresDisponibles.filter(e => e.seleccionado);
//     this.evaluadoresAsignados.push(...seleccionados.map(e => ({ ...e, seleccionado: false })));
//     this.evaluadoresDisponibles = this.evaluadoresDisponibles.filter(e => !e.seleccionado);
//   }

//   // Mover de asignados a disponibles
//   quitarSeleccionados() {
//     const seleccionados = this.evaluadoresAsignados.filter(e => e.seleccionado);
//     this.evaluadoresDisponibles.push(...seleccionados.map(e => ({ ...e, seleccionado: false })));
//     this.evaluadoresAsignados = this.evaluadoresAsignados.filter(e => !e.seleccionado);
//   }
// }

// Angular imports
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2'; // Importamos SweetAlert2

import { AuthService } from '../../../services/auth.service';

declare var bootstrap: any;

@Component({
  selector: 'app-asignarevaluadores',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './asignarevaluadores.component.html',
  styleUrls: ['./asignarevaluadores.component.scss']
})
export class AsignarEvaluadoresComponent {
  codUsuario: number | null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.codUsuario = this.authService.getUserId(); // ✅ Ya tienes codUsuario aquí
  }

  tiposRegimen: any[] = []; // Para almacenar los tipos de documentos que vienen de la API
  tiposUnidadZonal: any[] = [];

  private timeout: any;

  buscarAuto() {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.listarConvocatorias();
    }, 400); // ⏱️ puedes ajustar el tiempo
  }

  ngOnInit(): void {
    this.listarConvocatorias();

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
          confirmButtonColor: '#2e7d32' // Verde AgroRural
        });
      }
    });

    // this.apiService.getUnidadZonal().subscribe({
    //   next: (data) => {
    //     this.tiposUnidadZonal = data;
    //   },
    //   error: (err) => {
    //     console.error('Error al cargar tipos de regimen', err);
    //     Swal.fire({
    //       icon: 'error',
    //       title: '¡Error!',
    //       text: 'Ocurrió un error al cargar los tipos de Unidad Zonal.',
    //       confirmButtonText: 'Aceptar',
    //       confirmButtonColor: '#2e7d32'   // Verde AgroRural
    //     });
    //   }
    // });

    // this.apiService.getFaseEstados().subscribe({
    //   next: (data) => {
    //     this.estadosFase = data;
    //   },
    //   error: (err) => {
    //     console.error('Error al cargar tipos de regimen', err);
    //     Swal.fire({
    //       icon: 'error',
    //       title: '¡Error!',
    //       text: 'Ocurrió un error al cargar los tipos de Unidad Zonal.',
    //       confirmButtonText: 'Aceptar',
    //       confirmButtonColor: '#2e7d32'   // Verde AgroRural
    //     });
    //   }
    // });
  }

  filtros: any = {
    codTipoConvocatoria: '',
    fechaInicio: '',
    fechaFin: '',
    buscar: '',
    bActivo: ''
  };

  convocatorias: any[] = [];
  paginaActual: number = 1;
  totalPaginas: number = 0;
  pageSize: number = 10;

  faseActual: string = ''; // 'bases', 'comunicado', 'resultados'
  convocatoriaActual: any = null;

  archivosSeleccionados: File[] = [];
  archivosExistentes: any[] = [];

  listarConvocatorias() {
    const params: any = {
      pageNumber: this.paginaActual,
      pageSize: this.pageSize,
      bActivo: true // 👈 Solo traemos convocatorias activas desde el backend
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

    this.apiService.getConvocatoriasPaginado(params).subscribe({
      next: (data) => {
        this.convocatorias = data.items || [];
        this.totalPaginas = Math.ceil(data.totalRecords / this.pageSize);
      },
      error: (error) => {
        console.error('Error al cargar convocatorias:', error);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar las convocatorias.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
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

  evaluadores: any[] = [];
  filtroEvaluador: string = '';
  modalEvaluadores: any;

  modalInfoMasiva: any; // Bootstrap modal
  evaluadoresAsignados: any[] = []; // evaluadores ya asignados a la convocatoria

  abrirModal(convocatoria: any, tipo: string) {
    this.convocatoriaActual = convocatoria;

    // Primero, listamos los evaluadores asignados
    this.apiService.getEvaluadoresPorConvocatoria(this.convocatoriaActual.iCodConvocatoria).subscribe({
      next: (data) => {
        this.evaluadoresAsignados = data || [];
        this.listarEvaluadores(); // Luego cargamos todos los evaluadores activos
      },
      error: (err) => {
        console.error('Error al obtener evaluadores asignados:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo obtener la lista de evaluadores asignados.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
      }
    });

    // Inicializar modal Bootstrap
    const modalElement = document.getElementById('modalAsignarEvaluadores');
    if (modalElement) {
      this.modalEvaluadores = new bootstrap.Modal(modalElement);
      this.modalEvaluadores.show();
    }
  }

  listarEvaluadores() {
    const params: any = {
      codRol: 2,
      activo: true,
      buscar: this.filtroEvaluador?.trim() || ''
    };

    this.apiService.getUsuarioPaginado(params).subscribe({
      next: (data) => {
        // Validamos que data sea array o contenga items
        const usuariosArray = Array.isArray(data) ? data : data.items || [];
        this.evaluadores = usuariosArray.map((item: any) => ({
          idUsuario: item.idUsuario || item.iCodUsuario || 0, // <— Asegúrate del nombre que viene de la API
          apePaterno: item.apePaterno || '',
          apeMaterno: item.apeMaterno || '',
          nombres: item.nombres || '',
          numDocumento: item.numDocumento || '',
          correoElectronico: item.correoElectronico || '',
          seleccionado: false
        }));
      },
      error: (err) => {
        console.error('Error al cargar evaluadores:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al cargar los evaluadores.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }

  guardarAsignacion() {
    const seleccionados = this.evaluadores.filter((e) => e.seleccionado);

    if (seleccionados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Sin selección!',
        text: 'Debe seleccionar al menos un evaluador para asignar.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    // 🔎 Dividimos evaluadores asignados en activos y desactivados
    const activosIds = this.evaluadoresAsignados
      .filter((a) => a.bActivo) // bActivo = true significa que está asignado actualmente
      .map((a) => a.iCodUsuarioEvaluador);

    const desactivadosIds = this.evaluadoresAsignados
      .filter((a) => !a.bActivo) // bActivo = false significa que fue desactivado
      .map((a) => a.iCodUsuarioEvaluador);

    // 🔹 Evaluadores que son nuevos o que fueron desactivados
    const pendientes = seleccionados.filter((e) => !activosIds.includes(e.idUsuario));

    if (pendientes.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Sin nuevos evaluadores',
        text: 'Todos los evaluadores seleccionados ya están activos en esta convocatoria.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea asignar/reactivar ${pendientes.length} evaluador(es) a la convocatoria "${this.convocatoriaActual.vTitulo}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2e7d32'
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'Asignando evaluadores...',
        html: 'Por favor espere unos segundos.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      let nuevos = 0;
      let reactivados = 0;
      let errores = 0;
      const total = pendientes.length;

      pendientes.forEach((evaluador) => {
        this.apiService.asignarEvaluadores(this.convocatoriaActual.iCodConvocatoria, evaluador.idUsuario, this.codUsuario!).subscribe({
          next: (res: any) => {
            if (res.mensaje?.includes('reactivada')) {
              reactivados++;
            } else {
              nuevos++;
            }

            if (nuevos + reactivados + errores === total) {
              this.finalizarAsignacionAvanzada(nuevos, reactivados, errores);
            }
          },
          error: (err) => {
            console.error('❌ Error al asignar evaluador:', err);
            errores++;
            if (nuevos + reactivados + errores === total) {
              this.finalizarAsignacionAvanzada(nuevos, reactivados, errores);
            }
          }
        });
      });
    });
  }

  // Nueva función para mostrar resultado con nuevos + reactivados
  finalizarAsignacionAvanzada(nuevos: number, reactivados: number, errores: number) {
    Swal.close();

    let mensaje = '';
    if (nuevos > 0) mensaje += `${nuevos} evaluador(es) asignados correctamente.\n`;
    if (reactivados > 0) mensaje += `${reactivados} evaluador(es) reactivados correctamente.\n`;
    if (errores > 0) mensaje += `${errores} evaluador(es) no pudieron ser asignados.\n`;

    const icon = errores === 0 ? 'success' : nuevos + reactivados === 0 ? 'info' : 'warning';

    Swal.fire({
      icon,
      title: 'Resultado de la asignación',
      text: mensaje.trim(),
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#2e7d32'
    }).then(() => {
      this.modalEvaluadores?.hide();
      this.listarConvocatorias();
    });
  }

  desactivarEvaluador(iCodConvocatoria: number, iCodUsuarioEvaluador: number) {
    const iCodUsuarioAccion = this.codUsuario;
    const params = {
      iCodConvocatoria,
      iCodUsuarioEvaluador,
      iCodUsuarioAccion
    };

    this.apiService.postDesactivarEvaluador(params).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Evaluador desactivado',
          text: 'El evaluador ha sido desactivado correctamente.',
          confirmButtonColor: '#2e7d32'
        });
        // Actualizar lista de evaluadores asignados
        this.listarEvaluadoresAsignados();
      },
      error: (err) => {
        console.error('Error al desactivar evaluador:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo desactivar al evaluador.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  listarEvaluadoresAsignados() {
    if (!this.convocatoriaActual?.iCodConvocatoria) return;

    this.apiService.getEvaluadoresPorConvocatoria(this.convocatoriaActual.iCodConvocatoria).subscribe({
      next: (data) => {
        this.evaluadoresAsignados = data || [];
      },
      error: (err) => {
        console.error('Error al cargar evaluadores asignados', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los evaluadores asignados.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
