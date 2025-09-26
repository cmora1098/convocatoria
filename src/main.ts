// import { enableProdMode, importProvidersFrom } from '@angular/core';

// import { environment } from './environments/environment';
// import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
// import { AppRoutingModule } from './app/app-routing.module';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { AppComponent } from './app/app.component';

// import { HttpClientModule } from '@angular/common/http';  // <-- IMPORTAR ESTO

// if (environment.production) {
//   enableProdMode();
// }

// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(
//       BrowserModule,
//       AppRoutingModule,
//       HttpClientModule   // <---- AÑADE ESTE MÓDULO AQUÍ
//     ),
//     provideAnimations()
//   ]
// }).catch((err) => console.error(err));

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { HttpClientModule } from '@angular/common/http';  // <-- IMPORTAR ESTO
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      HttpClientModule
    ),
    provideAnimations(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
}).catch((err) => console.error(err));
