// Angular imports
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

import Swal from 'sweetalert2';  // Importamos SweetAlert2
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes_adm',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent {
  codUsuario: number | null;

  tiposRegimen: any[] = []; // Tipo de Convocatoria - Combobox
  tiposUnidadZonal: any[] = []; // Tipo de Unidad Zonal - Combobox

  constructor(private authService: AuthService, private apiService: ApiService) {
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

    this.apiService.getUnidadZonal().subscribe({
      next: (data) => {
        this.tiposUnidadZonal = data;
      },
      error: (err) => {
        console.error('Error al cargar tipos de regimen', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar los tipos de Unidad Zonal.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
      }
    });
  }
  // ***************************************
  // Convocatoria - Inicio
  filtrosConvocatoria = {
    bActivo: '',
    iCodTipoConvocatoria: '',
    FechaInicio: '',
    FechaFin: '',
    PageNumber: 1,
    PageSize: 1000

  };

  exportarReporteConvocatoria() {
    // 🔸 Validar fechas
    if (!this.filtrosConvocatoria.FechaInicio || !this.filtrosConvocatoria.FechaFin) {
      Swal.fire('Atención', 'Debe seleccionar el rango de fechas.', 'warning');
      return;
    }

    const fechaInicio = new Date(this.filtrosConvocatoria.FechaInicio);
    const fechaFin = new Date(this.filtrosConvocatoria.FechaFin);

    if (fechaInicio > fechaFin) {
      Swal.fire('Atención', 'La fecha inicial no puede ser mayor que la fecha final.', 'warning');
      return;
    }

    // 🔹 Convertir fechas a formato ISO completo (string $date-time)
    const fechaInicioISO = `${this.filtrosConvocatoria.FechaInicio}T00:00:00.00`;
    const fechaFinISO = `${this.filtrosConvocatoria.FechaFin}T23:59:59.999`;

    // 🔹 Crear objeto de parámetros con los nombres exactos que espera el API
    const params = {
      FechaInicio: fechaInicioISO,
      FechaFin: fechaFinISO,
      iCodTipoConvocatoria: this.filtrosConvocatoria.iCodTipoConvocatoria || '',
      iCodUnidadZonal: this.filtrosConvocatoria.iCodTipoConvocatoria || '',
      PageNumber: 1,
      PageSize: 1000
    };

    // 🔹 Llamar al servicio
    this.apiService.getConvocatoriasPaginadoconFase(params).subscribe({
      next: (res) => {
        // Detectar si la respuesta es un array directo o tiene una propiedad 'data'
        const data = Array.isArray(res) ? res : res?.data || [];

        if (data.length > 0) {
          this.exportarAExcelConvocatoria(data);
        } else {
          // Si no hay registros, se genera un archivo con encabezados vacíos
          this.exportarAExcelConvocatoria([]);
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Ocurrió un error al generar el reporte.', 'error');
      }
    });
  }

  exportarAExcelConvocatoria(data: any[]) {
    const dataFormateada = (data && data.length > 0)
      ? data.map(item => ({
        'Código Convocatoria': item.iCodConvocatoria ?? '',
        'Título': item.vTitulo ?? '',
        // 'Tipo Convocatoria': item.vDescripcionConvocatoria ?? '',
        'Unidad Zonal': item.vUnidadZonal ?? '',
        'Fecha Inicio': item.dtFechaInicio ? new Date(item.dtFechaInicio).toLocaleDateString('es-PE') : '',
        'Fecha Fin': item.dtFechaFin ? new Date(item.dtFechaFin).toLocaleDateString('es-PE') : '',
        'Requisitos': item.vRequisitos ?? '',
        'Activo': item.bActivo ? 'Sí' : 'No'
      }))
      : [
        {
          'Código Convocatoria': '',
          'Título': '',
          // 'Tipo Convocatoria': '',
          'Unidad Zonal': '',
          'Fecha Inicio': '',
          'Fecha Fin': '',
          'Requisitos': '',
          'Activo': ''
        }
      ];

    const worksheet = XLSX.utils.json_to_sheet(dataFormateada);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Convocatorias');

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Reporte_Convocatorias_${fecha}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Reporte generado',
      text: data.length
        ? `El reporte fue exportado correctamente (${data.length} registros).`
        : 'No se encontraron convocatorias en el rango de fechas, pero se generó un archivo vacío.',
      confirmButtonColor: '#2e7d32'
    });
  }
  // Convocatoria - Fin
  // ***************************************

  // ***************************************
  // Convocatoria con Fase - Inicio
  filtrosConvocatoriaFase = {
    iCodTipoConvocatoria: '',
    iCodUnidadZonal: '',
    FechaInicio: '',
    FechaFin: '',
    FiltroGeneral: '',
    PageNumber: 1,
    PageSize: 100
  };

  exportarReporteConvocatoriaFase() {
    // 🔸 Validar fechas
    if (!this.filtrosConvocatoriaFase.FechaInicio || !this.filtrosConvocatoriaFase.FechaFin) {
      Swal.fire('Atención', 'Debe seleccionar el rango de fechas.', 'warning');
      return;
    }

    const fechaInicio = new Date(this.filtrosConvocatoriaFase.FechaInicio);
    const fechaFin = new Date(this.filtrosConvocatoriaFase.FechaFin);

    if (fechaInicio > fechaFin) {
      Swal.fire('Atención', 'La fecha inicial no puede ser mayor que la fecha final.', 'warning');
      return;
    }

    // 🔹 Convertir fechas a formato ISO completo (string $date-time)
    const fechaInicioISO = `${this.filtrosConvocatoriaFase.FechaInicio}T00:00:00.00`;
    const fechaFinISO = `${this.filtrosConvocatoriaFase.FechaFin}T00:00:00.00`;

    // 🔹 Crear objeto de parámetros con los nombres esperados por el API
    const params = {
      iCodTipoConvocatoria: this.filtrosConvocatoriaFase.iCodTipoConvocatoria || '',
      iCodUnidadZonal: this.filtrosConvocatoriaFase.iCodUnidadZonal || '',
      FechaInicio: fechaInicioISO,
      FechaFin: fechaFinISO,
      FiltroGeneral: '',
      PageNumber: '',
      PageSize: ''
    };

    // 🔹 Llamar al servicio
    this.apiService.getConvocatoriasPaginadoconFase(params).subscribe({
      next: (res) => {
        // Detectar si la respuesta es un array directo o tiene una propiedad 'data'
        const data = Array.isArray(res) ? res : res?.data || [];

        if (data.length > 0) {
          this.exportarAExcelConvocatoriaFase(data);
        } else {
          // Si realmente no hay registros, genera el archivo vacío o muestra mensaje
          this.exportarAExcelConvocatoriaFase([]);
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Ocurrió un error al generar el reporte.', 'error');
      }
    });
  }

  exportarAExcelConvocatoriaFase(data: any[]) {
    const dataFormateada = (data && data.length > 0)
      ? data.map(item => ({
        'Código Convocatoria': item.iCodConvocatoria ?? '',
        'Título': item.vTitulo ?? '',
        'Tipo Convocatoria': item.vTipoConvocatoria ?? '',
        'Unidad Zonal': item.vUnidadZonal ?? '',
        'Estado': item.vEstadoConvocatoria ?? '',
        'Fecha Inicio': item.dtFechaInicio ? new Date(item.dtFechaInicio).toLocaleDateString('es-PE') : '',
        'Fecha Fin': item.dtFechaFin ? new Date(item.dtFechaFin).toLocaleDateString('es-PE') : '',
        'Requisitos': item.vRequisitos ?? '',
        'Registrado por Usuario ID': item.iCodUsuarioRegistra ?? '',
        'Fecha Registro': item.dtFechaRegistro ? new Date(item.dtFechaRegistro).toLocaleString('es-PE') : '',
        'Activo': item.bActivo ? 'Sí' : 'No'
      }))
      : [
        // 🔹 Si no hay datos, creamos un encabezado vacío
        {
          'Código Convocatoria': '',
          'Título': '',
          'Tipo Convocatoria': '',
          'Unidad Zonal': '',
          'Estado': '',
          'Fecha Inicio': '',
          'Fecha Fin': '',
          'Requisitos': '',
          'Registrado por Usuario ID': '',
          'Fecha Registro': '',
          'Activo': ''
        }
      ];

    const worksheet = XLSX.utils.json_to_sheet(dataFormateada);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Convocatorias con Fase');

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Reporte_Convocatorias_Fase_${fecha}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Reporte generado',
      text: data.length
        ? `El reporte fue exportado correctamente (${data.length} registros).`
        : 'No se encontraron convocatorias en el rango de fechas, pero se generó un archivo vacío.',
      confirmButtonColor: '#2e7d32'
    });
  }

  // Convocatoria con Fase - Fin
  // ***************************************

  // ***************************************
  // Usuario - Inicio
  filtrosUsuario: any = {
    rol: ''
  };

  exportarReporteUsuarios() {
    const params = {
      codRol: this.filtrosUsuario.rol || ''
    };

    this.apiService.getUsuarioPaginado(params).subscribe({
      next: (res) => {
        console.log(res);

        // 🔹 Extraer correctamente los usuarios desde res.items
        const data = res?.items || [];

        if (data.length > 0) {
          this.exportarAExcelUsuarios(data);
        } else {
          // Si no hay registros, generar un archivo vacío
          this.exportarAExcelUsuarios([]);
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Ocurrió un error al generar el reporte.', 'error');
      }
    });
  }

  exportarAExcelUsuarios(data: any[]) {
    const dataFormateada = (data && data.length > 0)
      ? data.map(item => {
        // 🔹 Mapeo de código de rol a nombre
        let nombreRol = '';
        switch (item.codRol) {
          case 1: nombreRol = 'Administrador'; break;
          case 2: nombreRol = 'Evaluador'; break;
          case 3: nombreRol = 'Postulante'; break;
          default: nombreRol = 'Desconocido'; break;
        }

        return {
          'ID Usuario': item.idUsuario ?? '',
          'Tipo Documento': item.tipoDocumento ?? '',
          'N° Documento': item.numDocumento ?? '',
          'Apellido Paterno': item.apePaterno ?? '',
          'Apellido Materno': item.apeMaterno ?? '',
          'Nombres': item.nombres ?? '',
          'Correo Electrónico': item.correoElectronico ?? '',
          'Rol': nombreRol,
          'Fecha Registro': item.fechaRegistro
            ? new Date(item.fechaRegistro).toLocaleString('es-PE')
            : '',
          'Activo': item.activo ? 'Sí' : 'No'
        };
      })
      : [
        {
          'ID Usuario': '',
          'Tipo Documento': '',
          'N° Documento': '',
          'Apellido Paterno': '',
          'Apellido Materno': '',
          'Nombres': '',
          'Correo Electrónico': '',
          'Rol': '',
          'Fecha Registro': '',
          'Activo': ''
        }
      ];

    const worksheet = XLSX.utils.json_to_sheet(dataFormateada);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte de Usuarios');

    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Reporte_Usuarios_${fecha}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'Reporte generado',
      text: data.length
        ? `El reporte fue exportado correctamente (${data.length} registros).`
        : 'No se encontraron usuarios, pero se generó un archivo vacío.',
      confirmButtonColor: '#2e7d32'
    });
  }
 
  // Usuario - Fin
  // ***************************************

}
