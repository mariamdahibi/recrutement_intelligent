import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ApiService,
  UserRole,
  User
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
    private router: Router
  ) {}

  login(): void {

    this.error = '';

    const emailValue = this.email.trim();
    const passwordValue = this.password.trim();

    if (!emailValue || !passwordValue || !this.role) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.loading = true;

    this.api.login(
      emailValue,
      passwordValue,
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

        /*
          Redirection unique vers dashboard.
          Le dashboard va afficher une interface différente selon le rôle :
          ADMIN      -> Dashboard Admin
          RECRUITER  -> Dashboard Recruteur
          USER       -> Dashboard Candidat
        */
        this.router.navigate(['/app/dashboard']);

      },

      error: () => {

        this.loading = false;
        this.error = 'Erreur de connexion au serveur.';

      }

    });

  }

}