// Angular imports
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

import Swal from 'sweetalert2';  // Importamos SweetAlert2
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import * as XLSX from 'xlsx';

interface Postulante {
    id: number;
    nombre: string;
    dni: string;
    correo: string;
    fechaPostulacion: string;
    codigousuario: number;
    bActivo?: boolean;
}

@Component({
    selector: 'app-verpostulantes',
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule, QuillModule],
    templateUrl: './verpostulantes.component.html',
    styleUrls: ['./verpostulantes.component.scss']
})
export class VerPostulantesComponent {

    codUsuario: number | null;
    tiposRegimen: any[] = []; // Para almacenar los tipos de documentos que vienen de la API

    convocatorias: any[] = [];
    paginaActual: number = 1;
    totalPaginas: number = 0;
    pageSize: number = 5;

    modalRef: any;

    constructor(private modalService: NgbModal, private authService: AuthService, private apiService: ApiService) {
        this.codUsuario = this.authService.getUserId();
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
        // this.listarConvocatorias();
    }

    filtros: any = {
        codTipoConvocatoria: '',
        // fechaInicio: '',
        // fechaFin: '',
        buscar: '',
        bActivo: ''
    };


    listarConvocatorias(abrirModal: boolean = true) {
        if (!this.filtros.codTipoConvocatoria) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Debe seleccionar un tipo de convocatoria antes de buscar.',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#2e7d32'
            });
            return;
        }

        const params: any = {
            codTipoConvocatoria: Number(this.filtros.codTipoConvocatoria)
        };

        if (this.filtros.buscar) params.buscar = this.filtros.buscar;
        if (this.filtros.bActivo !== '' && this.filtros.bActivo !== null) params.bActivo = this.filtros.bActivo;

        this.apiService.getConvocatoriasPaginado(params).subscribe({
            next: (data) => {
                console.log('Datos originales:', data);

                // 1️⃣ Filtrar solo convocatorias activas
                const activas = data.items.filter((c: any) => c.bActivo === true);

                // 2️⃣ Calcular total de páginas basadas en activas
                const totalActivas = activas.length;
                this.totalPaginas = Math.ceil(totalActivas / this.pageSize);

                // 3️⃣ Cortar el arreglo según la página actual
                const inicio = (this.paginaActual - 1) * this.pageSize;
                const fin = inicio + this.pageSize;
                this.convocatorias = activas.slice(inicio, fin);

                console.log(`Página ${this.paginaActual}:`, this.convocatorias);

                // 4️⃣ Abrir modal solo la primera vez
                if (abrirModal && !this.modalRef) {
                    this.modalRef = this.modalService.open(this.modalConvocatorias, {
                        size: 'xl',
                        backdrop: 'static',
                        centered: true
                    });

                    this.modalRef.result.finally(() => (this.modalRef = null));
                }
            },
            error: (error) => {
                console.error('Error al cargar convocatorias:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al listar las convocatorias.',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2e7d32'
                });
            }
        });
    }

    cambiarPagina(page: number): void {
        if (page > 0 && page <= this.totalPaginas) {
            this.paginaActual = page;
            this.listarConvocatorias(false); // No reabrir el modal
        }
    }

    @ViewChild('modalConvocatorias') modalConvocatorias!: TemplateRef<any>;

    @ViewChild('modalPostulantes') modalPostulantes!: TemplateRef<any>;

    postulantes: Postulante[] = []; // ✅ Ahora el tipo incluye codigousuario
    convocatoriaSeleccionada: any = null;

    // verPostulantes(convocatoria: any, modal: any) {
    //     this.convocatoriaSeleccionada = convocatoria;
    //     const params = {
    //         iCodConvocatoria: convocatoria.iCodConvocatoria,
    //         pageNumber: 1,
    //         pageSize: 10
    //     };

    //     this.apiService.gePostulaciones(params).subscribe({
    //         next: (data) => {
    //             console.log(data);
    //             this.postulantes = (data.items || []).map((p: any) => ({
    //                 id: p.iCodPostulacion,
    //                 nombre: p.vNombreCompleto,
    //                 dni: p.vNumDocumento,
    //                 correo: p.vCorreoElectronico,
    //                 fechaPostulacion: p.dtFechaPostulacion,
    //                 codigousuario: p.iCodUsuario
    //             }));
    //             modal.close(); // Cierra el modal al seleccionar
    //         },
    //         error: (err) => {
    //             console.error('Error al cargar postulantes:', err);
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Error',
    //                 text: 'No se pudieron cargar los postulantes.',
    //                 confirmButtonColor: '#2e7d32'
    //             });
    //         }
    //     });
    // }

    verPostulantes(convocatoria: any, modal: any) {
        this.convocatoriaSeleccionada = convocatoria;

        const params = {
            iCodConvocatoria: convocatoria.iCodConvocatoria,
            pageNumber: 1,
            pageSize: 10
        };

        this.apiService.gePostulaciones(params).subscribe({
            next: (data) => {
                console.log('📦 Data completa del backend:', data);

                // 🔹 Guardar versión completa
                const postulantesCompletos = data.items || [];

                // 🔹 Crear una versión simplificada para mostrar
                this.postulantes = postulantesCompletos.map((p: any) => ({
                    id: p.iCodPostulacion,
                    nombre: p.vNombreCompleto,
                    dni: p.vNumDocumento,
                    correo: p.vCorreoElectronico,
                    fechaPostulacion: p.dtFechaPostulacion,
                    codigousuario: p.iCodUsuario,
                    dataCompleta: p // ← Aquí guardas todo el registro completo
                }));

                modal.close();
            },
            error: (err) => {
                console.error('Error al cargar postulantes:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los postulantes.',
                    confirmButtonColor: '#2e7d32'
                });
            }
        });
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

    @ViewChild('modalDatos') modalDatos!: TemplateRef<any>;
    datosPersonales: any = null;

    abrirModalDetalle(iCodUsuario: number) {
        this.apiService.getDatosPersonales(iCodUsuario).subscribe({
            next: (data) => {
                this.datosPersonales = data;
                this.modalService.open(this.modalDatos, { size: 'md', centered: true });
            },
            error: (err) => {
                console.error('Error al obtener datos personales:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los datos personales del postulante.',
                    confirmButtonColor: '#2e7d32'
                });
            }
        });
    }

    obtenerSexo(codigo: number): string {
        switch (codigo) {
            case 1: return 'Masculino';
            case 2: return 'Femenino';
            default: return 'No especificado';
        }
    }

    obtenerEstadoCivil(codigo: number): string {
        switch (codigo) {
            case 1: return 'Soltero(a)';
            case 2: return 'Casado(a)';
            case 3: return 'Viudo(a)';
            case 4: return 'Divorciado(a)';
            case 5: return 'Conviviente(a)';
            case 6: return 'Separado(a)';
            default: return 'No especificado';
        }
    }

    generarFichaCurricular(iCodUsuario?: number, iNombreCompleto?: String) {
        const usuario = iCodUsuario || this.datosPersonales?.iCodUsuario;

        if (!usuario) {
            Swal.fire({
                icon: 'warning',
                title: 'Usuario no válido',
                text: 'No se puede generar la ficha porque no se tiene información del usuario.',
                confirmButtonColor: '#2e7d32'
            });
            return;
        }

        const data = { iCodUsuario: usuario };

        this.apiService.generarFichaCurricular(data).subscribe({
            next: (response: Blob) => {
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ficha_curricular_${iNombreCompleto}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);

                Swal.fire({
                    icon: 'success',
                    title: 'Ficha generada correctamente',
                    text: 'La ficha curricular ha sido creada y descargada con éxito.',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2e7d32',
                });
            },
            error: () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al generar ficha',
                    text: 'No se pudo generar la ficha curricular. Inténtalo nuevamente.',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#2e7d32',
                });
            },
        });
    }


    @ViewChild('modalDocumentos') modalDocumentos!: TemplateRef<any>;

    seleccionado: any;
    pagina = 1;
    elementosPorPagina = 10;

    // postulantes = [
    //     {
    //         id: 1,
    //         nombre: 'Juan Pérez',
    //         dni: '123456',
    //         telefono: '987654321',
    //         correo: 'juan@example.com',
    //         direccion: 'Av. Siempre Viva 123',
    //         cv: 'CV_JuanPerez.pdf',
    //         certificados: 'Cert_JuanPerez.pdf',
    //         fechaPostulacion: '01/01/2025',
    //         puntaje: '85%',
    //         puntajeFinal: '88%',
    //         estado: 'Evaluado',
    //         documentos: [
    //             { nombre: 'CV_JuanPerez.pdf', tipo: 'CV', fecha: '02/01/2025' },
    //             { nombre: 'Cert_JuanPerez.pdf', tipo: 'Certificado', fecha: '02/01/2025' }
    //         ]
    //     },
    //     {
    //         id: 2,
    //         nombre: 'Ana Gómez',
    //         dni: '789012',
    //         telefono: '998877665',
    //         correo: 'ana@example.com',
    //         direccion: 'Jr. Las Flores 456',
    //         cv: 'CV_AnaGomez.pdf',
    //         certificados: 'Cert_AnaGomez.pdf',
    //         fechaPostulacion: '03/01/2025',
    //         puntaje: '-',
    //         puntajeFinal: '-',
    //         estado: 'Pendiente',
    //         documentos: [
    //             { nombre: 'CV_AnaGomez.pdf', tipo: 'CV', fecha: '04/01/2025' },
    //             { nombre: 'Cert_AnaGomez.pdf', tipo: 'Certificado', fecha: '04/01/2025' }
    //         ]
    //     }
    // ];

    documentosPaginados: any[] = [];


    // abrirModalDetalle(postulante: any) {
    //     this.seleccionado = postulante;
    //     this.modalService.open(this.modalDatos, { size: 'lg' });
    // }

    abrirModalDocumentos(postulante: any) {
        this.seleccionado = postulante;
        this.pagina = 1;
        this.actualizarDocumentosPaginados();
        this.modalService.open(this.modalDocumentos, { size: 'lg' });
    }

    actualizarDocumentosPaginados() {
        const inicio = (this.pagina - 1) * this.elementosPorPagina;
        const fin = inicio + this.elementosPorPagina;
        this.documentosPaginados = this.seleccionado.documentos.slice(inicio, fin);
        this.totalPaginas = Math.ceil(this.seleccionado.documentos.length / this.elementosPorPagina);
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

}
