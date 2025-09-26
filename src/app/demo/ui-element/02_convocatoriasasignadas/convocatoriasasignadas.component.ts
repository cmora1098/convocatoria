import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-convocatoriasasignadas',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './convocatoriasasignadas.component.html',
  styleUrls: ['./convocatoriasasignadas.component.scss']
})
export class ConvocatoriasAsignadasComponent {

  filtroActivo: string = 'Todos';

  convocatorias = [
    {
      id: 1,
      titulo: 'Desarrollador de Software',
      fechaInicio: '01/05/2025',
      fechaFin: '30/06/2025',
      estado: 'En progreso'
    },
    {
      id: 2,
      titulo: 'Jefe de Proyectos',
      fechaInicio: '01/05/2025',
      fechaFin: '30/06/2025',
      estado: 'En progreso'
    },
    {
      id: 3,
      titulo: 'Analista Legal II',
      fechaInicio: '01/05/2025',
      fechaFin: '10/06/2025',
      estado: 'Próxima a vencer'
    },
    {
      id: 4,
      titulo: 'Analista de Datos',
      fechaInicio: '01/05/2025',
      fechaFin: '01/06/2025',
      estado: 'Finalizadas'
    }
  ];

  get convocatoriasFiltradas() {
    if (this.filtroActivo === 'Todos') return this.convocatorias;
    return this.convocatorias.filter(c => c.estado === this.filtroActivo);
  }

  setFiltro(filtro: string) {
    this.filtroActivo = filtro;
  }

  verDetalles(convocatoria: any) {
    Swal.fire({
      title: convocatoria.titulo,
      html: `
        <p><b>Fecha:</b> ${convocatoria.fechaInicio} - ${convocatoria.fechaFin}</p>
        <p><b>Estado:</b> ${convocatoria.estado}</p>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  }
}
