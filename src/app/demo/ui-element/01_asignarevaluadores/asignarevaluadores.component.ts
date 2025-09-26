// Angular imports
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-asignarevaluadores',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './asignarevaluadores.component.html',
  styleUrls: ['./asignarevaluadores.component.scss']
})
export class AsignarEvaluadoresComponent {
  evaluadoresDisponibles = [
    { id: 1, nombre: 'Juan Pérez', seleccionado: false },
    { id: 2, nombre: 'María González', seleccionado: false },
    { id: 3, nombre: 'Carlos Ruiz', seleccionado: false },
  ];

  evaluadoresAsignados = [
    { id: 4, nombre: 'Laura Torres', seleccionado: false },
  ];

  // Alterna selección al hacer clic en la fila
  toggleSeleccion(evaluador: any, tipo: 'disponibles' | 'asignados') {
    evaluador.seleccionado = !evaluador.seleccionado;
  }

  // Mover de disponibles a asignados
  asignarSeleccionados() {
    const seleccionados = this.evaluadoresDisponibles.filter(e => e.seleccionado);
    this.evaluadoresAsignados.push(...seleccionados.map(e => ({ ...e, seleccionado: false })));
    this.evaluadoresDisponibles = this.evaluadoresDisponibles.filter(e => !e.seleccionado);
  }

  // Mover de asignados a disponibles
  quitarSeleccionados() {
    const seleccionados = this.evaluadoresAsignados.filter(e => e.seleccionado);
    this.evaluadoresDisponibles.push(...seleccionados.map(e => ({ ...e, seleccionado: false })));
    this.evaluadoresAsignados = this.evaluadoresAsignados.filter(e => !e.seleccionado);
  }

}
