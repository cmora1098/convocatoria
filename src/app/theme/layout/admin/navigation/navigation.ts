// export interface NavigationItem {
//   id: string;
//   title: string;
//   type: 'item' | 'collapse' | 'group';
//   translate?: string;
//   icon?: string;
//   hidden?: boolean;
//   url?: string;
//   classes?: string;
//   exactMatch?: boolean;
//   external?: boolean;
//   target?: boolean;
//   breadcrumbs?: boolean;
//   badge?: {
//     title?: string;
//     type?: string;
//   };
//   children?: NavigationItem[];
//   roles?: number[]; // 👈 roles permitidos
// }
// // Barra de Navegación - Barra Lateral - Sidebar
// export const NavigationItems: NavigationItem[] = [
//   // {
//   //   id: 'navigation',
//   //   title: 'Inicio',
//   //   type: 'group',
//   //   icon: 'icon-group',
//   //   children: [
//   //     {
//   //       id: 'dashboard',
//   //       title: 'Dashboard',
//   //       type: 'item',
//   //       url: '/dashboard',
//   //       icon: 'feather icon-home'
//   //     }
//   //   ]
//   // },
//   {
//     id: 'administrador',
//     title: 'Componentes',
//     type: 'group',
//     icon: 'icon-group',
//     roles: [1], // 👈 Solo admin
//     children: [
//       {
//         id: 'navigation',
//         title: 'Inicio',
//         type: 'item',
//         url: '/dashboard',
//         classes: 'nav-item',
//         icon: 'feather icon-home',
//       },
//       {
//         id: '01_convocatoria',
//         title: 'Convocatorias',
//         type: 'collapse',
//         icon: 'feather icon-file-text',
//         children: [
//           {
//             id: 'GestionConvocatoria',
//             title: 'Gestión de Convocatorias',
//             type: 'item',
//             url: '/component/GestionConvocatoria'
//           }
//         ]
//       },
//       {
//         id: '02_postulaciones',
//         title: 'Postulaciones',
//         type: 'collapse',
//         icon: 'feather icon-edit-2',
//         children: [
//           {
//             id: 'vpostulantes',
//             title: 'Ver Postulantes',
//             type: 'item',
//             url: '/component/VerPostulantes'
//           }
//         ]
//       },
//       {
//         id: '03_evaluacion',
//         title: 'Evaluación',
//         type: 'collapse',
//         icon: 'feather icon-clock',
//         children: [
//           {
//             id: 'AsignarEvaluadores',
//             title: 'Asignar Evaluadores',
//             type: 'item',
//             url: '/component/AsignarEvaluadores'
//           },
//           {
//             id: 'ResultadosGenerales',
//             title: 'Ver Resultados Generales',
//             type: 'item',
//             url: '/component/ResultadosGenerales'
//           }
//         ]
//       },
//       {
//         id: '04_reportes',
//         title: 'Reportes',
//         type: 'collapse',
//         icon: 'feather icon-inbox',
//         children: [
//           {
//             id: 'ReportesAdministrador',
//             title: 'Generar Reportes',
//             type: 'item',
//             url: '/component/ReportesAdministrador'
//           }
//         ]
//       },
//       {
//         id: '05_gestionusuario',
//         title: 'Usuarios',
//         type: 'collapse',
//         icon: 'feather icon-users',
//         children: [
//           {
//             id: 'GestionUsuario',
//             title: 'Gestión de Usuarios',
//             type: 'item',
//             url: '/component/GestionUsuario'
//           }
//         ]
//       },
//       {
//         id: '06_parametrosgenerales',
//         title: 'Configuración',
//         type: 'collapse',
//         icon: 'feather icon-settings',
//         children: [
//           {
//             id: 'ParametrosGenerales',
//             title: 'Parámetros Generales',
//             type: 'item',
//             url: '/component/ParametrosGenerales'
//           }
//         ]
//       },
//       {
//         id: 'signin',
//         title: 'Cerrar Sesión',
//         type: 'item',
//         url: '/login',
//         icon: 'feather icon-log-in',
//         target: true,
//         breadcrumbs: false
//       }
//     ]
//   },
//   {
//     id: 'evaluador',
//     title: 'Componentes ',
//     type: 'group',
//     icon: 'icon-group',
//     roles: [2], // 👈 Solo admin 
//     children: [
//       {
//         id: 'enavigation',
//         title: 'Inicio',
//         type: 'item',
//         url: '/edashboard',
//         classes: 'nav-item',
//         icon: 'feather icon-home'
//       },
//       {
//         id: '02_convocatorias',
//         title: 'Convocatorias',
//         type: 'collapse',
//         icon: 'feather icon-file-text ',
//         children: [
//           {
//             id: 'ConvocatoriasAsignadas',
//             title: 'Convocatorias Asignadas',
//             type: 'item',
//             url: '/component/ConvocatoriasAsignadas'
//           }
//         ]
//       },
//     ]
//   },
//   {
//     id: 'ui-component',
//     title: 'Ui Component',
//     type: 'group',
//     icon: 'icon-group',
//     roles: [1], // 👈 Solo admin
//     children: [
//       {
//         id: 'basic',
//         title: 'Component',
//         type: 'collapse',
//         icon: 'feather icon-box',
//         children: [
//           {
//             id: 'button',
//             title: 'Button',
//             type: 'item',
//             url: '/component/button'
//           },
//           {
//             id: 'badges',
//             title: 'Badges',
//             type: 'item',
//             url: '/component/badges'
//           },
//           {
//             id: 'breadcrumb-pagination',
//             title: 'Breadcrumb & Pagination',
//             type: 'item',
//             url: '/component/breadcrumb-paging'
//           },
//           {
//             id: 'collapse',
//             title: 'Collapse',
//             type: 'item',
//             url: '/component/collapse'
//           },
//           {
//             id: 'tabs-pills',
//             title: 'Tabs & Pills',
//             type: 'item',
//             url: '/component/tabs-pills'
//           },
//           {
//             id: 'typography',
//             title: 'Typography',
//             type: 'item',
//             url: '/component/typography'
//           }
//         ]
//       }
//     ]
//   },
//   {
//     id: 'Authentication',
//     title: 'Authentication',
//     type: 'group',
//     icon: 'icon-group',
//     roles: [3],
//     children: [
//       {
//         id: 'signup',
//         title: 'Sign up',
//         type: 'item',
//         url: '/register',
//         icon: 'feather icon-at-sign',
//         target: true,
//         breadcrumbs: false
//       },
//       {
//         id: 'signin',
//         title: 'Sign in',
//         type: 'item',
//         url: '/login',
//         icon: 'feather icon-log-in',
//         target: true,
//         breadcrumbs: false
//       }
//     ]
//   },
//   {
//     id: 'chart',
//     title: 'Chart',
//     type: 'group',
//     icon: 'icon-group',
//     roles: [3],
//     children: [
//       {
//         id: 'apexchart',
//         title: 'ApexChart',
//         type: 'item',
//         url: '/chart',
//         classes: 'nav-item',
//         icon: 'feather icon-pie-chart'
//       }
//     ]
//   },
//   {
//     id: 'forms & tables',
//     title: 'Forms & Tables',
//     type: 'group',
//     icon: 'icon-group',
//     roles: [3],
//     children: [
//       {
//         id: 'forms',
//         title: 'Basic Forms',
//         type: 'item',
//         url: '/forms',
//         classes: 'nav-item',
//         icon: 'feather icon-file-text'
//       },
//       {
//         id: 'tables',
//         title: 'Tables',
//         type: 'item',
//         url: '/tables',
//         classes: 'nav-item',
//         icon: 'feather icon-server'
//       }
//     ]
//   },

//   // {
//   //   id: 'other',
//   //   title: 'Other',
//   //   type: 'group',
//   //   icon: 'icon-group',
//   //   children: [
//   //     {
//   //       id: 'sample-page',
//   //       title: 'Sample Page',
//   //       type: 'item',
//   //       url: '/sample-page',
//   //       classes: 'nav-item',
//   //       icon: 'feather icon-sidebar'
//   //     },
//   //     {
//   //       id: 'menu-level',
//   //       title: 'Menu Levels',
//   //       type: 'collapse',
//   //       icon: 'feather icon-menu',
//   //       children: [
//   //         {
//   //           id: 'menu-level-2.1',
//   //           title: 'Menu Level 2.1',
//   //           type: 'item',
//   //           url: 'javascript:',
//   //           external: true
//   //         },
//   //         {
//   //           id: 'menu-level-2.2',
//   //           title: 'Menu Level 2.2',
//   //           type: 'collapse',
//   //           children: [
//   //             {
//   //               id: 'menu-level-2.2.1',
//   //               title: 'Menu Level 2.2.1',
//   //               type: 'item',
//   //               url: 'javascript:',
//   //               external: true
//   //             },
//   //             {
//   //               id: 'menu-level-2.2.2',
//   //               title: 'Menu Level 2.2.2',
//   //               type: 'item',
//   //               url: 'javascript:',
//   //               external: true
//   //             }
//   //           ]
//   //         }
//   //       ]
//   //     }
//   //   ]
//   // }
// ];


export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  url?: string;
  icon?: string;
  children?: NavigationItem[];
  roles?: number[]; // roles permitidos

  // Props usadas en los templates
  classes?: string;
  target?: boolean;   // abre en nueva pestaña si true
  external?: boolean; // usa <a [href]> si true
  hidden?: boolean;   // true → no mostrar
  breadcrumbs?: boolean;
  badge?: {
    title?: string;
    type?: string;
  };
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'administrador',
    title: 'Componentes',
    type: 'group',
    icon: 'icon-group',
    roles: [1], // Solo admin
    children: [
      {
        id: 'dashboard',
        title: 'Inicio',
        type: 'item',
        url: '/dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item',
        roles: [1]
      },
      {
        id: '01_convocatoria',
        title: 'Convocatorias',
        type: 'collapse',
        icon: 'feather icon-file-text',
        roles: [1],
        children: [
          {
            id: 'GestionConvocatoria',
            title: 'Gestión de Convocatorias',
            type: 'item',
            url: '/component/GestionConvocatoria',
            roles: [1]
          }
        ]
      },
      {
        id: '02_postulaciones',
        title: 'Postulaciones',
        type: 'collapse',
        icon: 'feather icon-edit-2',
        roles: [1],
        children: [
          {
            id: 'vpostulantes',
            title: 'Ver Postulantes',
            type: 'item',
            url: '/component/VerPostulantes',
            roles: [1]
          }
        ]
      },
      {
        id: '03_evaluacion',
        title: 'Evaluación',
        type: 'collapse',
        icon: 'feather icon-clock',
        roles: [1],
        children: [
          {
            id: 'AsignarEvaluadores',
            title: 'Asignar Evaluadores',
            type: 'item',
            url: '/component/AsignarEvaluadores',
            roles: [1]
          },
          {
            id: 'ResultadosGenerales',
            title: 'Ver Resultados Generales',
            type: 'item',
            url: '/component/ResultadosGenerales',
            roles: [1]
          }
        ]
      },
      {
        id: '04_reportes',
        title: 'Reportes',
        type: 'collapse',
        icon: 'feather icon-inbox',
        roles: [1],
        children: [
          {
            id: 'ReportesAdministrador',
            title: 'Generar Reportes',
            type: 'item',
            url: '/component/ReportesAdministrador',
            roles: [1]
          }
        ]
      },
      {
        id: '05_gestionusuario',
        title: 'Usuarios',
        type: 'collapse',
        icon: 'feather icon-users',
        roles: [1],
        children: [
          {
            id: 'GestionUsuario',
            title: 'Gestión de Usuarios',
            type: 'item',
            url: '/component/GestionUsuario',
            roles: [1]
          }
        ]
      },
      {
        id: '06_parametrosgenerales',
        title: 'Configuración',
        type: 'collapse',
        icon: 'feather icon-settings',
        roles: [1],
        children: [
          {
            id: 'ParametrosGenerales',
            title: 'Parámetros Generales',
            type: 'item',
            url: '/component/ParametrosGenerales',
            roles: [1]
          }
        ]
      },
      {
        id: 'signin',
        title: 'Cerrar Sesión',
        type: 'item',
        url: '/login',
        icon: 'feather icon-log-in',
        target: true,
        breadcrumbs: false,
        roles: [1, 2, 3] // visible para todos
      }
    ]
  },
  {
    id: 'evaluador',
    title: 'Componentes Evaluador',
    type: 'group',
    icon: 'icon-group',
    roles: [2],
    children: [
      {
        id: 'edashboard',
        title: 'Inicio',
        type: 'item',
        url: '/edashboard',
        icon: 'feather icon-home',
        classes: 'nav-item',
        roles: [2]
      },
      {
        id: '02_convocatorias',
        title: 'Convocatorias',
        type: 'collapse',
        icon: 'feather icon-file-text',
        roles: [2],
        children: [
          {
            id: 'ConvocatoriasAsignadas',
            title: 'Convocatorias Asignadas',
            type: 'item',
            url: '/component/ConvocatoriasAsignadas',
            roles: [2]
          }
        ]
      }
    ]
  },
  {
    id: 'postulante',
    title: 'Componentes Postulante',
    type: 'group',
    icon: 'icon-group',
    roles: [3],
    children: [
      {
        id: 'pinicio',
        title: 'Inicio',
        type: 'item',
        url: '/pinicio',
        icon: 'feather icon-home',
        classes: 'nav-item',
        roles: [3]
      },
      {
        id: '03_buscarconvocatoria',
        title: 'Convocatorias',
        type: 'collapse',
        icon: 'feather icon-briefcase',
        roles: [3],
        children: [
          {
            id: 'BuscarConvocatoria',
            title: 'Buscar Convocatoria',
            type: 'item',
            url: '/component/BuscarConvocatoria',
            roles: [3]
          },
          {
            id: 'MisPostulaciones',
            title: 'Mis Postulaciones',
            type: 'item',
            url: '/component/MisPostulaciones',
            roles: [3]
          }
        ]
      },
      {
        id: '03_miperfil',
        title: 'Postulante',
        type: 'collapse',
        icon: 'feather icon-user',
        roles: [3],
        children: [
          {
            id: 'MiPerfil',
            title: 'Mi Perfil',
            type: 'item',
            url: '/component/MiPerfil',
            roles: [3]
          }
        ]
      }, 
      {
        id: 'signin',
        title: 'Cerrar Sesión',
        type: 'item',
        url: '/login',
        icon: 'feather icon-log-in',
        target: true,
        breadcrumbs: false,
        roles: [1, 2, 3] // visible para todos
      }, 
    ]
  }
];

