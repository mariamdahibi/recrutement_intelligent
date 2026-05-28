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
  Application,
  User
} from '../../core/services/api.service';

import { SearchService } from '../../core/services/search.service';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './my-applications.html',
  styleUrls: ['./my-applications.scss']
})
export class MyApplications implements OnInit {

  loading = true;
  error = '';

  currentUser: User | null = null;

  applications: Application[] = [];

  statusFilter = 'ALL';
  globalSearch = '';

  page = 1;
  pageSize = 6;

  constructor(
    private api: ApiService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.api.getCurrentUser();
    this.loadApplications();

    this.searchService.search$.subscribe(value => {
      this.globalSearch = value;
      this.page = 1;
      this.cdr.detectChanges();
    });
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';

    if (!this.currentUser) {
      this.error = 'Utilisateur non connecté.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.api.getApplications().pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement de vos candidatures.';
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: data => {
        this.applications = data.filter(application =>
          this.belongsToCurrentUser(application)
        );
      }
    });
  }

  belongsToCurrentUser(application: Application): boolean {
    if (!this.currentUser) {
      return false;
    }

    const currentEmail = this.currentUser.email?.toLowerCase();
    const currentName = this.currentUser.name?.toLowerCase();

    const appEmail = application.user?.email?.toLowerCase();
    const appName = application.user?.name?.toLowerCase();
    const candidate = application.candidate?.toLowerCase();

    return (
      application.user?.id === this.currentUser.id ||
      appEmail === currentEmail ||
      appName === currentName ||
      candidate === currentName ||
      candidate === currentEmail
    );
  }

  get filteredApplications(): Application[] {
    let result = this.applications;

    if (this.statusFilter !== 'ALL') {
      result = result.filter(application =>
        application.status?.toUpperCase() === this.statusFilter
      );
    }

    if (this.globalSearch) {
      result = result.filter(application =>
        this.getJobTitle(application).toLowerCase().includes(this.globalSearch) ||
        this.getCompany(application).toLowerCase().includes(this.globalSearch) ||
        this.getStatusLabel(application.status).toLowerCase().includes(this.globalSearch)
      );
    }

    return result;
  }

  get paginatedApplications(): Application[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredApplications.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredApplications.length / this.pageSize) || 1;
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

  getJobTitle(application: Application): string {
    if (typeof application.job === 'string') {
      return application.job;
    }

    return application.job?.title || 'Poste non disponible';
  }

  getCompany(application: Application): string {
    if (typeof application.job === 'object') {
      return application.job?.company || 'Entreprise non renseignée';
    }

    return 'Entreprise non renseignée';
  }

  getLocation(application: Application): string {
    if (typeof application.job === 'object') {
      return application.job?.location || 'Localisation non renseignée';
    }

    return 'Localisation non renseignée';
  }

  getDescription(application: Application): string {
    if (typeof application.job === 'object') {
      return application.job?.description || 'Aucune description disponible.';
    }

    return 'Aucune description disponible.';
  }

  getScore(application: Application): number {
    return application.score || 0;
  }

  getStatusClass(status: string): string {
    const value = status?.toUpperCase();

    if (value === 'ACCEPTED') {
      return 'accepted';
    }

    if (value === 'REJECTED') {
      return 'rejected';
    }

    return 'pending';
  }

  getStatusLabel(status: string): string {
    const value = status?.toUpperCase();

    if (value === 'ACCEPTED') {
      return 'Acceptée';
    }

    if (value === 'REJECTED') {
      return 'Refusée';
    }

    return 'En attente';
  }

  getPendingCount(): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === 'PENDING'
    ).length;
  }

  getAcceptedCount(): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === 'ACCEPTED'
    ).length;
  }

  getRejectedCount(): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === 'REJECTED'
    ).length;
  }
}