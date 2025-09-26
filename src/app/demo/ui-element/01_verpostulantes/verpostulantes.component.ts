// Angular imports
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

@Component({
    selector: 'app-verpostulantes',
    standalone: true,
    imports: [CommonModule, FormsModule, SharedModule, QuillModule],
    templateUrl: './verpostulantes.component.html',
    styleUrls: ['./verpostulantes.component.scss']
})
export class VerPostulantesComponent {
    @ViewChild('modalDatos') modalDatos!: TemplateRef<any>;
    @ViewChild('modalDocumentos') modalDocumentos!: TemplateRef<any>;

    seleccionado: any;
    pagina = 1;
    elementosPorPagina = 10;

    postulantes = [
        {
            id: 1,
            nombre: 'Juan Pérez',
            dni: '123456',
            telefono: '987654321',
            correo: 'juan@example.com',
            direccion: 'Av. Siempre Viva 123',
            cv: 'CV_JuanPerez.pdf',
            certificados: 'Cert_JuanPerez.pdf',
            fechaPostulacion: '01/01/2025',
            puntaje: '85%',
            puntajeFinal: '88%',
            estado: 'Evaluado',
            documentos: [
                { nombre: 'CV_JuanPerez.pdf', tipo: 'CV', fecha: '02/01/2025' },
                { nombre: 'Cert_JuanPerez.pdf', tipo: 'Certificado', fecha: '02/01/2025' }
            ]
        },
        {
            id: 2,
            nombre: 'Ana Gómez',
            dni: '789012',
            telefono: '998877665',
            correo: 'ana@example.com',
            direccion: 'Jr. Las Flores 456',
            cv: 'CV_AnaGomez.pdf',
            certificados: 'Cert_AnaGomez.pdf',
            fechaPostulacion: '03/01/2025',
            puntaje: '-',
            puntajeFinal: '-',
            estado: 'Pendiente',
            documentos: [
                { nombre: 'CV_AnaGomez.pdf', tipo: 'CV', fecha: '04/01/2025' },
                { nombre: 'Cert_AnaGomez.pdf', tipo: 'Certificado', fecha: '04/01/2025' }
            ]
        }
    ];

    documentosPaginados: any[] = [];
    totalPaginas = 1;

    constructor(private modalService: NgbModal) { }

    abrirModalDetalle(postulante: any) {
        this.seleccionado = postulante;
        this.modalService.open(this.modalDatos, { size: 'lg' });
    }

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
