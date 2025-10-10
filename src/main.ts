// import { enableProdMode, importProvidersFrom } from '@angular/core';
// import { environment } from './environments/environment';
// import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
// import { AppRoutingModule } from './app/app-routing.module';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { AppComponent } from './app/app.component';
// import { HttpClientModule } from '@angular/common/http';  // <-- IMPORTAR ESTO
// if (environment.production) { enableProdMode(); }
// bootstrapApplication(AppComponent, { providers: [importProvidersFrom(BrowserModule, AppRoutingModule, HttpClientModule), provideAnimations()] }).catch((err) => console.error(err));

import { enableProdMode, importProvidersFrom, LOCALE_ID } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

registerLocaleData(localeEs, 'es'); // ✅ Registrar el locale español

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      HttpClientModule
    ),
    provideAnimations(),
    { provide: LOCALE_ID, useValue: 'es' }, // ✅ Establecer el locale a español
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
}).catch((err) => console.error(err));
