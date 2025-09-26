// // Angular Import
// import { Component, output } from '@angular/core';

// // project import
// import { SharedModule } from 'src/app/theme/shared/shared.module';
// import { NavContentComponent } from './nav-content/nav-content.component';

// @Component({
//   selector: 'app-navigation',
//   imports: [SharedModule, NavContentComponent],
//   templateUrl: './navigation.component.html',
//   styleUrls: ['./navigation.component.scss']
// })
// export class NavigationComponent {
//   // public props
//   windowWidth: number;
//   NavMobCollapse = output();

//   // constructor
//   constructor() {
//     this.windowWidth = window.innerWidth;
//   }

//   // public method
//   navMobCollapse() {
//     if (this.windowWidth < 992) {
//       this.NavMobCollapse.emit();
//     }
//   }
// }

// navigation.component.ts
import { Component, OnInit, output } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavContentComponent } from './nav-content/nav-content.component';
import { AuthService } from 'src/app/services/auth.service';
import { NavigationItem, NavigationItems } from './navigation';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [SharedModule, NavContentComponent],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  windowWidth: number;
  NavMobCollapse = output();
  navigation: NavigationItem[] = [];

  constructor(private authService: AuthService) {
    this.windowWidth = window.innerWidth;
  }

  ngOnInit(): void {
    const user = this.authService.getUser();
    const codRol = user?.codRol ?? 0;
    const codUsuario = user?.idUsuario ?? 0;

    this.navigation = this.filterNavigationByRole(NavigationItems, codRol);
    console.log('Rol actual:', codRol);
    console.log('user actual:', user);
    console.log('Menú filtrado final:', this.navigation);
  }

  private filterNavigationByRole(items: NavigationItem[], codRol: number, parentRoles?: number[]): NavigationItem[] {
    return items
      .filter(item => {
        const effectiveRoles = item.roles ?? parentRoles;
        return Array.isArray(effectiveRoles) && effectiveRoles.includes(codRol);
      })
      .map(item => ({
        ...item,
        children: item.children
          ? this.filterNavigationByRole(item.children, codRol, item.roles ?? parentRoles)
          : undefined
      }));
  }

  navMobCollapse() {
    if (this.windowWidth < 992) {
      this.NavMobCollapse.emit();
    }
  }
}
