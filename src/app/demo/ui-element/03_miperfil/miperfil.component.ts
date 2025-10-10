import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

import { ApiService } from '../../../services/api.service';
import Swal from 'sweetalert2';  // Importamos SweetAlert2

import { AuthService } from '../../../services/auth.service';
import { HttpClient } from '@angular/common/http';

import { NgForm } from '@angular/forms';
import { forkJoin } from 'rxjs';

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


interface Colegiatura {
  colegio: string;    // id como string, porque viene del <select>
  numero: string;
  habilitado: boolean | null; // Permite validar si se ha seleccionado algo
}

interface CursoDiplomado {
  denominacion: string;
  institucion: string;
  horas: number | null;
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

interface ExperienciaLaboral {
  tipo: 'GENERAL' | 'ESPECIFICA';
  entidad: string;
  unidad: string;
  cargo: string;
  sector: 'PÚBLICO' | 'PRIVADO' | '';
  fechaInicio: string;
  fechaFin: string;
  total: string;
  duracion?: Duracion;
  funciones: string[];
  temas?: { [key: string]: boolean };
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
      codigoDiscapacidad: '',
      ajustesSeleccionados: []
    }
  };

  constructor(private apiService: ApiService, private authService: AuthService, private http: HttpClient) {
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
        console.log('Departamentos cargados:', data); // 🧪
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

    // if (this.codUsuario) {
    //   this.apiService.getListarIdiomas(this.codUsuario).subscribe({
    //     next: (data) => {
    //       this.idiomas = data;
    //       console.log(data);
    //     },
    //     error: (err) => {
    //       console.error('Error al cargar idiomas', err);
    //     }
    //   });
    // }

    this.cargarDatosPersonales();
    this.cargarFormaciones();



    this.cargarOfimatica();


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
    alert('Volviendo...');
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
            console.log('Datos personales recibidos:', data);

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

    const payload = {
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

    const esNuevoRegistro = payload.iCodDatosPersonales === 0;

    const request$ = esNuevoRegistro
      ? this.apiService.insertarDatosPersonales(payload) // POST
      : this.apiService.actualizarDatosPersonales(payload); // PUT

    request$.subscribe({
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

    // Armar payload
    const payload = {
      iCodFormacionAcademica: this.formacion.iCodFormacionAcademica || 0,
      iCodUsuario: this.codUsuario,
      iCodNivelAcademico: this.formacion.nivel,
      vInstitucion: this.formacion.institucion,
      vProfesion: this.formacion.cespecializacion || '',
      dFechaEgreso: new Date(this.formacion.fechaInicio).toISOString(),
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


 
  // ******************************* //
  // *******  COLEGIATURA  ******** //  
  // ***************************** //
  colegiatura: Colegiatura = {
    colegio: '0',
    numero: '',
    habilitado: null
  };

  guardarColegiatura(seccion: string) {
    const { colegio, numero, habilitado } = this.colegiatura;

    if (!colegio || colegio === '0' || !numero || this.colegiatura.habilitado === null) {
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


    const payload = {
      iCodColegiatura: 0,
      iCodPostulante: this.codUsuario,
      iCodColegioProfesional: Number(colegio),
      vNroColegiatura: numero,
      bHabilitado: this.colegiatura.habilitado,
      iCodUsuarioRegistra: this.codUsuario,
      dtFechaRegistro: new Date().toISOString(),
      bActivo: true
    };

    this.apiService.insertarColegiatura(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Guardado',
          text: `Los datos de colegiatura han sido guardados correctamente.`,
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








  // ***************************************** //
  // ******  EXPERIENCIA LABORAL ******* //  
  // *************************************** //
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
    this.indiceExperienciaLaboralEditando = null;
    this.experienciaLaboralActual = this.nuevaExperienciaLaboral(tipo);
    this.mostrarModalExperienciaLaboral();
  }

  mostrarModalExperienciaLaboral() {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalExperiencia'));
    modal.show();
  }

  agregarFuncionLaboral() {
    this.experienciaLaboralActual.funciones.push('');
  }

  eliminarFuncionLaboral(i: number) {
    this.experienciaLaboralActual.funciones.splice(i, 1);
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
    if (this.indiceExperienciaLaboralEditando !== null) {
      this.experienciasLaborales[this.indiceExperienciaLaboralEditando] = { ...this.experienciaLaboralActual };
      this.indiceExperienciaLaboralEditando = null;
    } else {
      this.experienciasLaborales.push({ ...this.experienciaLaboralActual });
    }

    const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('modalExperiencia'));
    modal.hide();
    this.calcularTotalesExperienciaLaboral();

    Swal.fire({
      icon: 'success',
      title: 'Guardado',
      text: 'La experiencia laboral ha sido registrada correctamente.',
      confirmButtonColor: '#1e8e3e'
    });
  }

  eliminarExperienciaLaboral(exp: ExperienciaLaboral) {
    this.experienciasLaborales = this.experienciasLaborales.filter(e => e !== exp);
    this.calcularTotalesExperienciaLaboral();
  }

  editarExperienciaLaboral(exp: ExperienciaLaboral) {
    const index = this.experienciasLaborales.indexOf(exp);
    if (index !== -1) {
      this.indiceExperienciaLaboralEditando = index;
      this.experienciaLaboralActual = JSON.parse(JSON.stringify(exp));
      this.mostrarModalExperienciaLaboral();
    }
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

  // Crear nueva estructura vacía
  nuevoCursoDiplomado(): CursoDiplomado {
    return {
      denominacion: '',
      institucion: '',
      horas: null
    };
  }

  // Abrir modal
  abrirModalCursoDiplomado() {
    this.cursoDiplomado = this.nuevoCursoDiplomado();
    this.editIndexCursoDiplomado = null;
    this.mostrarModalCursoDiplomado = true;
  }

  // Cerrar modal
  cerrarModalCursoDiplomado() {
    this.mostrarModalCursoDiplomado = false;
  }

  // Guardar registro (modal)
  guardarCursoDiplomado() {
    const { denominacion, institucion, horas } = this.cursoDiplomado;

    if (!denominacion || !institucion || horas === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Debe completar todos los campos obligatorios (*)',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    if (horas <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Horas inválidas',
        text: 'La duración debe ser mayor a cero.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    const existeDuplicado = this.cursosDiplomados.some((curso, index) =>
      index !== this.editIndexCursoDiplomado &&
      curso.denominacion.trim().toLowerCase() === denominacion.trim().toLowerCase() &&
      curso.institucion.trim().toLowerCase() === institucion.trim().toLowerCase()
    );

    if (existeDuplicado) {
      Swal.fire({
        icon: 'info',
        title: 'Curso duplicado',
        text: 'Este curso o diplomado ya ha sido registrado.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    if (this.editIndexCursoDiplomado !== null) {
      this.cursosDiplomados[this.editIndexCursoDiplomado] = { ...this.cursoDiplomado };
    } else {
      this.cursosDiplomados.push({ ...this.cursoDiplomado });
    }

    this.cerrarModalCursoDiplomado();
    Swal.fire({
      icon: 'success',
      title: 'Guardado',
      text: 'El registro se ha guardado correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#2e7d32'
    });
  }

  // Editar registro
  editarCursoDiplomado(index: number) {
    this.cursoDiplomado = { ...this.cursosDiplomados[index] };
    this.editIndexCursoDiplomado = index;
    this.mostrarModalCursoDiplomado = true;
  }

  // Eliminar registro
  eliminarCursoDiplomado(index: number) {
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Esta acción eliminará el curso, diplomado o especialización.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cursosDiplomados.splice(index, 1);
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

  // Guardar datos finales del formulario
  guardarCursosDiplomados(seccion: string) {
    if (this.cursosDiplomados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin registros',
        text: 'Debe agregar al menos un curso o diplomado.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#d33'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Datos guardados',
      text: 'Los cursos, diplomados o especializaciones han sido guardados correctamente.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#2e7d32'
    });

    console.log('Datos guardados para', seccion, this.cursosDiplomados);
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
            // this.apiService.getListarIdiomas(this.codUsuario!).subscribe({
            //   next: (data) => {
            //     this.idiomas = data;
            //   },
            //   error: (err) => {
            //     console.error('Error al actualizar lista después de eliminar:', err);
            //   }
            // });

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
      !this.idioma.vIdioma ||
      !this.idioma.vInstitucion ||
      !this.idioma.vNivelAlcanzado
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
      iCodPostulante: this.codUsuario,
      vIdioma: this.idioma.vIdioma,
      vInstitucion: this.idioma.vInstitucion,
      vNivelAlcanzado: this.idioma.vNivelAlcanzado,
      dtFechaRegistro: new Date().toISOString(),
      iCodUsuarioRegistra: this.codUsuario,
      bActivo: true
    };

    // ✅ Elegir entre insertar o actualizar según si es edición
    const request = isEditando
      ? this.apiService.actualizarIdioma(payload)
      : this.apiService.insertarIdioma(payload);

    request.subscribe({
      next: () => {
        // this.apiService.getListarIdiomas(this.codUsuario!).subscribe({
        //   next: (data) => {
        //     this.idiomas = data;
        //   },
        //   error: (err) => {
        //     console.error('Error al actualizar lista de idiomas', err);
        //   }
        // });

        this.cerrarModalIdioma();
        Swal.fire({
          icon: 'success',
          title: isEditando ? 'Idioma actualizado' : 'Idioma registrado',
          text: isEditando
            ? 'El idioma ha sido actualizado correctamente.'
            : 'El idioma ha sido registrado correctamente.',
          confirmButtonColor: '#2e7d32'
        });

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
    if (this.codUsuario != null) {
      // this.apiService.getOfimaticaByPostulante(this.codUsuario).subscribe({
      //   next: (data) => {
      //     if (data) {
      //       this.ofimaticaActual = data;
      //       console.log(data);
      //       // Asignar 'true' o 'false' como string para que el select lo reconozca bien
      //       this.datos['Ofimática'].nivelIntermedio = data.bTieneConocimiento ? 'true' : 'false';
      //     } else {
      //       // No hay datos: asignar '0' para que se seleccione "-- SELECCIONE --"
      //       this.datos['Ofimática'].nivelIntermedio = '0';
      //     }
      //   },
      //   error: (err) => {
      //     console.error('Error al cargar datos de Ofimática:', err);
      //     this.datos['Ofimática'].nivelIntermedio = '0';  // valor por defecto para "-- SELECCIONE --"
      //   }
      // });
    }
  }

  guardarOfimatica(seccion: string) {
    const datosOfimatica = this.datos[seccion];

    if (!datosOfimatica.nivelIntermedio) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obligatorio',
        text: 'Debe indicar si cuenta con conocimientos de ofimática a nivel intermedio.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Convertimos string "true"/"false" a boolean
    const tieneConocimientoBoolean = datosOfimatica.nivelIntermedio === 'true';

    const payload = {
      iCodOfimaticaNivelIntermedio: this.ofimaticaActual ? this.ofimaticaActual.iCodOfimaticaNivelIntermedio : 0,
      iCodPostulante: this.codUsuario,
      bTieneConocimiento: tieneConocimientoBoolean,
      dtFechaRegistro: new Date().toISOString(),
      iCodUsuarioRegistra: this.codUsuario,
      bActivo: true
    };

    if (payload.iCodOfimaticaNivelIntermedio && payload.iCodOfimaticaNivelIntermedio > 0) {
      // Actualizar solo enviando el payload completo con booleano
      const estado = datosOfimatica.nivelIntermedio === 'true';      // convierte a booleano

      this.apiService.actualizarOfimatica(payload.iCodOfimaticaNivelIntermedio, estado).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Guardado exitoso',
            text: `La sección "${seccion}" ha sido actualizada correctamente.`,
            confirmButtonColor: '#1e8e3e'
          }).then(() =>
            window.location.reload()
          );
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
      // Insertar nuevo
      this.apiService.insertarOfimatica(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Guardado exitoso',
            text: `La sección "${seccion}" ha sido guardada correctamente.`,
            confirmButtonColor: '#1e8e3e'
          }).then(() =>
            window.location.reload()
          );
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
  personasdiscapacidad: string[] = [
    'Que las evaluaciones del proceso de selección se efectúen en el primer piso',
    'Ubicarse en las primeras filas donde se realizan las evaluaciones ',
    'Apoyo visual, gestual y oral para mejorar la comprensión de las instrucciones ',
    'Intérprete de señas durante la evaluación o entrevista personal',
    'Autorizar que el postulante con discapacidad responda o realice preguntas escritas durante la entrevista '
  ];
  ajustesSeleccionados: boolean[] = new Array(this.personasdiscapacidad.length).fill(false);
  guardarBonificacionesAdicionales(seccion: string) {
    const datos = this.datos[seccion];

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

    // Validar al menos un ajuste razonable
    const ajustesMarcados = this.ajustesSeleccionados
      .map((checked, i) => (checked ? this.personasdiscapacidad[i] : null))
      .filter(v => v !== null);

    if (ajustesMarcados.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Ajustes razonables',
        text: 'Debe seleccionar al menos un ajuste razonable.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Guardar ajustes seleccionados
    this.datos[seccion].ajustesSeleccionados = ajustesMarcados;

    Swal.fire({
      icon: 'success',
      title: 'Guardado exitoso',
      text: `La sección "${seccion}" ha sido guardada correctamente.`,
      confirmButtonColor: '#1e8e3e'
    });
  }

  // ********************************************************************************************************** //
  // ***************************************** //
  // *********  DECLARACION JURADA ********** //  
  // *************************************** //

  declaracionesJurada: string[] = [
    'No tener condena por delito doloso, con sentencia firme',
    'No estar inhabilitado para ejercer la función pública por decisión administrativa firme o sentencia judicial con calidad de cosa juzgada',
    'No tener antecedentes penales, judiciales y policiales',
    'No tener deuda por concepto de reparaciones civiles a favor de personas y del Estado establecidas en sentencias con calidad de cosa juzgada, que ameriten la inscripción del suscrito en el Registro de Reparaciones Civiles – REDERECI, creado por Ley N° 30353',
    'No estar inscrito en el Registro Único de Condenados Inhabilitados por Delitos contra la Administración Pública, creado por Decreto Legislativo N° 1243',
    'Gozar de buen estado de salud física y mental'
  ];
  declaracionesSeleccionadas: boolean[] = new Array(this.declaracionesJurada.length).fill(false);
  guardarDeclaracionJurada(seccion: string) {
    const todasMarcadas = this.declaracionesSeleccionadas.every(seleccionada => seleccionada);

    if (!todasMarcadas) {
      Swal.fire({
        icon: 'warning',
        title: 'Declaración incompleta',
        html: 'Debes aceptar todas las declaraciones juradas para continuar.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Guardar lógicamente si se necesita
    const declaracionesAceptadas = this.declaracionesJurada.filter((_, i) => this.declaracionesSeleccionadas[i]);
    console.log('Declaraciones aceptadas:', declaracionesAceptadas);

    Swal.fire({
      icon: 'success',
      title: 'Guardado exitoso',
      text: `La sección "${seccion}" ha sido guardada correctamente.`,
      confirmButtonColor: '#1e8e3e'
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
