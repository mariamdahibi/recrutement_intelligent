import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  catchError,
  finalize,
  of
} from 'rxjs';

import {
  ApiService,
  User,
  UserRole
} from '../../../core/services/api.service';

import { SearchService } from '../../../core/services/search.service';
import { ToastService } from '../../../core/services/toast.service';

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

  globalSearch = '';
  roleFilter = 'ALL';

  page = 1;
  pageSize = 8;

  showAddModal = false;
  showDeleteModal = false;

  selectedUser: User | null = null;
  currentUser: User | null = null;

  newUser: Partial<User> = {
    name: '',
    email: '',
    password: '1234',
    role: 'USER'
  };

  constructor(
    private api: ApiService,
    private searchService: SearchService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.api.getCurrentUser();
    this.loadUsers();

    this.searchService.search$.subscribe(value => {
      this.globalSearch = value;
      this.page = 1;
      this.cdr.detectChanges();
    });
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.api.getUsers().pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement des utilisateurs.';
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: data => {
        this.users = data;
      }
    });
  }

  get filteredUsers(): User[] {
    let result = this.users;

    if (this.roleFilter !== 'ALL') {
      result = result.filter(user =>
        this.normalizeRole(user.role) === this.roleFilter
      );
    }

    if (this.globalSearch) {
      result = result.filter(user =>
        user.name?.toLowerCase().includes(this.globalSearch) ||
        user.email?.toLowerCase().includes(this.globalSearch) ||
        user.role?.toString().toLowerCase().includes(this.globalSearch)
      );
    }

    return result;
  }

  get paginatedUsers(): User[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize) || 1;
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  createUser(): void {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.role) {
      this.toast.show(
        'Champs obligatoires',
        'Veuillez remplir le nom, email et rôle.',
        'warning'
      );
      return;
    }

    this.api.createUser(this.newUser).subscribe({
      next: createdUser => {
        this.users = [...this.users, createdUser];

        this.logAdminAction(
          'Création utilisateur',
          'USER',
          createdUser.email
        );

        this.toast.show(
          'Utilisateur créé',
          'Le nouvel utilisateur a été ajouté avec succès.',
          'success'
        );

        this.closeAddModal();
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible de créer l’utilisateur.',
          'error'
        );
      }
    });
  }

  saveRole(user: User): void {
    if (this.currentUser?.id === user.id) {
      this.toast.show(
        'Action interdite',
        'Vous ne pouvez pas modifier votre propre rôle.',
        'warning'
      );
      return;
    }

    this.api.updateUser(user).subscribe({
      next: updatedUser => {
        this.users = this.users.map(item =>
          item.id === updatedUser.id ? updatedUser : item
        );

        this.logAdminAction(
          'Modification rôle utilisateur',
          'USER',
          `${updatedUser.email} → ${updatedUser.role}`
        );

        this.toast.show(
          'Rôle mis à jour',
          'Le rôle utilisateur a été modifié.',
          'success'
        );

        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible de modifier le rôle.',
          'error'
        );
      }
    });
  }

  askDelete(user: User): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.selectedUser = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.selectedUser) {
      return;
    }

    if (this.currentUser?.id === this.selectedUser.id) {
      this.toast.show(
        'Action interdite',
        'Vous ne pouvez pas supprimer votre propre compte.',
        'warning'
      );
      this.cancelDelete();
      return;
    }

    const userId = this.selectedUser.id;
    const target = this.selectedUser.email;

    this.api.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== userId);

        this.logAdminAction(
          'Suppression utilisateur',
          'USER',
          target
        );

        this.toast.show(
          'Utilisateur supprimé',
          'Le compte utilisateur a été supprimé.',
          'success'
        );

        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible de supprimer l’utilisateur.',
          'error'
        );
      }
    });
  }

  logAdminAction(
    action: string,
    type: string,
    target: string
  ): void {
    this.api.createActivityLog({
      action,
      type,
      target,
      actor: this.currentUser?.email || 'Admin',
      role: this.currentUser?.role?.toString() || 'ADMIN'
    }).subscribe({
      error: () => {
        console.warn('Log admin non enregistré.');
      }
    });
  }

  resetForm(): void {
    this.newUser = {
      name: '',
      email: '',
      password: '1234',
      role: 'USER'
    };
  }

  normalizeRole(role: UserRole | string | undefined): string {
    if (role === 'CANDIDATE') {
      return 'USER';
    }

    return role?.toString() || 'USER';
  }

  getRoleLabel(role: UserRole | string | undefined): string {
    const value = this.normalizeRole(role);

    if (value === 'ADMIN') {
      return 'Admin';
    }

    if (value === 'RECRUITER') {
      return 'Recruteur';
    }

    return 'Utilisateur';
  }

  getRoleClass(role: UserRole | string | undefined): string {
    const value = this.normalizeRole(role);

    if (value === 'ADMIN') {
      return 'admin';
    }

    if (value === 'RECRUITER') {
      return 'recruiter';
    }

    return 'user';
  }

  getInitial(user: User): string {
    return user.name?.charAt(0)?.toUpperCase() || 'U';
  }

  getAdminCount(): number {
    return this.users.filter(user =>
      this.normalizeRole(user.role) === 'ADMIN'
    ).length;
  }

  getRecruiterCount(): number {
    return this.users.filter(user =>
      this.normalizeRole(user.role) === 'RECRUITER'
    ).length;
  }

  getUserCount(): number {
    return this.users.filter(user =>
      this.normalizeRole(user.role) === 'USER'
    ).length;
  }
}