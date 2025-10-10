import { Component, ElementRef, Inject, PLATFORM_ID, ViewChild, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service'; // importa tu nuevo servicio

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [SharedModule, RouterModule, FormsModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements AfterViewInit {
  captchaCode: string = '';
  captchaInput: string = '';
  captchaMessage: string = '';

  email: string = '';
  password: string = '';
  mostrarContrasenia: boolean = false;  // variable para mostrar/ocultar

  @ViewChild('captchaCanvas', { static: false }) captchaCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService
  ) { }

  toggleMostrarContrasenia() {
    this.mostrarContrasenia = !this.mostrarContrasenia;
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.generateCaptcha();
    }
  }

  generateCaptcha() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.captchaCode = code.toUpperCase();
    this.drawCaptcha();
  }

  drawCaptcha() {
    if (!isPlatformBrowser(this.platformId)) return;

    const canvas = this.captchaCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);

    // Fondo degradado
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#038C3E');
    gradient.addColorStop(1, '#38A640');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Texto captcha
    const chars = this.captchaCode.split('');
    const fontSize = 45;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textBaseline = 'middle';
    let x = 12;

    chars.forEach((char, i) => {
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#e6ffe6';
      const y = height / 2 + (Math.random() * 6 - 3);
      ctx.fillText(char, x, y);
      x += fontSize - 2;
    });

    // Líneas de interferencia
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Puntos de ruido
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  validateCaptcha() {
    const userInput = this.captchaInput.toUpperCase().trim();

    if (userInput.length === this.captchaCode.length) {
      if (userInput === this.captchaCode) {
        this.captchaMessage = 'CAPTCHA CORRECTO!';
      } else {
        this.captchaMessage = 'CAPTCHA INCORRECTO, INTENTE DE NUEVO.';
        if (isPlatformBrowser(this.platformId)) this.generateCaptcha();
        this.captchaInput = '';
      }
    } else {
      this.captchaMessage = '';
    }
  }

  login() {
    // Validar Captcha primero
    if (this.captchaInput.toUpperCase().trim() !== this.captchaCode) {
      this.captchaMessage = 'CAPTCHA INCORRECTO, INTENTE DE NUEVO.';
      this.generateCaptcha();
      this.captchaInput = '';
      return;
    }

    const payload = {
      correoElectronico: this.email,
      contrasenia: this.password
    };

    this.apiService.post<any>('Usuarios/login', payload).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);

        // Guardar usuario en el servicio de auth
        this.authService.setUser(response);

        // Redirigir según el rol del usuario
        switch (response.codRol) {
          case 1:
            this.router.navigate(['dashboard']);  // Admin
            break;
          case 2:
            this.router.navigate(['edashboard']); // Evaluador
            break;
          case 3:
            this.router.navigate(['pinicio']);    // Postulante
            break;
          default:
            this.router.navigate(['Inicio']);     // fallback
            break;
        }
      },
      error: (error) => {
        console.error('Error en login', error);
        this.captchaMessage = 'Correo o contraseña incorrectos.';
        this.generateCaptcha();
        this.captchaInput = '';
      }
    });
  }
}
