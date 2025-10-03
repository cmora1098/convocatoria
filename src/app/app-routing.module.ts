// Angular Import
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// project import
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';

import { AuthGuard } from './guards/auth.guard'; // 👇 importa tu guard - Proteger rutas

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        // redirectTo: '/login', //Redireccionamiento al inicio 
        redirectTo: '/Inicio', //Redireccionamiento al inicio
        pathMatch: 'full'
      },

      // Administrador
      {
        path: 'dashboard',
        canActivate: [AuthGuard], //  Proteger rutas
        loadComponent: () => import('./demo/admin-panel/admin-panel.component').then((c) => c.AdminPanelComponent)
      },

      // Evaluador
      {
        path: 'edashboard',
        canActivate: [AuthGuard],
        loadComponent: () => import('./demo/evaluador-panel/evaluador-panel.component').then((c) => c.EvaluadorPanelComponent)
      },
      // Evaluador
      {
        path: 'pinicio',
        canActivate: [AuthGuard],
        loadComponent: () => import('./demo/postulante-panel/postulante-panel.component').then((c) => c.PostulantePanelComponent)
      },







      
      {
        path: 'analytics',
        loadComponent: () => import('./demo/dashboard/dash-analytics.component').then((c) => c.DashAnalyticsComponent)
      },
      {
        path: 'component',
        loadChildren: () => import('./demo/ui-element/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'chart',
        loadComponent: () => import('./demo/chart-maps/core-apex.component').then((c) => c.CoreApexComponent)
      },
      {
        path: 'forms',
        loadComponent: () => import('./demo/forms/form-elements/form-elements.component').then((c) => c.FormElementsComponent)
      },
      {
        path: 'tables',
        loadComponent: () => import('./demo/tables/tbl-bootstrap/tbl-bootstrap.component').then((c) => c.TblBootstrapComponent)
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/other/sample-page/sample-page.component').then((c) => c.SamplePageComponent)
      }
    ]
  },


  { // Iniciar Sesión
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        // loadComponent: () => import('./demo/pages/authentication/iniciar-sesion/sign-up.component').then((c) => c.SignUpComponent) // Login
        loadComponent: () => import('./demo/pages/authentication/iniciar-sesion/sign-up.component').then(m => m.SignUpComponent)

      },
      {
        path: 'register',
        loadComponent: () => import('./demo/pages/authentication/registro/sign-in.component').then((c) => c.SignInComponent) // Registro
      },
      {
        path: 'fpassword',
        loadComponent: () =>
          import('./demo/pages/authentication/contrasenia-olvidada/forgotten-password.component').then((c) => c.ForgottenPasswordComponent) // Contraseña Olvidada
      },
      {
        path: 'rpassword',
        loadComponent: () =>
          import('./demo/pages/authentication/restablecer-contrasenia/restablecer-contrasenia.component').then((c) => c.RestablecerContraseniaComponent) // Cambio de Contraseña
      },

      // Inicio
      {
        path: 'Inicio',
        loadComponent: () =>
          import('./demo/pages/index/inicio/inicio.component').then((c) => c.InicioComponent) // Menú de Inicio
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
