// Angular imports
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-buscarconvocatoria_adm',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './buscarconvocatoria.component.html',
  styleUrls: ['./buscarconvocatoria.component.scss']
})
export class BuscarConvocatoriaComponent {
  
}
