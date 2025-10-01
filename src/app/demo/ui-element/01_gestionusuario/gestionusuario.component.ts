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


@Component({
  selector: 'app-gestionusuario',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './gestionusuario.component.html',
  styleUrls: ['./gestionusuario.component.scss']
})
export class GestionUsuarioComponent {
  codUsuario: number | null;

  constructor(private apiService: ApiService, private authService: AuthService, private http: HttpClient) {
    this.codUsuario = this.authService.getUserId(); // ✅ Ya tienes codUsuario aquí   
  }

  ngOnInit(): void {
    this.listarUsuario();
  }





  // Estado del componente
  mostrarLista: boolean = true;
  modoEdicion: boolean = false;


  // Menú Principal
  usuarios: any[] = [];


  filtros: any = {
    rol: '',
    email: '',
    nombrecompleto: ''
  };

  listarUsuario() {
    const params: any = {
      pageNumber: this.paginaActual,
      pageSize: this.pageSize
    };

    if (this.filtros.rol) {
      params.rol = Number(this.filtros.rol);
    }

    if (this.filtros.email) {
      params.email = this.filtros.email;
    }

    if (this.filtros.nombrecompleto) {
      params.nombrecompleto = this.filtros.nombrecompleto;
    }
 
    this.apiService.getUsuarioPaginado(params).subscribe({
      next: (data) => {
        console.log(data);
        this.usuarios = data.items || [];
        this.totalPaginas = Math.ceil(data.totalRecords / this.pageSize);
        this.paginaActual = this.paginaActual;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
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
      this.listarUsuario();
    }
  }
  irPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.listarUsuario();
  }

  siguientePagina() {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.listarUsuario();
    }
  }

  // Fin Menú Principal






  // Volver a la lista
  volverALista() {
    this.mostrarLista = true;
  }

  nuevoUsuario() {
    this.modoEdicion = false;
    this.mostrarLista = false;
    // this.usuarioseleccionada = {
    //   requisitos: '',
    //   tipo: '',
    //   unidadzonal: ''
    // };
  }





}
