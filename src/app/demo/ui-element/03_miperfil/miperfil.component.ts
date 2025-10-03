import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';  // Importamos SweetAlert2

import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

interface Formacion {
  nivel: string;
  institucion: string;
  cespecializacion: string;
  fechaInicio: string; // Podrías cambiarlo a Date si prefieres manejar objetos de fecha
}

@Component({
  selector: 'app-miperfil',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './miperfil.component.html',
  styleUrls: ['./miperfil.component.scss']
})
export class MiPerfilComponent {

  codUsuario: number | null;
  tiposDocumentos: any[] = []; // Para almacenar los tipos de documentos que vienen de la API

  constructor(private apiService: ApiService, private authService: AuthService, private http: HttpClient) {
    this.codUsuario = this.authService.getUserId(); // ✅ Ya tienes codUsuario aquí   
  }

  ngOnInit(): void {
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


  items = [
    'Datos Personales',
    'Formación Académica',
    'Colegiatura',
    'Experiencia Laboral',
    'Cursos, Diplomados y/o Especialización',
    'Idiomas',
    'Ofimática',
    'Referencias Laborales',
    'Bonificaciones adicionales (FF. AA., Discapacidad, Deportista Calificado y/o Ley N° 31533 y su reglamento)',
    'Declaración Jurada',
    'Disponibilidad de Viajar'
  ];

  datos: { [key: string]: any } = {
    'Datos Personales': {
      tipoDocumento: 'DNI',
      nroDocumento: '',
      ruc: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nombres: '',
      sexo: '',
      estadoCivil: '',
      nacionalidad: '',
      fechaNacimiento: '',
      pais: 'PERÚ',
      departamentoNacimiento: '',
      provinciaNacimiento: '',
      distritoNacimiento: '',
      departamentoContacto: '',
      provinciaContacto: '',
      distritoContacto: '',
      domicilio: '',
      celular: '',
      telefono: '',
      email: '',
      medioConvocatoria: '',
      otros: ''
    },
    'Formación Académica': { titulo: '', institucion: '', anio: '' },
    'Colegiatura': { numeroColegiatura: '', fechaExp: '' }
  };

  guardarDatosPersonales(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }

  volver() {
    alert('Volviendo...');
  }

  // ********************************* //
  // ******  DATOS PERSONALES ******* //  
  // ******************************* //






  // ***************************************** //
  // ******  FORMACION ACADEMICA ******* //  
  // *************************************** //
  formaciones: Formacion[] = [];
  formacion: Formacion = this.nuevaFormacion();
  mostrarModalFormacion = false;
  editIndexFormacion: number | null = null;

  // Crear nueva estructura vacía
  nuevaFormacion(): Formacion {
    return {
      nivel: '',
      institucion: '',
      cespecializacion: '',
      fechaInicio: ''
    };
  }

  // Abrir modal
  abrirModalFormacion() {
    this.formacion = this.nuevaFormacion();
    this.editIndexFormacion = null;
    this.mostrarModalFormacion = true;
  }

  // Cerrar modal
  cerrarModalFormacion() {
    this.mostrarModalFormacion = false;
  }

  // Guardar registro
  guardarFormacion() {
    if (!this.formacion.nivel || !this.formacion.institucion || !this.formacion.fechaInicio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Debe completar todos los campos obligatorios (*)',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    if (this.editIndexFormacion !== null) {
      this.formaciones[this.editIndexFormacion] = { ...this.formacion };
    } else {
      this.formaciones.push({ ...this.formacion });
    }

    this.cerrarModalFormacion();
  }

  // Editar registro
  editarFormacion(index: number) {
    this.formacion = { ...this.formaciones[index] };
    this.editIndexFormacion = index;
    this.mostrarModalFormacion = true;
  }

  // Eliminar registro
  eliminarFormacion(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará el registro de formación académica.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.formaciones.splice(index, 1);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El registro fue eliminado correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }


  // ******************************* //
  // *******  COLEGIATURA  ******** //  
  // ***************************** //
  guardarColegiatura(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }

  // ***************************************** //
  // ******  EXPERIENCIA LABORAL ******* //  
  // *************************************** //
  guardarExperienciaLaboral(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }

  // ***************************************** //
  // ******  CURSOS / DIPLOMADOS / ES ******* //  
  // *************************************** //
  guardarCursosDiplomados(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }


  // *********************** //
  // ******  IDIOMAS ******* //  
  // *********************** //
  guardarIdiomas(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }

  // ************************* //  
  // ******  OFIMATICA ******* //  
  // ************************* //  
  guardarOfimatica(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }
  // ************************************* //
  // ******  REFERENCIA LABORALES ******* //  
  // *********************************** //
  guardarReferenciasLaborales(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }


  // ******************************************* //
  // ******  Bonificaciones Adicionales ******* //  
  // ***************************************** //
  guardarBonificacionesAdicionales(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }

  // ***************************************** //
  // ******  DECLARACION JURADA ******* //  
  // *************************************** //
  guardarDeclaracionJurada(seccion: string) {
    console.log('Datos guardados para', seccion, this.datos[seccion]);
    alert(`Datos guardados para ${seccion}`);
  }

  declaracionesJurada: string[] = [
    'No tener condena por delito doloso, con sentencia firme',
    'No estar inhabilitado para ejercer la función pública por decisión administrativa firme o sentencia judicial con calidad de cosa juzgada',
    'No tener antecedentes penales, judiciales y policiales',
    'No tener deuda por concepto de reparaciones civiles a favor de personas y del Estado establecidas en sentencias con calidad de cosa juzgada, que ameriten la inscripción del suscrito en el Registro de Reparaciones Civiles – REDERECI, creado por Ley N° 30353',
    'No estar inscrito en el Registro Único de Condenados Inhabilitados por Delitos contra la Administración Pública, creado por Decreto Legislativo N° 1243',
    'Gozar de buen estado de salud física y mental'
  ];



  // ***************************************** //
  // ******  DISPONIBILIDAD DE VIAJAR ******* //  
  // *************************************** //
  guardarDisponibilidadViajar(seccion: string) {
    const datosSeccion = this.datos[seccion];

    // Validar que se haya seleccionado una opción
    if (datosSeccion.disponibleInterior === undefined || datosSeccion.disponibleInterior === null) {
      alert('Por favor, seleccione si tiene disponibilidad para trabajar en el interior del país.');
      return;
    }

    // Aquí podrías guardar los datos, enviarlos a una API, etc.
    console.log('Datos guardados para:', seccion);
    console.log('Tipo Documento:', datosSeccion.tipoDocumentos);
    console.log('Nro Documento:', datosSeccion.nroDocumento);
    console.log('RUC:', datosSeccion.ruc);
    console.log('Disponibilidad para interior del país:', datosSeccion.disponibleInterior ? 'Sí' : 'No');

    alert(`Datos guardados para ${seccion}`);
  }


}
