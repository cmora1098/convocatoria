// // src/app/services/auth.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private currentUserSubject = new BehaviorSubject<any>(null);
//   currentUser$ = this.currentUserSubject.asObservable();

//   constructor() {
//     const savedUser = localStorage.getItem('user');
//     try {
//       if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
//         this.currentUserSubject.next(JSON.parse(savedUser));
//       }
//     } catch (e) {
//       console.error('Error parseando usuario guardado en localStorage:', e);
//       localStorage.removeItem('user'); // limpiar si está corrupto
//     }
//   }

//   // Guardar usuario en localStorage
//   setUser(user: any): void {
//     localStorage.setItem('user', JSON.stringify(user));
//     this.currentUserSubject.next(user);
//   }

//   // Obtener solo el ID del usuario (idUsuario / codUsuario)
//   getUserId(): number | null {
//     const user = this.getUser();
//     return user?.idUsuario ?? null;
//   }


//   // Obtener usuario actual
//   getUser(): any {
//     return this.currentUserSubject.value;
//   }

//   // Obtener solo el rol del usuario (codRol)
//   getUserRole(): number | null {
//     const user = this.getUser();
//     return user?.codRol ?? null;
//   }

//   // Saber si hay sesión activa
//   isLoggedIn(): boolean {
//     return !!this.currentUserSubject.value;
//   }

//   // Cerrar sesión
//   logout(): void {
//     localStorage.removeItem('user'); // o sessionStorage si prefieres
//     this.currentUserSubject.next(null);
//   }
// }

// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem('user');
    try {
      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Error parseando usuario guardado en localStorage:', e);
      localStorage.removeItem('user'); // limpiar si está corrupto
    }
  }

  // Guardar usuario en localStorage
  setUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Obtener usuario actual
  getUser(): any {
    return this.currentUserSubject.value;
  }

  // Obtener solo el ID del usuario (idUsuario / codUsuario)
  getUserId(): number | null {
    const user = this.getUser();
    return user?.idUsuario ?? null;
  }

  // Obtener solo el rol del usuario (codRol)
  getUserRole(): number | null {
    const user = this.getUser();
    return user?.codRol ?? null;
  }

  // Obtener solo el token
  getToken(): string | null {
    const user = this.getUser();
    return user?.token ?? null;
  }

  // Saber si hay sesión activa
  isLoggedIn(): boolean {
    return !!this.getToken(); // asegura que el token exista
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('user'); // o sessionStorage si prefieres
    this.currentUserSubject.next(null);
  }


  // ******************************************************************

  // Obtener solo el rol del usuario (Tipo Documento)
  getTipoDocumento(): string | null {
    const user = this.getUser(); 
    return user?.tipoDocumento ?? null;
  }
 
  // Obtener solo el rol del usuario (nro Documento)
  getNroDocumento(): string | null {
    const user = this.getUser();
    return user?.nroDocumento ?? null;
  }

  // Obtener solo el rol del usuario (Nombre Completo)
  getNombreCompleto(): string | null {
    const user = this.getUser();
    return user?.nombres ?? null;
  }

  // Obtener solo el rol del usuario (Apellido Paterno)
  getApellidoPaterno(): string | null {
    const user = this.getUser();
    return user?.apellidoPaterno ?? null;
  }

  // Obtener solo el rol del usuario (Apellido Materno)
  getApellidoMaterno(): string | null {
    const user = this.getUser();
    return user?.apellidoMaterno ?? null;
  }

  // Obtener solo el rol del usuario (Email)
  getEmail(): string | null {
    const user = this.getUser();
    return user?.correoElectronico ?? null;
  }





}
