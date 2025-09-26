import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgotten-password',
  imports: [SharedModule, RouterModule],
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.scss']
})
export class ForgottenPasswordComponent {

  email: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiService: ApiService,
    private router: Router
  ) { }

  OlvidoContrasena() {
    const payload = { correoElectronico: this.email };

    Swal.fire({
      title: 'Confirmar envío',
      html: `
        <p style="font-size: 16px; color: #444;">
          Se enviará un enlace de <b>cambio de contraseña</b> al siguiente correo:
        </p>
        <p style="font-size: 18px; font-weight: 600; color: #2e7d32;">${this.email}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#2e7d32',   // Verde AgroRural
      cancelButtonColor: '#d33',
      customClass: {
        title: 'swal-title',
        popup: 'swal-popup',
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.apiService.post<any>('Usuarios/olvide-contrasena', payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Correo enviado!',
              text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
              confirmButtonText: 'Ir a Login',
              confirmButtonColor: '#2e7d32',
              customClass: {
                popup: 'swal-popup',
                title: 'swal-title',
                confirmButton: 'swal-confirm-btn'
              }
            }).then(() => {
              this.router.navigate(['/login']);
            });
          },
          error: () => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo enviar el correo. Intenta nuevamente.',
              confirmButtonColor: '#d33'
            });
          }
        });
      }
    });
  }
}
