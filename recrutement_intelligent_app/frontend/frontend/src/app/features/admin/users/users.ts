import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ApiService,
  User
} from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss']
})
export class AdminUsers implements OnInit {

  users: User[] = [];

  loading = true;
  error = '';

  newUser: Partial<User> = {
    name: '',
    email: '',
    password: '1234',
    role: 'CANDIDATE'
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {

    this.loading = true;
    this.error = '';

    this.api.getUsers().subscribe({

      next: (data: User[]) => {

        this.users = data;
        this.loading = false;

      },

      error: () => {

        this.error = 'Erreur lors du chargement des utilisateurs.';
        this.loading = false;

      }

    });

  }

  addUser(): void {

    if (
      !this.newUser.name ||
      !this.newUser.email ||
      !this.newUser.password ||
      !this.newUser.role
    ) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }

    this.api.createUser(this.newUser).subscribe({

      next: (user: User) => {

        this.users.push(user);

        this.newUser = {
          name: '',
          email: '',
          password: '1234',
          role: 'CANDIDATE'
        };

        this.error = '';

      },

      error: () => {

        this.error = 'Erreur lors de la création de l’utilisateur.';

      }

    });

  }

  deleteUser(id: number | string): void {

    this.api.deleteUser(id).subscribe({

      next: () => {

        this.users = this.users.filter(user => user.id !== id);

      },

      error: () => {

        this.error = 'Erreur lors de la suppression de l’utilisateur.';

      }

    });

  }

  getRoleLabel(role: string | undefined): string {

    const value = role?.toUpperCase();

    if (value === 'ADMIN') {
      return 'Admin';
    }

    if (value === 'RECRUITER') {
      return 'Recruteur';
    }

    if (value === 'USER' || value === 'CANDIDATE') {
      return 'Candidat';
    }

    return 'Utilisateur';

  }

  getRoleClass(role: string | undefined): string {

    const value = role?.toUpperCase();

    if (value === 'ADMIN') {
      return 'admin';
    }

    if (value === 'RECRUITER') {
      return 'recruiter';
    }

    return 'candidate';

  }

}