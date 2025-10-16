import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { Router } from '@angular/router';

import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';  // Importamos SweetAlert2

import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import * as dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

interface Formacion {
  iCodFormacionAcademica?: number;
  nivel: number;
  institucion: string;
  cespecializacion: string;
  fechaInicio: string;
}

interface CursoDiplomado {
  iCodCursoDiplomado?: number;
  denominacion: string;
  institucion: string;
  horas: number;
}

export interface ExperienciaLaboral {
  iCodExperienciaLaboral?: number;
  entidad: string;
  unidad: string;
  cargo: string;
  sector: string;
  tipo: 'GENERAL' | 'ESPECIFICA';
  fechaInicio: string;
  fechaFin: string;
  total?: string;
  funciones: string[];

  // ✅ permite indexar dinámicamente sin error
  temas?: {
    [key: string]: boolean;
  };

  duracion?: {
    años: number;
    meses: number;
    días: number;
  };
}

interface Idioma {
  iCodIdioma?: number;
  vIdioma: string;
  vInstitucion: string;
  vNivelAlcanzado: string;
}

interface Duracion {
  años: number;
  meses: number;
  días: number;
}

@Component({
  selector: 'app-miperfil',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './miperfil.component.html',
  styleUrls: ['./miperfil.component.scss']
})
export class MiPerfilComponent {
  tiposDocumentos: any[] = []; // Para almacenar los tipos de documentos que vienen de la API
  departamentos: any[] = []; // Para almacenar los tipos de documentos que vienen de la API
  provincias: any[] = [];
  distritos: any[] = [];

  codUsuario: number | null;

  email: string | null;
  tpdoc: string | null;
  ndocumento: string | null;
  apepat: string | null;
  apemat: string | null;
  nomcompleto: string | null;

  ofimaticaActual: any = null;


  items = [
    'Datos Personales',
    'Formación Académica',
    'Colegiatura',
    'Experiencia Laboral',
    'Cursos, Diplomados y/o Especialización',
    'Idiomas',
    'Ofimática',
    'Bonificaciones adicionales (FF. AA., Discapacidad)',
    'Declaración Jurada',
  ];

  datos: { [key: string]: any } = {
    'Datos Personales': {
      tipoDocumento: null,
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
    'Colegiatura': { numeroColegiatura: '', fechaExp: '' },
    'Ofimática': { nivelIntermedio: '' },
    'Bonificaciones adicionales (FF. AA., Discapacidad)': {
      licenciadoFuerzasArmadas: '',
      codigoLicenciado: '',
      tieneDiscapacidad: '',
      codigoDiscapacidad: ''
    }
  };

  constructor(private apiService: ApiService, private authService: AuthService, private http: HttpClient, private router: Router) {
    this.codUsuario = this.authService.getUserId();
    this.email = this.authService.getEmail();
    this.tpdoc = this.authService.getTipoDocumento();
    this.ndocumento = this.authService.getNroDocumento();
    this.apepat = this.authService.getApellidoPaterno();
    this.apemat = this.authService.getApellidoMaterno();
    this.nomcompleto = this.authService.getNombreCompleto();
  }

  ngOnInit(): void {
    this.apiService.getTipoDocumentos().subscribe({
      next: (data) => {
        this.tiposDocumentos = data; // Asignamos los datos obtenidos a la propiedad
        this.datos['Datos Personales'].tipoDocumento = this.tpdoc; //valor de Tipo de Documento asignado
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

    this.apiService.getUbigeoDpto().subscribe({
      next: (data) => {
        this.departamentos = data; // Asignamos los datos obtenidos a la propiedad 
        // 👇 Si ya hay datos previos, precarga provincias y distritos
        const dpto = this.datos['Datos Personales'].departamentoNacimiento;
        const prov = this.datos['Datos Personales'].provinciaNacimiento;
        if (dpto) {
          this.onDepartamentoChange(dpto, true, prov);
        }

      },
      error: (err) => {
        console.error('Error al cargar los Departamentos', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar los Departamentos.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
      }
    });

    this.cargarDatosPersonales();
    this.cargarFormaciones();
    this.cargarColegiatura();
    this.obtenerExperienciasLaborales();
    this.cargarCursosDiplomados();
    this.cargarIdiomas();
    this.cargarOfimatica();
    this.cargarDatosBonificacionesAdicionales();
    this.cargarDeclaracionJurada();

  }

  // ✅ Evento al cambiar el departamento
  onDepartamentoChange(codDepartamento: string, precarga = false, codProvinciaPreload?: string): void {
    this.provincias = [];
    this.distritos = [];

    this.datos['Datos Personales'].provinciaNacimiento = '';
    this.datos['Datos Personales'].distritoNacimiento = '';

    if (codDepartamento) {
      this.apiService.getUbigeoProv(codDepartamento).subscribe({
        next: (provs) => {
          this.provincias = provs;

          // Precarga la provincia si viene desde el cargarDatosPersonales()
          if (precarga && codProvinciaPreload) {
            this.datos['Datos Personales'].provinciaNacimiento = codProvinciaPreload;
            this.onProvinciaChange(codProvinciaPreload, true);
          }
        },
        error: () => this.showError('Ocurrió un error al cargar las provincias.')
      });
    }
  }

  // ✅ Evento al cambiar la provincia
  onProvinciaChange(codProvincia: string, precarga = false): void {
    this.distritos = [];
    this.datos['Datos Personales'].distritoNacimiento = '';

    if (codProvincia) {
      this.apiService.getUbigeoDis(codProvincia).subscribe({
        next: (dists) => {
          this.distritos = dists;

          // Precarga el distrito si ya estaba definido
          if (precarga) {
            const distritoPreload = this.datos['Datos Personales'].distritoNacimiento;
            if (distritoPreload) {
              this.datos['Datos Personales'].distritoNacimiento = distritoPreload;
            }
          }
        },
        error: () => this.showError('Ocurrió un error al cargar los distritos.')
      });
    }
  }

  // 🔁 Función reutilizable para mostrar errores
  private showError(mensaje: string): void {
    Swal.fire({
      icon: 'error',
      title: '¡Error!',
      text: mensaje,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#2e7d32'
    });
  }

  volver() {
    //alert('Volviendo...');
    this.router.navigate(['/pinicio']);

  }

  // ********************************* //
  // ******  DATOS PERSONALES ******* //  
  // ******************************* // 
  private idDatosPersonales: number = 0; // variable para guardar el ID si existe 

  cargarDatosPersonales() {
    if (this.codUsuario != null) {
      this.apiService.getDatosPersonales(this.codUsuario).subscribe({
        next: (data) => {
          if (data) {
            // console.log('Datos personales recibidos:', data);

            // Guardar el id para saber si existe registro y hacer PUT o POST
            this.idDatosPersonales = data.iCodDatosPersonales || 0;

            // Asignar datos básicos
            this.datos['Datos Personales'] = {
              fechaNacimiento: data.dFechaNacimiento?.split('T')[0] || '',
              sexo: data.iCodSexo?.toString() || '',
              estadoCivil: data.iCodEstadoCivil?.toString() || '',
              departamentoNacimiento: data.vCodDepartamento || '',
              provinciaNacimiento: '', // Temporalmente vacío
              distritoNacimiento: '',  // Temporalmente vacío
              domicilio: data.vDomicilio || '',
              celular: data.vCelular || '',
              telefono: data.vTelefono || '',
              email: data.vCorreo || ''
            };

            // Precargar provincias y distritos
            const dpto = data.vCodDepartamento;
            const prov = data.vCodProvincia;
            const dist = data.vCodDistrito;

            if (dpto && prov && dist) {
              this.apiService.getUbigeoProv(dpto).subscribe({
                next: (provincias) => {
                  this.provincias = provincias;
                  this.datos['Datos Personales'].provinciaNacimiento = prov;

                  this.apiService.getUbigeoDis(prov).subscribe({
                    next: (distritos) => {
                      this.distritos = distritos;
                      this.datos['Datos Personales'].distritoNacimiento = dist;
                    }
                  });
                }
              });
            }
          } else {
            // Si no hay datos, aseguramos que id sea 0
            this.idDatosPersonales = 0;
          }
        },
        error: (err) => {
          console.error('Error al cargar datos personales:', err);
          this.idDatosPersonales = 0;
        }
      });
    }
  }

  guardarDatosPersonales(seccion: string) {
    const datosPersonales = this.datos[seccion];

    const camposRequeridos = [
      { campo: 'fechaNacimiento', label: 'Fecha de Nacimiento' },
      { campo: 'sexo', label: 'Sexo' },
      { campo: 'estadoCivil', label: 'Estado Civil' },
      { campo: 'celular', label: 'Celular' }
    ];

    const camposVacios = camposRequeridos.filter(c => !datosPersonales[c.campo]);

    if (camposVacios.length > 0) {
      const listaCampos = camposVacios.map(c => `• ${c.label}`).join('<br>');
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        html: `Debes completar los siguientes campos:<br><br>${listaCampos}`,
        confirmButtonColor: '#d33'
      });
      return;
    }

    const celularRegex = /^[0-9]{9}$/;
    if (!celularRegex.test(datosPersonales.celular)) {
      Swal.fire({
        icon: 'error',
        title: 'Celular inválido',
        text: 'El número de celular debe tener 9 dígitos.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const payload_DatosPersonales = {
      iCodDatosPersonales: this.idDatosPersonales || 0,  // 👉 usar ID si existe
      iCodUsuario: this.codUsuario,
      vCodigoPostulacion: datosPersonales.codigoPostulacion || '',
      dFechaNacimiento: new Date(datosPersonales.fechaNacimiento).toISOString(),
      iCodSexo: datosPersonales.sexo,
      iCodEstadoCivil: datosPersonales.estadoCivil,
      vCodDepartamento: datosPersonales.departamentoNacimiento || '',
      vCodProvincia: datosPersonales.provinciaNacimiento || '',
      vCodDistrito: datosPersonales.distritoNacimiento || '',
      vDomicilio: datosPersonales.domicilio || '',
      vCelular: datosPersonales.celular,
      vTelefono: datosPersonales.telefono || '',
      vCorreo: datosPersonales.email || this.email || '',
      dtFechaRegistro: new Date().toISOString(),
      bActivo: true
    };

    const esNuevoRegistro = payload_DatosPersonales.iCodDatosPersonales === 0;

    const dp_request$ = esNuevoRegistro
      ? this.apiService.insertarDatosPersonales(payload_DatosPersonales) // POST
      : this.apiService.actualizarDatosPersonales(payload_DatosPersonales); // PUT

    dp_request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: esNuevoRegistro ? 'Registro exitoso' : 'Actualización exitosa',
          text: 'Los datos personales han sido enviados correctamente.',
          confirmButtonColor: '#1e8e3e'
        }).then(() =>
          window.location.reload()
        );
      },
      error: (err) => {
        console.error('Error al guardar datos personales:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar los datos.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // ********************************************************************************************************************* //
  // ***************************************** //
  // ******  FORMACION ACADEMICA ******* //  
  // *************************************** //

  // Lista de niveles académicos con código y nombre
  nivelesAcademicos = [
    { id: 1, nombre: 'Primaria' },
    { id: 2, nombre: 'Secundaria' },
    { id: 3, nombre: 'Carrera Técnica' },
    { id: 4, nombre: 'Egresado Universitario' },
    { id: 5, nombre: 'Bachiller Universitario' },
    { id: 6, nombre: 'Título Universitario' },
    { id: 7, nombre: 'Estudios de Maestría' },
    { id: 8, nombre: 'Egresado de Maestría' },
    { id: 9, nombre: 'Grado de Maestría' },
    { id: 10, nombre: 'Estudios de Doctorado' },
    { id: 11, nombre: 'Egresado de Doctorado' },
    { id: 12, nombre: 'Grado de Doctorado' }
  ];

  formaciones: Formacion[] = [];
  formacion: Formacion = this.nuevaFormacion();
  mostrarModalFormacion = false;
  editIndexFormacion: number | null = null;

  // Cargar formaciones existentes desde el backend
  cargarFormaciones() {
    if (this.codUsuario != null) {
      this.apiService.getFormacionAcademicaPorUsuario(this.codUsuario).subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.formaciones = data.map(f => ({
              iCodFormacionAcademica: f.iCodFormacionAcademica,
              nivel: Number(f.iCodNivelAcademico), // Aquí se guarda como número
              institucion: f.vInstitucion,
              cespecializacion: f.vProfesion,
              fechaInicio: f.dFechaEgreso?.split('T')[0] || ''
            }));
          }
        },
        error: (err) => {
          console.error('Error al cargar formación académica', err);
        }
      });
    }
  }

  // Crear una nueva formación vacía
  nuevaFormacion(): Formacion {
    return {
      nivel: 0,
      institucion: '',
      cespecializacion: '',
      fechaInicio: ''
    };
  }

  // Obtener texto del nivel académico
  obtenerNombreNivel(nivel: number): string {
    const nivelObj = this.nivelesAcademicos.find(n => n.id === +nivel);
    return nivelObj ? nivelObj.nombre : '';
  }

  // Abrir modal de registro
  abrirModalFormacion() {
    this.formacion = this.nuevaFormacion();
    this.editIndexFormacion = null;
    this.mostrarModalFormacion = true;
  }

  cerrarModalFormacion() {
    this.mostrarModalFormacion = false;
  }

  guardarFormacion(form: NgForm) {
    form.control.markAllAsTouched();

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

    // Validar fecha futura
    const hoy = new Date().toISOString().split('T')[0];
    if (this.formacion.fechaInicio > hoy) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'La fecha no puede ser en el futuro.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    // Validar duplicados
    const yaExiste = this.formaciones.some((f, i) =>
      i !== this.editIndexFormacion &&
      f.nivel === this.formacion.nivel &&
      f.institucion.trim().toLowerCase() === this.formacion.institucion.trim().toLowerCase() &&
      f.fechaInicio === this.formacion.fechaInicio
    );

    if (yaExiste) {
      Swal.fire({
        icon: 'warning',
        title: 'Registro duplicado',
        text: 'Ya existe un registro con los mismos datos.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    const fechaMinima = new Date('1910-01-01').toISOString().split('T')[0];
    if (this.formacion.fechaInicio < fechaMinima) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'La fecha no puede ser menor al año 1910.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }


    // Armar payload
    const payload = {
      iCodFormacionAcademica: this.formacion.iCodFormacionAcademica || 0,
      iCodUsuario: this.codUsuario,
      iCodNivelAcademico: this.formacion.nivel,
      vInstitucion: this.formacion.institucion,
      vProfesion: this.formacion.cespecializacion || '',
      dFechaEgreso: fechaMinima,//new Date(this.formacion.fechaInicio).toISOString(),
      dtFechaRegistro: new Date().toISOString(),
      bActivo: true
    };

    const esEdicion = this.editIndexFormacion !== null && this.formacion.iCodFormacionAcademica;
    const peticion = esEdicion ? this.apiService.actualizarFormacionAcademica(payload) : this.apiService.insertarFormacionAcademica(payload);

    peticion.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Formación académica ${esEdicion ? 'actualizada' : 'registrada'} correctamente.`,
          confirmButtonColor: '#2e7d32'
        });

        // Volver a cargar lista desde backend
        this.cargarFormaciones();
        this.cerrarModalFormacion();
      },
      error: (err) => {
        console.error('Error al guardar formación académica', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la información.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // Editar formación
  editarFormacion(index: number) {
    this.formacion = { ...this.formaciones[index] };
    this.editIndexFormacion = index;
    this.mostrarModalFormacion = true;
  }

  // Eliminar formación (solo frontend aquí)
  eliminarFormacion(index: number) {
    const formacion = this.formaciones[index];

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
        if (formacion.iCodFormacionAcademica) {
          // Llamada al backend para eliminar
          this.apiService.eliminarFormacionAcademica(formacion.iCodFormacionAcademica).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El registro fue eliminado correctamente.',
                confirmButtonColor: '#2e7d32'
              });
              this.cargarFormaciones(); // Vuelve a cargar la lista
            },
            error: (err) => {
              console.error('Error al eliminar formación académica', err);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el registro.',
                confirmButtonColor: '#d33'
              });
            }
          });
        } else {
          // Si es un registro local aún no guardado
          this.formaciones.splice(index, 1);
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El registro fue eliminado localmente.',
            confirmButtonColor: '#2e7d32'
          });
        }
      }
    });
  }

  // ********************************************************************************************************************* //
  // ******************************* //
  // *******  COLEGIATURA  ******** //  
  // ***************************** //
  idColegiaturaSeleccionada: number | null = null;
  modoEdicionColegiatura: boolean = false;
  colegiaturas: any[] = []; // array para mostrar en tabla

  colegiatura = {
    id: null,
    colegio: 0,
    numero: '',
    habilitado: null
  };

  cargarColegiatura() {
    if (this.codUsuario != null) {
      this.apiService.getColegiaturaPorUsuario(this.codUsuario).subscribe({
        next: (data) => {
          if (Array.isArray(data) && data.length > 0) {
            const item = data[0]; // Si solo hay una colegiatura por usuario

            this.colegiatura = {
              id: item.iCodColegiatura,
              colegio: item.iCodColegioProfesional,
              numero: item.vNroColegiatura,
              habilitado: item.bHabilitado
            };

            // 🔹 Activa modo edición
            this.idColegiaturaSeleccionada = item.iCodColegiatura;
            this.modoEdicionColegiatura = true;
          } else {
            // Si no hay datos, limpiar formulario
            this.colegiatura = {
              id: null,
              colegio: 0,
              numero: '',
              habilitado: null
            };
            this.idColegiaturaSeleccionada = null;
            this.modoEdicionColegiatura = false;
          }
        },
        error: (err) => {
          console.error('Error al cargar colegiatura', err);
        }
      });
    }
  }

  guardarColegiatura(seccion: string) {
    const { colegio, numero, habilitado } = this.colegiatura;

    if (!colegio || colegio === 0 || !numero || habilitado === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Debe completar todos los campos requeridos.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const numeroValido = /^[0-9]{4,}$/.test(numero);
    if (!numeroValido) {
      Swal.fire({
        icon: 'error',
        title: 'Número inválido',
        text: 'El número de colegiatura debe contener al menos 4 dígitos numéricos.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const payload_colegiatura = {
      iCodColegiatura: this.idColegiaturaSeleccionada ?? 0,
      iCodUsuario: this.codUsuario,
      iCodColegioProfesional: Number(colegio),
      vNroColegiatura: numero,
      bHabilitado: habilitado,
      iCodUsuarioRegistra: this.codUsuario,
      dtFechaRegistro: new Date().toISOString(),
      bActivo: true
    };

    if (this.modoEdicionColegiatura && this.idColegiaturaSeleccionada) {

      // 🔁 Actualizar (PUT)
      this.apiService.actualizarColegiatura(this.idColegiaturaSeleccionada, payload_colegiatura).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Los datos de colegiatura han sido actualizados correctamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2e7d32'
          });
          this.modoEdicionColegiatura = false;
          this.idColegiaturaSeleccionada = null;
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar la colegiatura.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#d33'
          });
          console.error('Error al actualizar colegiatura', error);
        }
      });
    } else {
      // 🆕 Insertar (POST)
      this.apiService.insertarColegiatura(payload_colegiatura).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Guardado',
            text: 'Los datos de colegiatura han sido guardados correctamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#2e7d32'
          });
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al guardar la colegiatura.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#d33'
          });
          console.error('Error al guardar colegiatura', error);
        }
      });
    }
  }

  // ********************************************************************************************************************* //
  // ***************************************** //
  // ******  EXPERIENCIA LABORAL ******* //  
  // *************************************** //
  trackByIndex(index: number): number {
    return index;
  }

  indiceExperienciaLaboralEditando: number | null = null;
  experienciasLaborales: ExperienciaLaboral[] = [];
  experienciaLaboralActual: ExperienciaLaboral = this.nuevaExperienciaLaboral('GENERAL');
  experienciaLaboralGeneral = '0 Años 0 Meses 0 Días';
  experienciaLaboralEspecifica = '0 Años 0 Meses 0 Días';
  experienciaLaboralPublica = '0 Años 0 Meses 0 Días';

  temasEspecificos = [
    'Actividades Agrícolas',
    'Actividades Agropecuarias',
    'Temas Sanitarios',
    'Acceso a Mercados Externos'
  ];

  modoEdicionExperienciaLaboral: boolean = false;

  nuevaExperienciaLaboral(tipo: 'GENERAL' | 'ESPECIFICA'): ExperienciaLaboral {
    return {
      tipo,
      entidad: '',
      unidad: '',
      cargo: '',
      sector: '',
      fechaInicio: '',
      fechaFin: '',
      total: '',
      funciones: [''],
      temas: {}
    };
  }

  abrirModalExperienciaLaboral(tipo: 'GENERAL' | 'ESPECIFICA') {
    this.modoEdicionExperienciaLaboral = false; // siempre nuevo registro
    this.indiceExperienciaLaboralEditando = null;
    this.experienciaLaboralActual = this.nuevaExperienciaLaboral(tipo);
    this.mostrarModalExperienciaLaboral();
  }

  mostrarModalExperienciaLaboral() {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalExperiencia'));
    modal.show();
  }

  agregarFuncionLaboral(): void {
    if (!this.experienciaLaboralActual.funciones) {
      this.experienciaLaboralActual.funciones = [];
    }
    this.experienciaLaboralActual.funciones.push('');
  }

  eliminarFuncionLaboral(index: number): void {
    this.experienciaLaboralActual.funciones.splice(index, 1);
  }

  calcularDuracionExperienciaLaboral() {
    if (!this.experienciaLaboralActual.fechaInicio || !this.experienciaLaboralActual.fechaFin) return;

    const inicio = dayjs(this.experienciaLaboralActual.fechaInicio);
    const fin = dayjs(this.experienciaLaboralActual.fechaFin);

    if (fin.isBefore(inicio)) {
      this.experienciaLaboralActual.total = '';
      this.experienciaLaboralActual.duracion = undefined;
      return;
    }

    const diff = dayjs.duration(fin.diff(inicio));
    const años = Math.floor(diff.asYears());
    const meses = Math.floor(diff.asMonths() % 12);
    const días = Math.floor(diff.asDays() % 30);

    this.experienciaLaboralActual.total = `${años} Años ${meses} Meses ${días} Días`;
    this.experienciaLaboralActual.duracion = { años, meses, días };
  }

  guardarExperienciaLaboral() {
    if (!this.experienciaLaboralActual) return;

    // 🔹 Validación de campos obligatorios
    if (
      !this.experienciaLaboralActual.entidad ||
      !this.experienciaLaboralActual.cargo ||
      !this.experienciaLaboralActual.fechaInicio ||
      !this.experienciaLaboralActual.fechaFin
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa los campos obligatorios antes de continuar.',
        confirmButtonColor: '#f57c00',
      });
      return;
    }

    // 🔹 Confirmación
    Swal.fire({
      title: this.modoEdicionExperienciaLaboral
        ? '¿Deseas actualizar la experiencia laboral?'
        : '¿Deseas registrar esta experiencia laboral?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2e7d32',
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: this.modoEdicionExperienciaLaboral ? 'Sí, actualizar' : 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const data = {
        iCodExperienciaLaboral: this.modoEdicionExperienciaLaboral
          ? Number(this.experienciaLaboralActual.iCodExperienciaLaboral) || 0
          : 0,
        iCodUsuario: this.codUsuario,
        vEntidad: this.experienciaLaboralActual.entidad?.trim() || '',
        vUnidadOrganica: this.experienciaLaboralActual.unidad?.trim() || '',
        vCargo: this.experienciaLaboralActual.cargo?.trim() || '',
        cSector:
          this.experienciaLaboralActual.sector === 'PÚBLICO'
            ? 'P'
            : this.experienciaLaboralActual.sector === 'PRIVADO'
              ? 'R'
              : 'P',
        cTipoExperienciaLaboral:
          this.experienciaLaboralActual.tipo === 'ESPECIFICA' ? 'E' : 'G',
        bActAgricolas:
          this.experienciaLaboralActual.temas?.['Actividades Agrícolas'] || false,
        bActAgropecuarias:
          this.experienciaLaboralActual.temas?.['Actividades Agropecuarias'] ||
          false,
        bTemasSanitarios:
          this.experienciaLaboralActual.temas?.['Temas Sanitarios'] || false,
        bAccesoMercadosExternos:
          this.experienciaLaboralActual.temas?.['Acceso a Mercados Externos'] ||
          false,
        dFechaInicio: new Date(this.experienciaLaboralActual.fechaInicio).toISOString(),
        dFechaFin: new Date(this.experienciaLaboralActual.fechaFin).toISOString(),
        vFunciones:
          this.experienciaLaboralActual.funciones
            ?.filter((f) => f.trim() !== '')
            .join('; ') || '',
        iCodUsuarioRegistra: this.codUsuario,
        dtFechaRegistro: new Date().toISOString(),
        bActivo: true,
      };

      console.log(
        this.modoEdicionExperienciaLaboral
          ? '🟢 Enviando PUT actualización:'
          : '🟢 Enviando POST nuevo registro:',
        data
      );

      // 🔹 Elegimos el método correcto según el modo
      let request$: Observable<any>;
      if (this.modoEdicionExperienciaLaboral) {
        request$ = this.apiService.actualizarExperienciaLaboral(
          Number(data.iCodExperienciaLaboral),
          data
        );
      } else {
        request$ = this.apiService.insertarExperienciaLaboral(data);
      }

      // 🔹 Ejecutar la solicitud
      request$.subscribe({
        next: (res: any) => {
          Swal.fire({
            icon: 'success',
            title: this.modoEdicionExperienciaLaboral
              ? '¡Actualización exitosa!'
              : '¡Registro exitoso!',
            text: this.modoEdicionExperienciaLaboral
              ? 'La experiencia laboral ha sido actualizada correctamente.'
              : 'La experiencia laboral ha sido registrada correctamente.',
            confirmButtonColor: '#2e7d32',
          }).then(() => {
            this.cerrarModalExperienciaLaboral('modalExperiencia');
            this.obtenerExperienciasLaborales();
          });
        },
        error: (err: any) => {
          console.error('❌ Error al guardar experiencia laboral:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              err.error?.message ||
              'Ocurrió un error al guardar la experiencia laboral.',
            confirmButtonColor: '#d32f2f',
          });
        },
      });
    });
  }

  editarExperienciaLaboral(exp: ExperienciaLaboral) {
    this.modoEdicionExperienciaLaboral = true;

    this.experienciaLaboralActual = {
      iCodExperienciaLaboral: exp.iCodExperienciaLaboral || 0,
      entidad: exp.entidad || '',
      unidad: exp.unidad || '',
      cargo: exp.cargo || '',
      sector: exp.sector || '',
      tipo: exp.tipo || 'GENERAL',
      temas: {
        'Actividades Agrícolas': exp.temas?.['Actividades Agrícolas'] || false,
        'Actividades Agropecuarias': exp.temas?.['Actividades Agropecuarias'] || false,
        'Temas Sanitarios': exp.temas?.['Temas Sanitarios'] || false,
        'Acceso a Mercados Externos': exp.temas?.['Acceso a Mercados Externos'] || false,
      },
      fechaInicio: exp.fechaInicio ? exp.fechaInicio.toString().substring(0, 10) : '',
      fechaFin: exp.fechaFin ? exp.fechaFin.toString().substring(0, 10) : '',
      funciones: exp.funciones ? exp.funciones.map((f: string) => f.trim()).filter((f: string) => f) : [],
      total: '', // se actualizará abajo
    };

    // 🔹 Calcular duración automáticamente
    this.calcularDuracionExperienciaLaboral();

    // 🔹 Mostrar el modal (sin limpiar datos)
    this.mostrarModalExperienciaLaboral();
  }

  cerrarModalExperienciaLaboral(modalId: string) {
    const modal = document.getElementById(modalId);

    if (modal) {
      // 🔹 Cierra correctamente el modal (soporta Bootstrap y estilo manual)
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';

      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove(); // elimina fondo oscuro si existe
      }
    }

    // 🔹 Restablecer flags de control
    this.modoEdicionExperienciaLaboral = false;

    // 🔹 Reiniciar el modelo con valores por defecto válidos
    this.experienciaLaboralActual = {
      iCodExperienciaLaboral: 0,
      entidad: '',
      unidad: '',
      cargo: '',
      sector: '', // vacío al inicio (debes seleccionarlo en el formulario)
      tipo: 'GENERAL', // valor por defecto permitido
      temas: {
        'Actividades Agrícolas': false,
        'Actividades Agropecuarias': false,
        'Temas Sanitarios': false,
        'Acceso a Mercados Externos': false,
      },
      fechaInicio: '',
      fechaFin: '',
      funciones: [],
      total: '', // duración (se recalcula después)
    };
  }

  obtenerExperienciasLaborales() {
    const iCodUsuario = this.codUsuario; // reemplaza con tu variable real

    if (!iCodUsuario) {
      console.warn('⚠️ No se encontró iCodUsuario. No se puede obtener la experiencia laboral.');
      return;
    }

    this.apiService.getExperienciaLaboral(iCodUsuario).subscribe({
      next: (response) => {
        // Mapeamos la respuesta del backend al modelo usado en el frontend
        this.experienciasLaborales = response.map((exp: any) => {
          const fechaInicio = dayjs(exp.dFechaInicio).format('YYYY-MM-DD');
          const fechaFin = dayjs(exp.dFechaFin).format('YYYY-MM-DD');

          // Calculamos duración y texto total
          const diff = dayjs.duration(dayjs(fechaFin).diff(dayjs(fechaInicio)));
          const años = Math.floor(diff.asYears());
          const meses = Math.floor(diff.asMonths() % 12);
          const días = Math.floor(diff.asDays() % 30);
          const total = `${años} Años ${meses} Meses ${días} Días`;

          // Sector: traducimos el código CHAR(1)
          let sector = '';
          if (exp.cSector === 'P') sector = 'PÚBLICO';
          else if (exp.cSector === 'R') sector = 'PRIVADO';
          else sector = 'NO ESPECIFICADO';

          // Tipo experiencia: traducimos si existe
          let tipo: 'GENERAL' | 'ESPECIFICA' = exp.cTipoExperienciaLaboral === 'E' ? 'ESPECIFICA' : 'GENERAL';

          return {
            iCodExperienciaLaboral: exp.iCodExperienciaLaboral,
            entidad: exp.vEntidad,
            unidad: exp.vUnidadOrganica,
            cargo: exp.vCargo,
            sector,
            tipo,
            fechaInicio,
            fechaFin,
            total,
            funciones: exp.vFunciones ? exp.vFunciones.split(/[,;]\s*/) : [''],
            temas: {
              'Actividades Agrícolas': exp.bActAgricolas,
              'Actividades Agropecuarias': exp.bActAgropecuarias,
              'Temas Sanitarios': exp.bTemasSanitarios,
              'Acceso a Mercados Externos': exp.bAccesoMercadosExternos
            },
            duracion: { años, meses, días }
          } as ExperienciaLaboral;
        });

        this.calcularTotalesExperienciaLaboral();
        console.log('✅ Experiencias laborales cargadas:', this.experienciasLaborales);
      },
      error: (err) => {
        console.error('❌ Error al obtener experiencias laborales:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la experiencia laboral del usuario.',
          confirmButtonColor: '#d32f2f',
        });
      }
    });
  }

  eliminarExperienciaLaboral(exp: ExperienciaLaboral) {
    Swal.fire({
      title: '¿Deseas eliminar esta experiencia laboral?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.apiService.eliminarExperienciaLaboral(exp.iCodExperienciaLaboral ?? 0).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado correctamente',
            text: 'La experiencia laboral ha sido eliminada.',
            confirmButtonColor: '#2e7d32',
          }).then(() => {
            this.obtenerExperienciasLaborales(); // 🔁 recarga lista actualizada
          });
        },
        error: (err) => {
          console.error('❌ Error al eliminar experiencia laboral:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'No se pudo eliminar la experiencia laboral.',
            confirmButtonColor: '#d32f2f',
          });
        },
      });
    });
  }

  calcularTotalesExperienciaLaboral() {
    let totalGeneral: Duracion = { años: 0, meses: 0, días: 0 };
    let totalEspecifica: Duracion = { años: 0, meses: 0, días: 0 };
    let totalPublica: Duracion = { años: 0, meses: 0, días: 0 };

    for (const exp of this.experienciasLaborales) {
      if (!exp.duracion) continue;

      if (exp.tipo === 'GENERAL') totalGeneral = this.sumarDuracion(totalGeneral, exp.duracion);
      if (exp.tipo === 'ESPECIFICA') totalEspecifica = this.sumarDuracion(totalEspecifica, exp.duracion);
      if (exp.sector === 'PÚBLICO') totalPublica = this.sumarDuracion(totalPublica, exp.duracion);
    }

    this.experienciaLaboralGeneral = this.formatearDuracion(totalGeneral);
    this.experienciaLaboralEspecifica = this.formatearDuracion(totalEspecifica);
    this.experienciaLaboralPublica = this.formatearDuracion(totalPublica);
  }

  sumarDuracion(d1: Duracion, d2: Duracion): Duracion {
    let años = d1.años + d2.años;
    let meses = d1.meses + d2.meses;
    let días = d1.días + d2.días;

    if (días >= 30) {
      meses += Math.floor(días / 30);
      días %= 30;
    }
    if (meses >= 12) {
      años += Math.floor(meses / 12);
      meses %= 12;
    }
    return { años, meses, días };
  }

  formatearDuracion(d: Duracion): string {
    return `${d.años} Años ${d.meses} Meses ${d.días} Días`;
  }

  // ********************************************************************************************************** //
  // ***************************************** //
  // ******  CURSOS / DIPLOMADOS / ES ******* //  
  // *************************************** //

  cursosDiplomados: CursoDiplomado[] = [];
  cursoDiplomado: CursoDiplomado = this.nuevoCursoDiplomado();
  mostrarModalCursoDiplomado = false;
  editIndexCursoDiplomado: number | null = null;

  // Cargar cursos/diplomados desde backend
  cargarCursosDiplomados() {
    if (this.codUsuario != null) {
      this.apiService.getCursoDiplomadoPorUsuario(this.codUsuario).subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.cursosDiplomados = data.map(c => ({
              iCodCursoDiplomado: c.iCodCursoDiplomado,
              denominacion: c.vCurso,
              institucion: c.vNombreInstitucion,
              horas: Number(c.iHoras)
            }));
          }
        },
        error: (err) => {
          console.error('Error al cargar cursos/diplomados', err);
        }
      });
    }
  }

  // Crear un nuevo curso/diplomado vacío
  nuevoCursoDiplomado(): CursoDiplomado {
    return {
      denominacion: '',
      institucion: '',
      horas: 0
    };
  }

  // Abrir modal para agregar nuevo curso/diplomado
  abrirModalCursoDiplomado() {
    this.cursoDiplomado = this.nuevoCursoDiplomado();
    this.editIndexCursoDiplomado = null;
    this.mostrarModalCursoDiplomado = true;
  }

  // Cerrar modal
  cerrarModalCursoDiplomado() {
    this.mostrarModalCursoDiplomado = false;
  }

  // Método actualizado guardarCursoDiplomado
  guardarCursoDiplomado() {
    // Validaciones (sin cambios)
    if (
      !this.cursoDiplomado.denominacion.trim() ||
      !this.cursoDiplomado.institucion.trim() ||
      !this.cursoDiplomado.horas ||
      this.cursoDiplomado.horas <= 0
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Debe completar todos los campos y las horas deben ser mayores a 0.',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    // Validar duplicados (sin cambios)
    const existeDuplicado = this.cursosDiplomados.some((c, i) =>
      i !== this.editIndexCursoDiplomado &&
      c.denominacion.trim().toLowerCase() === this.cursoDiplomado.denominacion.trim().toLowerCase() &&
      c.institucion.trim().toLowerCase() === this.cursoDiplomado.institucion.trim().toLowerCase() &&
      c.horas === this.cursoDiplomado.horas
    );

    if (existeDuplicado) {
      Swal.fire({
        icon: 'warning',
        title: 'Registro duplicado',
        text: 'Ya existe un registro con los mismos datos.',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    // Payload para backend
    const payload_CursoDiplomado = {
      iCodCursoDiplomado: this.cursoDiplomado.iCodCursoDiplomado || 0,
      iCodUsuario: this.codUsuario,
      vCurso: this.cursoDiplomado.denominacion.trim(),
      vNombreInstitucion: this.cursoDiplomado.institucion.trim(),
      dtFechaRegistro: new Date().toISOString(),
      iHoras: this.cursoDiplomado.horas,
      iCodUsuarioRegistra: this.codUsuario,
      bActivo: true
    };

    const esEdicioncp = this.editIndexCursoDiplomado !== null && this.cursoDiplomado.iCodCursoDiplomado && this.cursoDiplomado.iCodCursoDiplomado > 0;

    // Aquí llamamos al servicio con responseType: 'text'
    const peticioncp = esEdicioncp
      ? this.apiService.actualizarCursoDiplomado(payload_CursoDiplomado, { responseType: 'text' })
      : this.apiService.insertarCursosDiplomado(payload_CursoDiplomado, { responseType: 'text' });

    peticioncp.subscribe({
      next: (response: any) => {
        // En este caso response es texto, ej: "Curso diplomado registrado correctamente."

        if (esEdicioncp && this.editIndexCursoDiplomado !== null) {
          // Actualizar arreglo local
          this.cursosDiplomados[this.editIndexCursoDiplomado] = {
            iCodCursoDiplomado: payload_CursoDiplomado.iCodCursoDiplomado,
            denominacion: payload_CursoDiplomado.vCurso,
            institucion: payload_CursoDiplomado.vNombreInstitucion,
            horas: payload_CursoDiplomado.iHoras
          };
        } else {
          // Insertar nuevo registro, como backend no envía id, usamos 0 o un id temporal
          this.cursosDiplomados.push({
            iCodCursoDiplomado: 0, // o -1 si prefieres identificarlo como temporal
            denominacion: payload_CursoDiplomado.vCurso,
            institucion: payload_CursoDiplomado.vNombreInstitucion,
            horas: payload_CursoDiplomado.iHoras
          });
        }

        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: response,  // mostrar el texto que envía el backend
          confirmButtonColor: '#2e7d32'
        });

        this.cargarCursosDiplomados();


        this.cursoDiplomado = this.nuevoCursoDiplomado();
        this.editIndexCursoDiplomado = null;
        this.cerrarModalCursoDiplomado();
      },
      error: (err) => {
        console.error('Error al guardar curso/diplomado', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la información.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // Editar curso/diplomado
  editarCursoDiplomado(index: number) {
    this.cursoDiplomado = { ...this.cursosDiplomados[index] };
    this.editIndexCursoDiplomado = index;
    this.mostrarModalCursoDiplomado = true;
  }

  // Eliminar curso/diplomado
  eliminarCursoDiplomado(index: number) {
    const curso = this.cursosDiplomados[index];

    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará el registro del curso/diplomado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        if (curso.iCodCursoDiplomado) {
          this.apiService.eliminarCursoDiplomado(curso.iCodCursoDiplomado).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Eliminado',
                text: 'El registro fue eliminado correctamente.',
                confirmButtonColor: '#2e7d32'
              });
              this.cargarCursosDiplomados();
            },
            error: (err) => {
              console.error('Error al eliminar curso/diplomado', err);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el registro.',
                confirmButtonColor: '#d33'
              });
            }
          });
        } else {
          // Eliminación local si no está guardado en backend
          this.cursosDiplomados.splice(index, 1);
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El registro fue eliminado localmente.',
            confirmButtonColor: '#2e7d32'
          });
        }
      }
    });
  }

  // ********************************************************************************************************** //
  // *********************** //
  // ******  IDIOMAS ******* //  
  // *********************** //
  idiomas: Idioma[] = [];
  idioma: Idioma = this.nuevoIdioma();
  mostrarModalIdioma = false;
  editIndexIdioma: number | null = null;

  // Crear una estructura de idioma vacía
  nuevoIdioma(): Idioma {
    return {
      vIdioma: '',
      vInstitucion: '',
      vNivelAlcanzado: ''
    };
  }

  cargarIdiomas() {
    if (this.codUsuario != null) {
      this.apiService.getListarIdiomas(this.codUsuario).subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            this.idiomas = data.map(i => ({
              iCodIdioma: i.iCodIdioma,
              vIdioma: i.vIdioma,
              vInstitucion: i.vInstitucion,
              vNivelAlcanzado: i.vNivelAlcanzado
            }));
          }
        },
        error: (err) => {
          console.error('Error al cargar idiomas', err);
        }
      });
    }
  }

  // Abrir modal de idioma
  abrirModalIdioma() {
    this.idioma = this.nuevoIdioma();
    this.editIndexIdioma = null;
    this.mostrarModalIdioma = true;
  }

  // Cerrar modal de idioma
  cerrarModalIdioma() {
    this.mostrarModalIdioma = false;
  }

  // Editar idioma
  editarIdioma(index: number) {
    this.idioma = { ...this.idiomas[index] }; // incluye iCodIdioma
    this.editIndexIdioma = index;
    this.mostrarModalIdioma = true;
  }

  // Eliminar idioma
  eliminarIdioma(index: number) {
    const idioma = this.idiomas[index];
    const id = idioma.iCodIdioma;

    if (id === undefined) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El ID del idioma es inválido o no existe.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará el registro de idioma.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.eliminarIdioma(id).subscribe({
          next: () => {
            this.apiService.getListarIdiomas(this.codUsuario!).subscribe({
              next: (data) => {
                this.idiomas = data;
              },
              error: (err) => {
                console.error('Error al actualizar lista después de eliminar:', err);
              }
            });

            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El registro fue eliminado correctamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#2e7d32'
            });
          },
          error: (err) => {
            console.error('Error al eliminar idioma:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un error al eliminar el idioma.',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }

  guardarIdioma() {
    if (
      !this.idioma.vIdioma.trim() ||
      !this.idioma.vInstitucion.trim() ||
      !this.idioma.vNivelAlcanzado.trim()
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor complete todos los campos obligatorios.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const isEditando = this.editIndexIdioma !== null;
    const iCodIdioma = isEditando && this.idiomas[this.editIndexIdioma!]?.iCodIdioma
      ? this.idiomas[this.editIndexIdioma!].iCodIdioma
      : 0;

    const payload = {
      iCodIdioma,
      iCodUsuario: this.codUsuario,
      vIdioma: this.idioma.vIdioma.trim(),
      vInstitucion: this.idioma.vInstitucion.trim(),
      vNivelAlcanzado: this.idioma.vNivelAlcanzado.trim(),
      dtFechaRegistro: new Date().toISOString(),
      iCodUsuarioRegistra: this.codUsuario,
      bActivo: true,
      mensaje: ''
    };

    const request = isEditando
      ? this.apiService.actualizarIdioma(payload, { responseType: 'text' as 'json' })
      : this.apiService.insertarIdioma(payload, { responseType: 'text' as 'json' });

    request.subscribe({
      next: (response: any) => {
        // Si la respuesta es un string JSON, parseamos para obtener el mensaje
        let mensaje = response;
        try {
          if (typeof response === 'string') {
            const jsonResp = JSON.parse(response);
            if (jsonResp.mensaje) {
              mensaje = jsonResp.mensaje;
            }
          } else if (response.mensaje) {
            mensaje = response.mensaje;
          }
        } catch (e) {
          // Si no se puede parsear, dejamos el mensaje original
        }

        Swal.fire({
          icon: 'success',
          title: isEditando ? 'Idioma actualizado' : 'Idioma registrado',
          text: mensaje,
          confirmButtonColor: '#2e7d32'
        });

        this.cargarIdiomas();  // recarga lista actualizada
        this.cerrarModalIdioma();
        this.idioma = this.nuevoIdioma();
        this.editIndexIdioma = null;
      },
      error: (err) => {
        console.error('Error al guardar idioma:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar el idioma.',
          confirmButtonColor: '#d33'
        });
      }
    });

  }


  // ********************************************************************************************************** //
  // ************************* //  
  // ******  OFIMATICA ******* //  
  // ************************* //  
  cargarOfimatica() {
    // Asegurar estructura del objeto
    this.datos = this.datos || {};
    this.datos['Ofimática'] = this.datos['Ofimática'] || {};

    if (this.codUsuario != null) {
      this.apiService.getOfimaticaByPostulante(this.codUsuario).subscribe({
        next: (data) => {
          if (data && data.lista && data.lista.length > 0) {
            const registro = data.lista[0]; // tomar el primer elemento de la lista
            this.ofimaticaActual = registro;

            // Convertir booleano a string para el select
            this.datos['Ofimática'].nivelIntermedio = registro.bTieneConocimiento ? 'true' : 'false';
          } else {
            // No hay datos -> mostrar "-- SELECCIONE --"
            this.ofimaticaActual = null;
            this.datos['Ofimática'].nivelIntermedio = '0';
          }
        },
        error: (err) => {
          console.error('Error al cargar Ofimática:', err);
          this.ofimaticaActual = null;
          this.datos['Ofimática'].nivelIntermedio = '0';
        }
      });
    } else {
      this.ofimaticaActual = null;
      this.datos['Ofimática'].nivelIntermedio = '0';
    }
  }

  guardarOfimatica(seccion: string) {
    const datosOfimatica = this.datos[seccion];

    // Validar que no esté vacío ni sea "0"
    if (!datosOfimatica.nivelIntermedio || datosOfimatica.nivelIntermedio === '0') {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obligatorio',
        text: 'Debe indicar si cuenta con conocimientos de ofimática a nivel intermedio.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Convertir string "true"/"false" a boolean
    const tieneConocimientoBoolean = datosOfimatica.nivelIntermedio === 'true';

    // Armar el payload según el formato actualizado
    const payload = {
      iCodOfimaticaNivelIntermedio: this.ofimaticaActual ? this.ofimaticaActual.iCodOfimaticaNivelIntermedio : 0,
      iCodUsuario: this.codUsuario,
      bTieneConocimiento: tieneConocimientoBoolean,
      dtFechaRegistro: new Date().toISOString(),
      iCodUsuarioRegistra: this.codUsuario,
      bActivo: true
    };

    // Si existe registro previo -> actualizar
    if (payload.iCodOfimaticaNivelIntermedio && payload.iCodOfimaticaNivelIntermedio > 0) {
      this.apiService.actualizarOfimatica(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Actualización exitosa',
            text: `La sección "${seccion}" ha sido actualizada correctamente.`,
            confirmButtonColor: '#1e8e3e'
          }).then(() => window.location.reload());
        },
        error: (err) => {
          console.error('Error al actualizar ofimática:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar la sección de Ofimática.',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      // No existe registro previo -> insertar
      this.apiService.insertarOfimatica(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Guardado exitoso',
            text: `La sección "${seccion}" ha sido guardada correctamente.`,
            confirmButtonColor: '#1e8e3e'
          }).then(() => window.location.reload());
        },
        error: (err) => {
          console.error('Error al guardar ofimática:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al guardar la sección de Ofimática.',
            confirmButtonColor: '#d33'
          });
        }
      });
    }
  }

  // ********************************************************************************************************** //
  // ******************************************* //
  // ******  Bonificaciones Adicionales ******* //  
  // ***************************************** //   
  // personasdiscapacidad: string[] = [
  //   'Que las evaluaciones del proceso de selección se efectúen en el primer piso',
  //   'Ubicarse en las primeras filas donde se realizan las evaluaciones ',
  //   'Apoyo visual, gestual y oral para mejorar la comprensión de las instrucciones ',
  //   'Intérprete de señas durante la evaluación o entrevista personal',
  //   'Autorizar que el postulante con discapacidad responda o realice preguntas escritas durante la entrevista '
  // ];

  // ajustesSeleccionados: boolean[] = new Array(this.personasdiscapacidad.length).fill(false);

  bonificacionesAdicionalesActual: any = null;

  cargarDatosBonificacionesAdicionales() {
    if (this.codUsuario != null) {
      this.apiService.getBonificacionesAdicionales(this.codUsuario).subscribe({
        next: (data) => {
          if (data && data.lista && data.lista.length > 0) {
            const registro = data.lista[0];
            this.bonificacionesAdicionalesActual = registro;
            console.log("Datos cargados:", registro);

            // Mapear booleanos a string para los selects ("si"/"no")
            this.datos['Bonificaciones adicionales (FF. AA., Discapacidad)'] = {
              licenciadoFuerzasArmadas: registro.bLicenciaFFAA ? 'si' : 'no',
              codigoLicenciado: registro.vNroCarnetFFAA || '',
              tieneDiscapacidad: registro.bDiscapacidad ? 'si' : 'no',
              codigoDiscapacidad: registro.vNroCarnetDiscapacidad || '',
              // Si luego agregas ajustes, aquí puedes inicializar ese array también
            };
          } else {
            // Sin datos, valores por defecto
            this.bonificacionesAdicionalesActual = null;
            this.datos['Bonificaciones adicionales (FF. AA., Discapacidad)'] = {
              licenciadoFuerzasArmadas: '',
              codigoLicenciado: '',
              tieneDiscapacidad: '',
              codigoDiscapacidad: '',
            };
          }
        },
        error: (err) => {
          console.error('Error al cargar Bonificaciones adicionales:', err);
          this.bonificacionesAdicionalesActual = null;
          this.datos['Bonificaciones adicionales (FF. AA., Discapacidad)'] = {
            licenciadoFuerzasArmadas: '',
            codigoLicenciado: '',
            tieneDiscapacidad: '',
            codigoDiscapacidad: '',
          };
        }
      });
    } else {
      this.bonificacionesAdicionalesActual = null;
      this.datos['Bonificaciones adicionales (FF. AA., Discapacidad)'] = {
        licenciadoFuerzasArmadas: '',
        codigoLicenciado: '',
        tieneDiscapacidad: '',
        codigoDiscapacidad: '',
      };
    }
  }

  guardarBonificacionesAdicionales(seccion: string) {
    const datos = this.datos[seccion];

    // Si el usuario dice NO a licenciado, limpiar el código
    if (datos.licenciadoFuerzasArmadas === 'no') {
      datos.codigoLicenciado = '';
    }

    // Si el usuario dice NO a discapacidad, limpiar el código
    if (datos.tieneDiscapacidad === 'no') {
      datos.codigoDiscapacidad = '';
    }

    // Validaciones simples
    if (!datos.licenciadoFuerzasArmadas || !datos.tieneDiscapacidad) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Debe seleccionar si es licenciado y si tiene discapacidad.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Validación de código si es "sí"
    if (datos.licenciadoFuerzasArmadas === 'si' && !datos.codigoLicenciado) {
      Swal.fire({
        icon: 'warning',
        title: 'Código requerido',
        text: 'Debe ingresar el número de carnet de licenciado.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    if (datos.tieneDiscapacidad === 'si' && !datos.codigoDiscapacidad) {
      Swal.fire({
        icon: 'warning',
        title: 'Código requerido',
        text: 'Debe ingresar el número de carnet de discapacidad.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Preparar payload con los valores correctos
    const payload = {
      iCodBonificaciones: this.bonificacionesAdicionalesActual ? this.bonificacionesAdicionalesActual.iCodBonificaciones : 0,
      iCodUsuario: this.codUsuario,
      bLicenciaFFAA: datos.licenciadoFuerzasArmadas === 'si',
      vNroCarnetFFAA: datos.codigoLicenciado || '',
      bDiscapacidad: datos.tieneDiscapacidad === 'si',
      vNroCarnetDiscapacidad: datos.codigoDiscapacidad || '',
      iCodUsuarioRegistra: this.codUsuario,
      dtFechaRegistro: new Date().toISOString(),
      bActivo: true
    };

    if (payload.iCodBonificaciones && payload.iCodBonificaciones > 0) {
      // Actualizar
      this.apiService.actualizarBonificacionesAdicionales(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Actualización exitosa',
            text: `La sección "${seccion}" ha sido actualizada correctamente.`,
            confirmButtonColor: '#1e8e3e'
          }).then(() => window.location.reload());
        },
        error: (err) => {
          console.error('Error al actualizar Bonificaciones adicionales:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar la sección.',
            confirmButtonColor: '#d33'
          });
        }
      });
    } else {
      // Insertar
      this.apiService.insertarBonificacionesAdicionales(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Guardado exitoso',
            text: `La sección "${seccion}" ha sido guardada correctamente.`,
            confirmButtonColor: '#1e8e3e'
          }).then(() => window.location.reload());
        },
        error: (err) => {
          console.error('Error al guardar Bonificaciones adicionales:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al guardar la sección.',
            confirmButtonColor: '#d33'
          });
        }
      });
    }
  }

  // ********************************************************************************************************** //
  // ***************************************** //
  // *********  DECLARACION JURADA ********** //  
  // *************************************** //
  declaracionJuradaActual: any = null;

  declaracionesJurada: string[] = [
    'No tener condena por delito doloso, con sentencia firme',
    'No estar inhabilitado para ejercer la función pública por decisión administrativa firme o sentencia judicial con calidad de cosa juzgada',
    'No tener antecedentes penales, judiciales y policiales',
    'No tener deuda por concepto de reparaciones civiles a favor de personas y del Estado establecidas en sentencias con calidad de cosa juzgada, que ameriten la inscripción del suscrito en el Registro de Reparaciones Civiles – REDERECI, creado por Ley N° 30353',
    'No estar inscrito en el Registro Único de Condenados Inhabilitados por Delitos contra la Administración Pública, creado por Decreto Legislativo N° 1243',
    'Gozar de buen estado de salud física y mental'
  ];

  declaracionesSeleccionadas: boolean[] = new Array(this.declaracionesJurada.length).fill(false);

  cargarDeclaracionJurada() {
    if (!this.codUsuario) return;

    this.apiService.getDeclaracionJuradaPostulante(this.codUsuario).subscribe({
      next: (data) => {
        // Como el API devuelve directamente un array, verificamos así:
        if (Array.isArray(data) && data.length > 0) {
          const registro = data[0];
          this.declaracionJuradaActual = registro;

          // Mapeamos cada campo booleano a los checkbox
          this.declaracionesSeleccionadas = [
            registro.bSinAntecedentesPenales || false,
            registro.bSinProcesosJudiciales || false,
            registro.bSinSancionesAdministrativas || false,
            registro.bSinVinculoLaboralEstado || false,
            registro.bAceptaBasesConcurso || false,
            true // “Buen estado de salud” — si el API lo maneja, reemplázalo
          ];
        } else {
          // No hay registro
          this.declaracionJuradaActual = null;
          this.declaracionesSeleccionadas = new Array(this.declaracionesJurada.length).fill(false);
        }
      },
      error: (err) => {
        console.error('Error al cargar Declaración Jurada:', err);
        this.declaracionJuradaActual = null;
        this.declaracionesSeleccionadas = new Array(this.declaracionesJurada.length).fill(false);
      }
    });
  }

  guardarDeclaracionJurada(seccion: string) {
    const todasMarcadas = this.declaracionesSeleccionadas.every(v => v);

    if (!todasMarcadas) {
      Swal.fire({
        icon: 'warning',
        title: 'Declaración incompleta',
        text: 'Debes aceptar todas las declaraciones juradas para continuar.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const payload = {
      iCodDeclaracionJuradaPostulante: this.declaracionJuradaActual
        ? this.declaracionJuradaActual.iCodDeclaracionJuradaPostulante
        : 0,
      iCodUsuario: this.codUsuario,
      bSinAntecedentesPenales: this.declaracionesSeleccionadas[0],
      bSinProcesosJudiciales: this.declaracionesSeleccionadas[1],
      bSinSancionesAdministrativas: this.declaracionesSeleccionadas[2],
      bSinVinculoLaboralEstado: this.declaracionesSeleccionadas[3],
      bAceptaBasesConcurso: this.declaracionesSeleccionadas[4],
      iCodUsuarioRegistra: this.codUsuario,
      dtFechaRegistro: new Date().toISOString(),
      bActivo: true,
      mensaje: ''
    };

    const esActualizacion =
      payload.iCodDeclaracionJuradaPostulante &&
      payload.iCodDeclaracionJuradaPostulante > 0;

    const apiCall = esActualizacion
      ? this.apiService.actualizarDeclaracionJuradaPostulante(payload)
      : this.apiService.insertarDeclaracionJurada(payload);

    const mensaje = esActualizacion ? 'actualizada' : 'guardada';

    apiCall.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Operación exitosa',
          text: `La sección "${seccion}" ha sido ${mensaje} correctamente.`,
          confirmButtonColor: '#1e8e3e'
        }).then(() => window.location.reload());
      },
      error: (err) => {
        console.error(`Error al ${mensaje} Declaración Jurada:`, err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Ocurrió un error al ${mensaje} la sección.`,
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  // ********************************************************************************************************** //





















  // ***************************************** //
  // ******  DISPONIBILIDAD DE VIAJAR ******* //  
  // *************************************** //
  // guardarDisponibilidadViajar(seccion: string) {
  //   const datosSeccion = this.datos[seccion];

  //   // Validar que se haya seleccionado una opción
  //   if (datosSeccion.disponibleInterior === undefined || datosSeccion.disponibleInterior === null) {
  //     alert('Por favor, seleccione si tiene disponibilidad para trabajar en el interior del país.');
  //     return;
  //   }

  //   // Aquí podrías guardar los datos, enviarlos a una API, etc.
  //   console.log('Datos guardados para:', seccion);
  //   console.log('Tipo Documento:', datosSeccion.tipoDocumentos);
  //   console.log('Nro Documento:', datosSeccion.nroDocumento);
  //   console.log('RUC:', datosSeccion.ruc);
  //   console.log('Disponibilidad para interior del país:', datosSeccion.disponibleInterior ? 'Sí' : 'No');

  //   alert(`Datos guardados para ${seccion}`);
  // }  

}
