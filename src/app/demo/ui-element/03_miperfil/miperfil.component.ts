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
  nivel: string;
  institucion: string;
  cespecializacion: string;
  fechaInicio: string; // Podrías cambiarlo a Date si prefieres manejar objetos de fecha
}

interface Colegiatura {
  colegio: string;
  numero: string;
  habilitado: string;
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

    if (this.codUsuario) {
      this.apiService.getListarIdiomas(this.codUsuario).subscribe({
        next: (data) => {
          this.idiomas = data;
          console.log(data);
        },
        error: (err) => {
          console.error('Error al cargar idiomas', err);
        }
      });
    }

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

          // Si es precarga, cargamos provincias y luego distritos
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

          // Precarga el distrito si ya estaba seteado
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
  guardarDatosPersonales(seccion: string) {
    const datosPersonales = this.datos[seccion];

    // Validación básica
    const camposRequeridos = [
      // { campo: 'nroDocumento', label: 'Nro. Documento' },
      // { campo: 'apellidoPaterno', label: 'Apellido Paterno' },
      // { campo: 'apellidoMaterno', label: 'Apellido Materno' },
      // { campo: 'nombres', label: 'Nombres' },
      { campo: 'fechaNacimiento', label: 'Fecha de Nacimiento' },
      { campo: 'sexo', label: 'Sexo' },
      { campo: 'estadoCivil', label: 'Estado Civil' },
      // { campo: 'email', label: 'Correo electrónico' },
      { campo: 'celular', label: 'Celular' }
    ];

    let camposVacios = camposRequeridos.filter(c => !datosPersonales[c.campo]);

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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (datosPersonales.email && !emailRegex.test(datosPersonales.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Correo inválido',
        text: 'Por favor ingresa un correo electrónico válido.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // ✅ Mapear datos al formato del backend
    const payload = {
      codPostulante: this.codUsuario,
      codUsuario: this.codUsuario,
      // codigoPostulacion: null,
      fechaNacimiento: new Date(datosPersonales.fechaNacimiento).toISOString(),
      codSexo: datosPersonales.sexo,
      codEstadoCivil: datosPersonales.estadoCivil,
      codDepartamento: datosPersonales.departamentoNacimiento,
      codProvincia: datosPersonales.provinciaNacimiento,
      codDistrito: datosPersonales.distritoNacimiento,
      domicilio: datosPersonales.domicilio,
      celular: datosPersonales.celular,
      telefono: datosPersonales.telefono,
      correo: this.email,
      fechaRegistro: new Date().toISOString(),
      activo: true
    };

    // ✅ Enviar al backend
    this.apiService.insertarDatosPersonales(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Guardado exitoso',
          text: 'Los datos personales han sido enviados correctamente.',
          confirmButtonColor: '#1e8e3e'
        });
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


    // Guardado exitoso
    console.log('Datos guardados para', seccion, datosPersonales);
    Swal.fire({
      icon: 'success',
      title: 'Guardado exitoso',
      text: `Los datos personales han sido guardados correctamente.`,
      confirmButtonColor: '#1e8e3e'
    });
  }


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

  // Guardar formación con validaciones
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

    // Guardar o actualizar
    if (this.editIndexFormacion !== null) {
      this.formaciones[this.editIndexFormacion] = { ...this.formacion };
    } else {
      this.formaciones.push({ ...this.formacion });
      // Ordenar por fecha (opcional)
      this.formaciones.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
    }

    this.cerrarModalFormacion();
  }

  // Editar
  editarFormacion(index: number) {
    this.formacion = { ...this.formaciones[index] };
    this.editIndexFormacion = index;
    this.mostrarModalFormacion = true;
  }

  // Eliminar
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
  colegiatura: Colegiatura = {
    colegio: '',
    numero: '',
    habilitado: ''
  };

  guardarColegiatura(seccion: string) {

    // const guardarColegiatura = {
    //   iCodColegiatura:  ,
    //   iCodPostulante:  this.codUsuario,
    //   iCodColegioProfesional:  ,
    //   vNroColegiatura:  ,
    //   bHabilitado: ,
    //   iCodUsuarioRegistra:  this.codUsuario,
    //   dtFechaRegistro:  ,
    //   bActivo: 
    // };

    // {
    //   "iCodColegiatura": 0,
    //     "iCodPostulante": 0,
    //       "iCodColegioProfesional": 0,
    //         "vNroColegiatura": "string",
    //           "bHabilitado": true,
    //             "iCodUsuarioRegistra": 0,
    //               "dtFechaRegistro": "2025-10-09T17:05:28.402Z",
    //                 "bActivo": true
    // }


    console.log(this.codUsuario); // Rol de Usuario
    return;

    const { colegio, numero, habilitado } = this.colegiatura;

    if (!colegio || !numero || !habilitado) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Debe completar todos los campos requeridos.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Validación número de colegiatura: al menos 4 dígitos numéricos
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

    // Simula guardar (reemplaza con tu lógica real)
    console.log('Datos guardados para', seccion, this.colegiatura);

    Swal.fire({
      icon: 'success',
      title: 'Guardado',
      text: `Los datos de colegiatura han sido guardados correctamente.`,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#2e7d32'
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


  // Guardar final
  // guardarIdioma() {
  //   if (!this.idioma.idioma || !this.idioma.institucion || !this.idioma.nivel) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Campos incompletos',
  //       text: 'Por favor complete todos los campos obligatorios.',
  //       confirmButtonColor: '#d33'
  //     });
  //     return;
  //   }

  //   const payload = {
  //     iCodIdioma: 0,
  //     iCodPostulante: this.codUsuario,
  //     vIdioma: this.idioma.idioma,
  //     vInstitucion: this.idioma.institucion,
  //     vNivelAlcanzado: this.idioma.nivel,
  //     dtFechaRegistro: new Date().toISOString(),
  //     iCodUsuarioRegistra: this.codUsuario,
  //     bActivo: true
  //   };

  //   this.apiService.insertarIdioma(payload).subscribe({
  //     next: () => {
  //       this.idiomas.push({ ...this.idioma }); // agregamos al array local si quieres mostrarlo en tabla
  //       this.cerrarModalIdioma();
  //       Swal.fire({
  //         icon: 'success',
  //         title: 'Idioma registrado',
  //         text: 'El idioma ha sido registrado correctamente.',
  //         confirmButtonColor: '#2e7d32'
  //       });

  //       // Limpiar datos del idioma actual
  //       this.idioma = { idioma: '', institucion: '', nivel: '' };
  //     },
  //     error: (err) => {
  //       console.error('Error al insertar idioma:', err);
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error',
  //         text: 'Ocurrió un error al registrar el idioma.',
  //         confirmButtonColor: '#d33'
  //       });
  //     }
  //   });
  // }

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
        this.apiService.getListarIdiomas(this.codUsuario!).subscribe({
          next: (data) => {
            this.idiomas = data;
          },
          error: (err) => {
            console.error('Error al actualizar lista de idiomas', err);
          }
        });

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

      this.apiService.getOfimaticaByPostulante(this.codUsuario).subscribe({
        next: (data) => {
          if (data) {
            this.ofimaticaActual = data;
            // Aquí asignamos 'true' o 'false' como string para el select
            this.datos['Ofimática'].nivelIntermedio = data.bTieneConocimiento ? 'true' : 'false';
          } else {
            this.datos['Ofimática'].nivelIntermedio = ''; // valor inicial vacío
          }
        },
        error: (err) => {
          console.error('Error al cargar datos de Ofimática:', err);
          this.datos['Ofimática'].nivelIntermedio = '';
        }
      });
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

    // Convierte string "true"/"false" a boolean true/false
    const tieneConocimientoBoolean = datosOfimatica.nivelIntermedio === 'true';

    const payload = {
      iCodOfimaticaNivelIntermedio: this.ofimaticaActual ? this.ofimaticaActual.iCodOfimaticaNivelIntermedio : 0,
      iCodPostulante: this.codUsuario,
      bTieneConocimiento: tieneConocimientoBoolean,  // booleano correcto
      dtFechaRegistro: new Date().toISOString(),
      iCodUsuarioRegistra: this.codUsuario,
      bActivo: true
    };

    console.log('Payload a enviar:', payload); // para depurar

    if (payload.iCodOfimaticaNivelIntermedio && payload.iCodOfimaticaNivelIntermedio > 0) {
      // Actualizar
      this.apiService.actualizarOfimatica(payload.iCodOfimaticaNivelIntermedio, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Guardado exitoso',
            text: `La sección "${seccion}" ha sido actualizada correctamente.`,
            confirmButtonColor: '#1e8e3e'
          });
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
          });
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
