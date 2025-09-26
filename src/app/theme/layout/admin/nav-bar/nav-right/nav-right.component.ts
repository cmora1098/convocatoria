// // angular import
// import { Component } from '@angular/core';
// import { animate, style, transition, trigger } from '@angular/animations';

// // bootstrap import
// import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// // project import
// import { SharedModule } from 'src/app/theme/shared/shared.module';
// import { ChatUserListComponent } from './chat-user-list/chat-user-list.component';
// import { ChatMsgComponent } from './chat-msg/chat-msg.component';

// import { AuthService } from '../../../../../services/auth.service'; // importa tu nuevo servicio

// @Component({
//   selector: 'app-nav-right',
//   imports: [SharedModule, ChatUserListComponent, ChatMsgComponent],
//   templateUrl: './nav-right.component.html',
//   styleUrls: ['./nav-right.component.scss'],
//   providers: [NgbDropdownConfig],
//   animations: [
//     trigger('slideInOutLeft', [
//       transition(':enter', [style({ transform: 'translateX(100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
//       transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(100%)' }))])
//     ]),
//     trigger('slideInOutRight', [
//       transition(':enter', [style({ transform: 'translateX(-100%)' }), animate('300ms ease-in', style({ transform: 'translateX(0%)' }))]),
//       transition(':leave', [animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))])
//     ])
//   ]
// })
// export class NavRightComponent {
//   // public props
//   visibleUserList: boolean;
//   chatMessage: boolean;
//   friendId!: number;

//   // constructor
//   constructor(private authService: AuthService) {
//     this.visibleUserList = false;
//     this.chatMessage = false;
//   }

//   ngOnInit() {
//     console.log('Usuario actual:', this.authService.getUser());
//   }


//   // public method
//   // eslint-disable-next-line
//   onChatToggle(friendID: any) {
//     this.friendId = friendID;
//     this.chatMessage = !this.chatMessage;
//   }
// }


import { Component } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ChatUserListComponent } from './chat-user-list/chat-user-list.component';
import { ChatMsgComponent } from './chat-msg/chat-msg.component';


import { AuthService } from '../../../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [SharedModule, ChatUserListComponent, ChatMsgComponent],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})

export class NavRightComponent {
  visibleUserList = false;
  chatMessage = false;
  friendId!: number;

  user: any = null;
  roleName: string = '';

  constructor(private authService: AuthService, private router: Router) {
    this.visibleUserList = false;
    this.chatMessage = false;
  }

  ngOnInit() {
    this.user = this.authService.getUser();
    console.log('Usuario actual en NavRight:', this.user);

    if (this.user) {
      this.roleName = this.getRoleName(this.user.codRol);
    }
  }

  onChatToggle(friendID: any) {
    this.friendId = friendID;
    this.chatMessage = !this.chatMessage;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']); // redirige a login

  }

  private getRoleName(codRol: number): string {
    switch (codRol) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Evaluador';
      case 3:
        return 'Postulante';
      default:
        return 'Usuario';
    }
  }
}
