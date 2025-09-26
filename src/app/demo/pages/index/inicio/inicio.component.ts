import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [SharedModule, RouterModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss']
})
export class InicioComponent {

  tipoConvocatoria: string = ''; // TODOS por defecto
  textoBusqueda: string = '';

  convocatorias: any[] = [];

  ngOnInit(): void {
    this.buscarConvocatorias();
  }

  buscarConvocatorias(): void {
    // Datos en duro (mock)
    this.convocatorias = [
      {
        proceso: '129-OGRH-2025',
        detalle: 'POR SUPLENCIA DE UN (01) ANALISTA I EN SELECCIÓN DE PERSONAL PARA LA OFICINA DE DESARROLLO DE RECURSOS HUMANOS',
        sede: 'Av. Plaza 30 de Agosto S/N, San Isidro - Lima',
        estado: 'NUEVA',
        bases: true,
        comunicado: false,
        resultados: false
      },
      {
        proceso: '128-OGRH-2025',
        detalle: 'ANALISTA I DE GESTIÓN ADMINISTRATIVA PARA LA OFICINA GENERAL DE ASESORÍA JURÍDICA DEL MININTER',
        sede: 'Av. Plaza 30 de Agosto S/N, San Isidro - Lima',
        estado: 'NUEVA',
        bases: true,
        comunicado: false,
        resultados: false
      },
      {
        proceso: '127-OGRH-2025',
        detalle: 'ESPECIALISTA II EN COMUNICACIÓN, DIFUSIÓN Y PROTOCOLO PARA EL DESPACHO VICEMINISTERIAL DE SEGURIDAD PÚBLICA',
        sede: 'Av. Plaza 30 de Agosto S/N, San Isidro - Lima',
        estado: 'NUEVA',
        bases: true,
        comunicado: false,
        resultados: false
      }
    ];
  }
}
