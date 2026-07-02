import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterOutlet
} from '@angular/router';

import { filter, Subscription } from 'rxjs';

import { Sidebar } from '../../core/sidebar/sidebar';
import { Header } from '../../core/header/header';
import { ToastComponent } from '../../core/toast/toast';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    Sidebar,
    Header,
    ToastComponent
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss']
})
export class MainLayout implements OnInit, OnDestroy {

  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }
}