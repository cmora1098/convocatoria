// angular import
import { Component, viewChild } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
 
// 3rd party import

import { ApexOptions, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
@Component({
  selector: 'app-postulante-panel',
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './postulante-panel.component.html',
  styleUrls: ['./postulante-panel.component.scss']
})
export class PostulantePanelComponent {
  
}
