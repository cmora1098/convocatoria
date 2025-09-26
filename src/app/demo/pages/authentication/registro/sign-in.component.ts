import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';  // Importamos SweetAlert2

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [SharedModule, RouterModule, FormsModule]
})
export class SignInComponent implements OnInit {
  registerForm: FormGroup;
  tiposDocumentos: any[] = []; // Para almacenar los tipos de documentos que vienen de la API

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      tipoDocumento: [0, Validators.required],
      numDocumento: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      apePaterno: ['', Validators.required],
      apeMaterno: ['', Validators.required],
      nombres: ['', Validators.required],
      correoElectronico: ['', [Validators.required, Validators.email]],
      contrasenia: ['', Validators.required],
      codRol: [3], // o el valor por defecto de rol que manejes
      activo: [true]
    });
  }

  ngOnInit(): void {
    // Aquí hacemos la llamada al servicio para obtener los tipos de documentos
    this.apiService.getTipoDocumentos().subscribe({
      next: (data) => {
        this.tiposDocumentos = data; // Asignamos los datos obtenidos a la propiedad
      },
      error: (err) => {
        console.error('Error al cargar tipos de documentos', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar los tipos de documentos.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
      }
    });
  }

  onSubmit() {
    // Validamos si el tipo de documento es 0 (sin seleccionar)
    if (this.registerForm.get('tipoDocumento')?.value === 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Atención!',
        text: 'Por favor, seleccione un tipo de documento.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#2e7d32'   // Verde AgroRural
      });
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formData = this.registerForm.value;

    this.apiService.register(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Te has registrado correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error en registro', error);
        // Comprobamos si el error tiene un mensaje personalizado de la API
        const errorMessage = error?.error?.mensaje || 'Ocurrió un error al registrar. Verifica los datos o contacta al administrador.';

        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: errorMessage,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'   // Verde AgroRural
        });
      }
    });

  }
}
