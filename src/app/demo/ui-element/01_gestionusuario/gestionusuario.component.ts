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
  tiposDocumentos: any[] = []; // Para almacenar los tipos de documentos que vienen de la API

  constructor(private apiService: ApiService, private authService: AuthService, private http: HttpClient) {
    this.codUsuario = this.authService.getUserId(); // ✅ Ya tienes codUsuario aquí   
  }

  ngOnInit(): void {
    this.listarUsuario();
    this.apiService.getTipoDocumentos().subscribe({
      next: (data) => {
        console.log(data);
        this.tiposDocumentos = data; // Asignamos los datos obtenidos a la propiedad
      },
      error: (err) => {
        console.error('Error al cargar tipos de documentos', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar los tipos de documentos.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
      }
    });
  }


  // Estado del componente
  mostrarLista: boolean = true;
  modoEdicion: boolean = false;

  // ********************************** //
  // ******   MENU PRINCIPAL   ******* //
  // ******************************** //
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

  // ************************************* //
  // ******   FIN MENU PRINCIPAL   ******* //
  // ************************************* //

  // ************************************************************************************************/

  // Btn Volver
  volverALista() {
    this.mostrarLista = true;
  }


  // ********************************* //
  // ******   NUEVO USUARIO   ******* //
  // ******************************* //
  usuarioSeleccionada: any = {
    tipoDocumentos: '0',
    NumDocumento: '',
    ApePaterno: '',
    ApeMaterno: '',
    NomCompleto: '',
    Email: '',
    Contrasenia: '',
    Rol: '0'
  };

  nuevoUsuario() {
    this.modoEdicion = false;
    this.mostrarLista = false;

    this.usuarioSeleccionada = {
      tipoDocumentos: null,
      NumDocumento: '',
      ApePaterno: '',
      ApeMaterno: '',
      NomCompleto: '',
      Email: '',
      Contrasenia: '',
      Rol: '0'
    };
  }

  guardarUsuario() {
    const u = this.usuarioSeleccionada;

    // Validación de campos obligatorios
    if (!u.tipoDocumentos || !u.NumDocumento || !u.ApePaterno || !u.ApeMaterno ||
      !u.NomCompleto || !u.Email || !u.Contrasenia || !u.Rol || u.Rol === '0') {
      Swal.fire({
        icon: 'warning',
        title: '¡Campos incompletos!',
        text: 'Por favor, complete todos los campos obligatorios.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }


    // Preparar datos para guardar (puedes modificar según tu backend)
    const payload = {
      tipoDocumento: u.tipoDocumentos.codTipoDocumento, // si es objeto o id
      numDocumento: u.NumDocumento,
      ApePaterno: u.ApePaterno,
      ApeMaterno: u.ApeMaterno,
      nombres: u.NomCompleto,
      correoElectronico: u.Email,
      contrasenia: u.Contrasenia,
      codRol: u.Rol
    };

    this.apiService.register(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Usuario guardado!',
          text: 'El usuario fue registrado correctamente.',
          confirmButtonColor: '#2e7d32'
        });
        // this.volverALista();
        // this.listarUsuario(); // actualiza la tabla/lista
        window.location.reload()
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: 'No se pudo registrar el usuario.',
          confirmButtonColor: '#c62828'
        });
      }
    });

  }


  // ********************************* //
  // ******  EDITAR USUARIO   ******* //  
  // ******************************* //

  editarusuario(usuario: any): void {
    this.modoEdicion = true;
    this.mostrarLista = false;

    const tipoDoc = this.tiposDocumentos.find(
      (doc) => doc.idDocumento === usuario.tipoDocumento || doc.idDocumento === usuario.tipoDocumentos?.idDocumento
    );

    this.usuarioSeleccionada = {
      id: usuario.idUsuario,
      tipoDocumentos: tipoDoc,
      NumDocumento: usuario.numDocumento,
      ApePaterno: usuario.apePaterno,
      ApeMaterno: usuario.apeMaterno,
      NomCompleto: usuario.nombres,
      Email: usuario.correoElectronico,
      Rol: usuario.codRol
    };
  }

  actualizarUsuario() {
    const u = this.usuarioSeleccionada;

    if (!u.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error interno',
        text: 'El ID del usuario no está definido.',
        confirmButtonColor: '#c62828'
      });
      return;
    }

    // Validación (puedes extraer a función común si repites)
    if (!u.tipoDocumentos || !u.NumDocumento || !u.ApePaterno || !u.ApeMaterno ||
      !u.NomCompleto || !u.Email || !u.Contrasenia || !u.Rol || u.Rol === '0') {
      Swal.fire({
        icon: 'warning',
        title: '¡Campos incompletos!',
        text: 'Por favor, complete todos los campos obligatorios.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    const payload = {
      tipoDocumento: u.tipoDocumentos.codTipoDocumento,
      numDocumento: u.NumDocumento,
      apePaterno: u.ApePaterno,
      apeMaterno: u.ApeMaterno,
      nombres: u.NomCompleto,
      correoElectronico: u.Email,
      contrasenia: u.Contrasenia,
      codRol: u.Rol
    };

    this.apiService.actualizarUsuario(u.id, payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Usuario actualizado!',
          text: 'Los datos se actualizaron correctamente.',
          confirmButtonColor: '#2e7d32'
        });
        this.volverALista();
        this.listarUsuario(); // recarga la lista
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: 'No se pudo actualizar el usuario.',
          confirmButtonColor: '#c62828'
        });
      }
    });
  }

  eliminarusuario(id: number) {

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
        this.apiService.eliminarUsuario(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La convocatoria ha sido eliminada.', 'success');
            // this.listarConvocatorias(); // Recargar la lista
            window.location.reload()
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar la convocatoria.', 'error');
          }
        });
      }
    });
  }

  // ******************************* //
  // ******  VALIDACIONES   ******* //  
  // ***************************** //
  permitirSoloNumeros(event: KeyboardEvent): boolean {
    const tecla = event.key;

    // Permitir solo dígitos (0 al 9)
    if (!/^\d$/.test(tecla)) {
      event.preventDefault(); // Bloquea cualquier cosa que no sea número
      return false;
    }

    // También puedes limitar la longitud aquí si usas ngModel
    const valorActual = this.usuarioSeleccionada?.NumDocumento || '';
    if (valorActual.length >= 15) {
      event.preventDefault(); // Evita que se ingresen más de 15 dígitos
      return false;
    }

    return true;
  }

  soloLetras(event: KeyboardEvent): boolean {
    const tecla = event.key;

    // Permitir letras (mayúsculas/minúsculas), acentos, ñ y espacios
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;

    if (!regex.test(tecla)) {
      event.preventDefault(); // Bloquea la tecla si no coincide con el patrón
      return false;
    }

    return true;
  }


}
