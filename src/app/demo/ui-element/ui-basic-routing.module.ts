import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'badges',
        loadComponent: () => import('./badge/badge.component').then((c) => c.BadgeComponent)
      },
      {
        path: 'button',
        loadComponent: () => import('./button/button.component').then((c) => c.ButtonComponent)
      },
      {
        path: 'breadcrumb-paging',
        loadComponent: () => import('./breadcrumb/breadcrumb.component').then((c) => c.BreadcrumbComponent)
      },
      {
        path: 'collapse',
        loadComponent: () => import('./collapse/collapse.component').then((c) => c.CollapseComponent)
      },
      {
        path: 'tabs-pills',
        loadComponent: () => import('./tabs-pills/tabs-pills.component').then((c) => c.TabsPillsComponent)
      },
      {
        path: 'typography',
        loadComponent: () => import('./typography/typography.component').then((c) => c.TypographyComponent)
      },
      // Para el Rol del Administrador - Inicio
      // Convocatorias
      {
        path: 'GestionConvocatoria',
        canActivate: [AuthGuard],
        loadComponent: () => import('./01_gestionconvocatoria/gestionconvocatoria.component').then((c) => c.GestionConvocatoriaComponent)
      },
      // Postulaciones
      {
        path: 'VerPostulantes',
        canActivate: [AuthGuard],
        loadComponent: () => import('./01_verpostulantes/verpostulantes.component').then((c) => c.VerPostulantesComponent)
      },
      // Asignar Evaluadores
      {
        path: 'AsignarEvaluadores',
        canActivate: [AuthGuard],
        loadComponent: () => import('./01_asignarevaluadores/asignarevaluadores.component').then((c) => c.AsignarEvaluadoresComponent)
      },
      // Ver Resultados Generales
      {
        path: 'ResultadosGenerales',
        canActivate: [AuthGuard],
        loadComponent: () => import('./01_resultadosgenerales/resultadosgenerales.component').then((c) => c.ResultadosGeneralesComponent)
      },
      // Reportes - ADM
      {
        path: 'ReportesAdministrador',
        canActivate: [AuthGuard],
        loadComponent: () => import('./01_reportes_adm/reportes.component').then((c) => c.ReportesComponent)
      },
      // Gestion Usuario
      {
        path: 'GestionUsuario',
        canActivate: [AuthGuard],
        loadComponent: () => import('./01_gestionusuario/gestionusuario.component').then((c) => c.GestionUsuarioComponent)
      },
      // Parametros Generales
      {
        path: 'ParametrosGenerales',
        canActivate: [AuthGuard],
        loadComponent: () => import('./01_parametrosgenerales/parametrosgenerales.component').then((c) => c.ParametrosGeneralesComponent)
      },
      // Para el Rol del Administrador - Fin

      // Para el Rol del Evaluador - Inicio
      {
        path: 'ConvocatoriasAsignadas',
        canActivate: [AuthGuard],
        loadComponent: () => import('./02_convocatoriasasignadas/convocatoriasasignadas.component').then((c) => c.ConvocatoriasAsignadasComponent)
      },
      // Para el Rol del Evaluador - Fin




      // *****************************************************************************************************************************************************
      // Para el Rol del Postulante - Inicio
      {
        path: 'MiPerfil',
        canActivate: [AuthGuard],
        loadComponent: () => import('./03_miperfil/miperfil.component').then((c) => c.MiPerfilComponent)
      }, 
      {
        path: 'BuscarConvocatoria',
        canActivate: [AuthGuard],
        loadComponent: () => import('./03_buscarconvocatoria/buscarconvocatoria.component').then((c) => c.BuscarConvocatoriaComponent)
      },
      // Para el Rol del Postulante - Fin


    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UiBasicRoutingModule { }
