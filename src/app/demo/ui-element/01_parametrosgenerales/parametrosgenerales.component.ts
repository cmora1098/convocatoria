import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

declare var bootstrap: any; // Necesario para controlar el modal manualmente

@Component({
  selector: 'app-parametrosgenerales',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './parametrosgenerales.component.html',
  styleUrls: ['./parametrosgenerales.component.scss']
})
export class ParametrosGeneralesComponent {
  criterios = [
    { id: 1, pauta: 'Formación Académica', descripcion: 'Nivel Educativo y relevancia para el puesto', peso: '15%' },
    { id: 2, pauta: 'Experiencia Laboral', descripcion: 'Años de experiencia y logros previos', peso: '20%' },
    { id: 3, pauta: 'Habilidades Técnicas', descripcion: 'Conocimientos específicos y certificaciones', peso: '20%' },
    { id: 4, pauta: 'Habilidades Blandas', descripcion: 'Comunicación, liderazgo, trabajo en equipo', peso: '10%' },
    { id: 5, pauta: 'Evaluación de Entrevista', descripcion: 'Respuestas, motivación, cultura, organizacional', peso: '20%' },
    { id: 6, pauta: 'Prueba Técnica o Examen', descripcion: 'Desempeño en ejercicios prácticos', peso: '15%' }
  ];

  criterioEdit: any = {};      // Objeto temporal para el formulario
  indiceEditando: number | null = null;  // null = agregar, número = editar

  // Abre el modal, ya sea para agregar o editar
  abrirModal(index?: number) {
    if (index !== undefined) {
      this.criterioEdit = { ...this.criterios[index] };
      this.indiceEditando = index;
    } else {
      this.criterioEdit = { pauta: '', descripcion: '', peso: '' };
      this.indiceEditando = null;
    }

    const modal = new bootstrap.Modal(document.getElementById('editarModal'));
    modal.show();
  }

  // Guarda los cambios (nuevo o editado)
  guardarCambios() {
    const { pauta, descripcion, peso } = this.criterioEdit;

    if (!pauta || !descripcion || !peso) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    // Quitar % si existe y convertir a número
    const pesoSinPorcentaje = peso.replace('%', '').trim();
    const pesoNumerico = parseFloat(pesoSinPorcentaje);

    if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
      Swal.fire('Error', 'El peso debe ser un número mayor que 0.', 'error');
      return;
    }

    // Calcular la suma total de los pesos existentes
    let sumaPesos = this.criterios.reduce((acc, c, i) => {
      if (i === this.indiceEditando) return acc; // si estamos editando, omitimos el peso original de este item
      const p = parseFloat(c.peso.replace('%', '').trim());
      return acc + (isNaN(p) ? 0 : p);
    }, 0);

    // Sumamos el nuevo peso propuesto
    sumaPesos += pesoNumerico;

    if (sumaPesos > 100) {
      Swal.fire('Error', `La suma total del peso no puede superar el 100%. Actualmente totalizaría ${sumaPesos}%.`, 'error');
      return;
    }

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editarModal'));
    modal.hide();

    const mensaje = this.indiceEditando === null ? 'agregado' : 'modificado';

    if (this.indiceEditando === null) {
      const nuevoId = this.criterios.length > 0 ? Math.max(...this.criterios.map(c => c.id)) + 1 : 1;
      this.criterios.push({
        ...this.criterioEdit,
        id: nuevoId,
        peso: pesoNumerico + '%'
      });
    } else {
      this.criterios[this.indiceEditando] = {
        ...this.criterioEdit,
        peso: pesoNumerico + '%'
      };
    }

    Swal.fire('¡Éxito!', `El criterio ha sido ${mensaje}.`, 'success');

    // Limpiar
    this.criterioEdit = {};
    this.indiceEditando = null;
  }


  // Cancela la edición/agregado
  cancelarEdicion() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('editarModal'));
    modal.hide();
    Swal.fire('Cancelado', 'No se realizaron cambios.', 'info');
    this.criterioEdit = {};
    this.indiceEditando = null;
  }

  // Elimina un criterio con confirmación
  eliminarCriterio(index: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Este criterio se eliminará permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.criterios.splice(index, 1);
        Swal.fire('Eliminado', 'El criterio ha sido eliminado.', 'success');
      }
    });
  }
}
