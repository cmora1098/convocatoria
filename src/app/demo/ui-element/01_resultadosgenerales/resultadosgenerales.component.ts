// Angular imports
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-resultadosgenerales',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule],
  templateUrl: './resultadosgenerales.component.html',
  styleUrls: ['./resultadosgenerales.component.scss']
})
export class ResultadosGeneralesComponent {
  
}
