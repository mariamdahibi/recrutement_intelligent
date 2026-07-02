import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ApiService,
  User,
  UserRole
} from '../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  email = '';
  password = '';
  role: UserRole = 'RECRUITER';

  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  login(): void {
    this.error = '';

    if (!this.email.trim() || !this.password.trim() || !this.role) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;

    this.api.login(
      this.email.trim(),
      this.password.trim(),
      this.role
    ).subscribe({
      next: (user: User | null) => {
        this.loading = false;

        if (!user) {
          this.error = 'Email, mot de passe ou rôle incorrect.';
          return;
        }

        const connectedUser: User = {
          ...user
        };

        delete connectedUser.password;

        localStorage.setItem(
          'user',
          JSON.stringify(connectedUser)
        );

        const targetUrl =
          connectedUser.role === 'ADMIN'
            ? '/app/admin/dashboard'
            : '/app/dashboard';

        this.ngZone.run(() => {
          this.router.navigateByUrl(targetUrl, {
            replaceUrl: true
          });
        });
      },

      error: () => {
        this.loading = false;
        this.error = 'Erreur de connexion au serveur.';
      }
    });
  }
}