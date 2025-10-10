import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ApiService } from '../../../../services/api.service';
import { FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true,
  imports: [SharedModule, RouterModule, FormsModule]
})
export class SignInComponent implements OnInit {
  registerForm: FormGroup;
  tiposDocumentos: any[] = [];
  verContrasenia: boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      tipoDocumento: [0],
      numDocumento: [''],
      apePaterno: [''],
      apeMaterno: [''],
      nombres: [''],
      correoElectronico: [''],
      contrasenia: [''],
      codRol: [3],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.apiService.getTipoDocumentos().subscribe({
      next: (data) => {
        this.tiposDocumentos = data;
      },
      error: (err) => {
        console.error('Error al cargar tipos de documentos', err);
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Ocurrió un error al cargar los tipos de documentos.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }

  toggleVerContrasenia(): void {
    this.verContrasenia = !this.verContrasenia;
  }

  soloNumeros(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const tipoDoc = this.registerForm.get('tipoDocumento')?.value;

    let maxLength = 0;
    if (tipoDoc === 1) maxLength = 8;      // DNI
    else if (tipoDoc === 3) maxLength = 15; // Pasaporte

    const charCode = event.charCode || event.keyCode;

    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return;
    }

    if (maxLength > 0 && input.value.length >= maxLength) {
      event.preventDefault();
    }
  }

  soloLetras(event: KeyboardEvent) {
    const char = event.key;
    const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
    if (!regex.test(char)) {
      event.preventDefault();
    }
  }

  limpiarErrores() {
    const ids = ['errorTipoDocumento', 'errorNumDocumento', 'errorApePaterno', 'errorApeMaterno', 'errorNombres', 'errorCorreo', 'errorContrasenia'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
  }

  validarFormulario(): boolean {
    this.limpiarErrores();
    const form = this.registerForm.value;
    let valido = true;

    if (![1, 3].includes(+form.tipoDocumento)) {
      this.setError('errorTipoDocumento', 'Por favor, seleccione un tipo de documento válido.');
      valido = false;
    }

    if (form.tipoDocumento == 1) {
      if (!/^\d{8}$/.test(form.numDocumento)) {
        this.setError('errorNumDocumento', 'El DNI debe tener exactamente 8 dígitos.');
        valido = false;
      }
    } else if (form.tipoDocumento == 3) {
      if (!/^\d{8,15}$/.test(form.numDocumento)) {
        this.setError('errorNumDocumento', 'El pasaporte debe tener entre 8 y 15 dígitos.');
        valido = false;
      }
    }

    if (!form.apePaterno || form.apePaterno.trim().length < 2) {
      this.setError('errorApePaterno', 'El apellido paterno debe tener al menos 2 letras.');
      valido = false;
    }
    if (!form.apeMaterno || form.apeMaterno.trim().length < 2) {
      this.setError('errorApeMaterno', 'El apellido materno debe tener al menos 2 letras.');
      valido = false;
    }
    if (!form.nombres || form.nombres.trim().length < 2) {
      this.setError('errorNombres', 'El nombre debe tener al menos 2 letras.');
      valido = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.correoElectronico || !emailRegex.test(form.correoElectronico)) {
      this.setError('errorCorreo', 'Por favor, ingrese un correo electrónico válido.');
      valido = false;
    }

    if (!form.contrasenia || form.contrasenia.length < 6 || form.contrasenia.length > 30) {
      this.setError('errorContrasenia', 'La contraseña debe tener entre 6 y 30 caracteres.');
      valido = false;
    }

    return valido;
  }

  setError(id: string, mensaje: string) {
    const el = document.getElementById(id);
    if (el) el.textContent = mensaje;
  }

  onSubmit(): void {
    if (!this.validarFormulario()) {
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
          confirmButtonColor: '#2e7d32'
        });
        this.router.navigate(['login']);
      },
      error: (error) => {
        console.error('Error en registro', error);
        const errorMessage = error?.error?.mensaje || 'Ocurrió un error al registrar. Verifica los datos o contacta al administrador.';
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: errorMessage,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }
}
