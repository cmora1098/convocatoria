// import { enableProdMode, importProvidersFrom, LOCALE_ID } from '@angular/core';
// import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';
// import { AppRoutingModule } from './app/app-routing.module';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor';

// import { registerLocaleData } from '@angular/common';
// import localeEs from '@angular/common/locales/es';

// registerLocaleData(localeEs, 'es'); // ✅ Registrar el locale español

// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(
//       BrowserModule,
//       AppRoutingModule,
//       HttpClientModule
//     ),
//     provideAnimations(),
//     { provide: LOCALE_ID, useValue: 'es' }, // ✅ Establecer el locale a español
//     { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
//   ]
// }).catch((err) => console.error(err));

/////////////////////////////////////////////////////////////////////////////////////////////////////

// import { enableProdMode, importProvidersFrom, LOCALE_ID } from '@angular/core';
// import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';
// import { AppRoutingModule } from './app/app-routing.module';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor';

// import { registerLocaleData } from '@angular/common';
// import localeEs from '@angular/common/locales/es';
// import { APP_BASE_HREF } from '@angular/common';  // <-- Importar APP_BASE_HREF

// registerLocaleData(localeEs, 'es'); // Registrar el locale español

// bootstrapApplication(AppComponent, {
//   providers: [
//     importProvidersFrom(
//       BrowserModule,
//       AppRoutingModule,
//       HttpClientModule
//     ),
//     provideAnimations(),
//     { provide: LOCALE_ID, useValue: 'es' },
//     { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

//     // Agregar esta línea para configurar el base href según tu ruta IIS
//     { provide: APP_BASE_HREF, useValue: '/convocatoria' }
//   ]
// }).catch((err) => console.error(err));

///////////////////////////////////////////////////////////////////////////////////////////////

import { enableProdMode, importProvidersFrom, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { APP_BASE_HREF } from '@angular/common';

import { AppConfigService } from './app/services/app-config.service';

import { IdleTimeoutService } from './app/services/idle-timeout.service';

registerLocaleData(localeEs, 'es'); // Registrar locale español

// 👇 Inicializador de configuración
export function initConfig(config: AppConfigService) {
  return () => config.load();
}

export function initIdleTimeout(idleService: IdleTimeoutService) {
  return () => idleService.startWatching();
}
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, HttpClientModule),
    provideAnimations(),

    // Locale
    { provide: LOCALE_ID, useValue: 'es' },

    // Interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },

    // Base href IIS
    { provide: APP_BASE_HREF, useValue: '/convocatoria' },

    // 🔑 Cargar config.json ANTES de iniciar la app
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [AppConfigService],
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initIdleTimeout,
      deps: [IdleTimeoutService],
      multi: true
    }
  ]
}).catch((err) => console.error(err));
