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


@Component({
    selector: 'app-mispostulaciones',
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule, QuillModule],
    templateUrl: './mispostulaciones.component.html',
    styleUrls: ['./mispostulaciones.component.scss']
})

export class MisPostulacionesComponent {
    codUsuario: number | null;
    filtros: any;
    postulaciones: any[] = [];



    constructor(private apiService: ApiService, private authService: AuthService) {
        this.codUsuario = this.authService.getUserId();

        this.filtros = {
            iCodPostulacion: '',
            iCodUsuario: this.codUsuario,
            iCodConvocatoria: '',
            iCodTipoConvocatoria: '',
            iCodUnidadZonal: '',
            vNumDocumento: '',
            vNombreCompleto: '',
            vTituloConvocatoria: '',
            vTipoConvocatoria: '',
            vUnidadZonal: '',
            FechaPostulacionDesde: '',
            FechaPostulacionHasta: '',
            soloActivos: '',
        };
    }

    listarPostulaciones() {
        const params: any = {
            pageNumber: this.paginaActual,
            pageSize: this.pageSize
        };

        if (this.filtros.codTipoConvocatoria) {
            params.codTipoConvocatoria = Number(this.filtros.codTipoConvocatoria);
        }

        if (this.filtros.iCodUnidadZonal) {
            params.iCodUnidadZonal = Number(this.filtros.iCodUnidadZonal);
        }

        if (this.filtros.vUnidadZonal) {
            params.vUnidadZonal = Number(this.filtros.vUnidadZonal);
        }

        if (this.filtros.FechaPostulacionDesde) {
            params.FechaPostulacionDesde = new Date(this.filtros.FechaPostulacionDesde).toISOString();
        }

        if (this.filtros.FechaPostulacionHasta) {
            params.fechaFin = new Date(this.filtros.FechaPostulacionHasta).toISOString();
        }

        if (this.filtros.soloActivos !== '' && this.filtros.soloActivos !== null && this.filtros.soloActivos !== undefined) {
            params.soloActivos = this.filtros.soloActivos; // true o false
        }

        this.apiService.gePostulaciones(params).subscribe({
            next: (data) => {
                console.log(data);
                this.postulaciones = data.items || [];
                this.totalPaginas = Math.ceil(data.totalRecords / this.pageSize);
                this.paginaActual = this.paginaActual;
            },
            error: (error) => {
                console.error('Error al cargar convocatorias:', error);
            }
        });
    }

    ngOnInit(): void {
        this.listarPostulaciones();
    }

    eliminarPostulacion(iCodPostulacion: number): void {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará tu postulación. ¿Deseas continuar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.apiService.eliminarPostulacion(iCodPostulacion).subscribe({
                    next: () => {
                        Swal.fire('Eliminado', 'La postulación ha sido eliminada.', 'success');
                        this.listarPostulaciones();
                    },
                    error: (error) => {
                        console.error('Error al eliminar postulación:', error);
                        Swal.fire('Error', 'No se pudo eliminar la postulación.', 'error');
                    }
                });
            }
        });
    }


    // ************************************* //
    // ***********   PAGINADO   ************ //
    // ************************************* //

    paginaActual: number = 1;
    totalPaginas: number = 0;
    pageSize: number = 10;

    anteriorPagina() {
        if (this.paginaActual > 1) {
            this.paginaActual--;
            this.listarPostulaciones();
        }
    }
    irPagina(pagina: number) {
        if (pagina < 1 || pagina > this.totalPaginas) return;
        this.paginaActual = pagina;
        // this.listarUsuario();
    }
    siguientePagina() {
        if (this.paginaActual < this.totalPaginas) {
            this.paginaActual++;
            this.listarPostulaciones();
        }
    }

}
