import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IdleTimeoutService {
  //   private readonly INACTIVITY_TIME = 5 * 1000; // ⏱ 5 segundos
  private readonly INACTIVITY_TIME = 10 * 60 * 1000; // ⏱ 10 minutos

  private timeoutId: any;
  private activitySubscription?: Subscription;

  constructor(
    private router: Router,
    private ngZone: NgZone
  ) {}

  startWatching(): void {
    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keydown'),
      fromEvent(document, 'scroll'),
      fromEvent(document, 'touchstart')
    );

    this.activitySubscription = activityEvents$.subscribe(() => {
      this.resetTimer();
    });

    this.resetTimer();
  }

  private resetTimer(): void {
    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIME);
  }

  private logout(): void {
    // ❌ NO hacer nada si ya está en login
    if (this.router.url.includes('/login')) {
      return;
    }

    localStorage.clear();
    sessionStorage.clear();

    this.ngZone.run(() => {
      // ✅ ruta correcta con APP_BASE_HREF
      this.router.navigateByUrl('/login');
    });
  }
}
