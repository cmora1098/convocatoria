import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { Location, LocationStrategy } from '@angular/common';
import { NavigationItem } from '../navigation';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavGroupComponent } from './nav-group/nav-group.component';

@Component({
  selector: 'app-nav-content',
  standalone: true,
  imports: [SharedModule, NavGroupComponent],
  templateUrl: './nav-content.component.html',
  styleUrls: ['./nav-content.component.scss']
})
export class NavContentComponent implements OnInit {
  private location = inject(Location);
  private locationStrategy = inject(LocationStrategy);

  // version
  title = 'Demo application for version numbering';

  // public props
  @Input() item!: NavigationItem;             // 👈 Recibir item desde NavigationComponent
  @Output() NavMobCollapse = new EventEmitter<void>();

  windowWidth: number;

  constructor() {
    this.windowWidth = window.innerWidth;
  }

  ngOnInit() {
    if (this.windowWidth < 992) {
      setTimeout(() => {
        document.querySelector('.pcoded-navbar')?.classList.add('menupos-static');
        (document.querySelector('#nav-ps-gradient-able') as HTMLElement).style.height = '100%';
      }, 500);
    }
  }

  // Navegación activa al cargar
  fireLeave() {
    const sections = document.querySelectorAll('.pcoded-hasmenu');
    sections.forEach(sec => {
      sec.classList.remove('active');
      sec.classList.remove('pcoded-trigger');
    });

    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = `a.nav-link[href='${current_url}']`;
    const ele = document.querySelector(link);
    if (ele) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('pcoded-hasmenu')) parent.classList.add('active');
      else if (up_parent?.classList.contains('pcoded-hasmenu')) up_parent.classList.add('active');
      else if (last_parent?.classList.contains('pcoded-hasmenu')) last_parent.classList.add('active');
    }
  }

  // Colapsar menú mobile
  navMob() {
    if (this.windowWidth < 992 && document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
      this.NavMobCollapse.emit();
    }
  }

  // Activar trigger de menú al hacer click fuera
  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) current_url = baseHref + this.location.path();
    const link = `a.nav-link[href='${current_url}']`;
    const ele = document.querySelector(link);
    if (ele) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('pcoded-hasmenu')) {
        parent.classList.add('pcoded-trigger', 'active');
      } else if (up_parent?.classList.contains('pcoded-hasmenu')) {
        up_parent.classList.add('pcoded-trigger', 'active');
      } else if (last_parent?.classList.contains('pcoded-hasmenu')) {
        last_parent.classList.add('pcoded-trigger', 'active');
      }
    }
  }
}
