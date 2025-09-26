import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

// Project imports
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { ApiService } from '../../../../services/api.service';
import { RouterModule } from '@angular/router';

// SweetAlert2
import Swal from 'sweetalert2';

@Component({
  selector: 'app-restablecer-contrasenia',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, QuillModule, RouterModule],
  templateUrl: './restablecer-contrasenia.component.html',
  styleUrls: ['./restablecer-contrasenia.component.scss']
})
export class RestablecerContraseniaComponent implements OnInit {

  token: string = '';
  nuevaContrasenia: string = '';
  confirmContrasenia: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Captura el token desde la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  restablecer() {
    if (!this.nuevaContrasenia || this.nuevaContrasenia !== this.confirmContrasenia) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Las contraseñas no coinciden',
        confirmButtonColor: '#d33'
      });
      return;
    }

    const body = {
      token: this.token,
      nuevaContrasenia: this.nuevaContrasenia
    };

    this.apiService.post<any>('Usuarios/reestablecer-contrasena', body).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña restablecida!',
          text: 'Ahora puedes iniciar sesión con tu nueva contraseña.',
          confirmButtonText: '<i class="fas fa-sign-in-alt"></i> Ir al Login',
          confirmButtonColor: '#28a745',
          customClass: {
            confirmButton: 'btn btn-success btn-lg px-4'
          }
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al restablecer tu contraseña.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}
