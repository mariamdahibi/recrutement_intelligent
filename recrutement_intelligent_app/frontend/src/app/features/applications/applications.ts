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
  forkJoin,
  of
} from 'rxjs';

import {
  ApiService,
  Application,
  ApplicationStatus
} from '../../core/services/api.service';

import { SearchService } from '../../core/services/search.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './applications.html',
  styleUrls: ['./applications.scss']
})
export class Applications implements OnInit {

  applications: Application[] = [];

  loading = true;
  error = '';

  page = 1;
  pageSize = 6;

  statusFilter = 'ALL';
  jobFilter = 'ALL';
  minScoreFilter = 0;
  sortOption = 'scoreDesc';

  globalSearch = '';

  selectedIds = new Set<number | string>();

  constructor(
    private api: ApiService,
    private searchService: SearchService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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

    this.api.getApplications().pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement des candidatures.';
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: data => {
        this.applications = data;
      }
    });
  }

  get filteredApplications(): Application[] {
    let result = [...this.applications];

    if (this.statusFilter !== 'ALL') {
      result = result.filter(application =>
        application.status?.toUpperCase() === this.statusFilter
      );
    }

    if (this.jobFilter !== 'ALL') {
      result = result.filter(application =>
        this.getJobTitle(application) === this.jobFilter
      );
    }

    if (Number(this.minScoreFilter) > 0) {
      result = result.filter(application =>
        this.getScore(application) >= Number(this.minScoreFilter)
      );
    }

    if (this.globalSearch) {
      result = result.filter(application =>
        this.getCandidateName(application).toLowerCase().includes(this.globalSearch) ||
        this.getCandidateEmail(application).toLowerCase().includes(this.globalSearch) ||
        this.getJobTitle(application).toLowerCase().includes(this.globalSearch) ||
        this.getJobCompany(application).toLowerCase().includes(this.globalSearch) ||
        this.getStatusLabel(application.status).toLowerCase().includes(this.globalSearch)
      );
    }

    return this.sortApplications(result);
  }

  sortApplications(applications: Application[]): Application[] {
    return [...applications].sort((a, b) => {
      if (this.sortOption === 'scoreAsc') {
        return this.getScore(a) - this.getScore(b);
      }

      if (this.sortOption === 'recent') {
        return new Date(b.createdAt || '').getTime() -
          new Date(a.createdAt || '').getTime();
      }

      if (this.sortOption === 'status') {
        return this.getStatusLabel(a.status)
          .localeCompare(this.getStatusLabel(b.status));
      }

      return this.getScore(b) - this.getScore(a);
    });
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

  getAvailableJobs(): string[] {
    return Array.from(
      new Set(
        this.applications
          .map(application => this.getJobTitle(application))
          .filter(job => job !== 'Poste non disponible')
      )
    ).sort();
  }

  updateStatus(
    application: Application,
    status: ApplicationStatus
  ): void {
    const updatedApplication: Application = {
      ...application,
      status,
      updatedAt: new Date().toISOString()
    };

    this.api.updateApplication(updatedApplication).subscribe({
      next: result => {
        this.applications = this.applications.map(app =>
          app.id === result.id ? result : app
        );

        this.toast.show(
          'Statut mis à jour',
          `La candidature est maintenant ${this.getStatusLabel(status)}.`,
          'success'
        );

        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible de modifier le statut.',
          'error'
        );
      }
    });
  }

  saveNote(application: Application): void {
    const updatedApplication: Application = {
      ...application,
      updatedAt: new Date().toISOString()
    };

    this.api.updateApplication(updatedApplication).subscribe({
      next: result => {
        this.applications = this.applications.map(app =>
          app.id === result.id ? result : app
        );

        this.toast.show(
          'Note enregistrée',
          'La note interne a été sauvegardée.',
          'success'
        );

        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible d’enregistrer la note.',
          'error'
        );
      }
    });
  }

  toggleSelection(application: Application): void {
    if (this.selectedIds.has(application.id)) {
      this.selectedIds.delete(application.id);
    } else {
      this.selectedIds.add(application.id);
    }
  }

  isSelected(application: Application): boolean {
    return this.selectedIds.has(application.id);
  }

  areAllPageSelected(): boolean {
    if (this.paginatedApplications.length === 0) {
      return false;
    }

    return this.paginatedApplications.every(application =>
      this.selectedIds.has(application.id)
    );
  }

  toggleSelectAllCurrentPage(): void {
    if (this.areAllPageSelected()) {
      this.paginatedApplications.forEach(application =>
        this.selectedIds.delete(application.id)
      );
    } else {
      this.paginatedApplications.forEach(application =>
        this.selectedIds.add(application.id)
      );
    }
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  bulkUpdateStatus(status: ApplicationStatus): void {
    const selectedApplications = this.applications.filter(application =>
      this.selectedIds.has(application.id)
    );

    if (selectedApplications.length === 0) {
      this.toast.show(
        'Aucune sélection',
        'Veuillez sélectionner au moins une candidature.',
        'warning'
      );
      return;
    }

    const requests = selectedApplications.map(application =>
      this.api.updateApplication({
        ...application,
        status,
        updatedAt: new Date().toISOString()
      })
    );

    forkJoin(requests).subscribe({
      next: updatedApplications => {
        this.applications = this.applications.map(application => {
          const updated = updatedApplications.find(item =>
            item.id === application.id
          );

          return updated || application;
        });

        this.toast.show(
          'Action en masse effectuée',
          `${selectedApplications.length} candidature(s) mise(s) à jour.`,
          'success'
        );

        this.clearSelection();
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible d’effectuer l’action en masse.',
          'error'
        );
      }
    });
  }

  getCandidateName(application: Application): string {
    return application.user?.name
      || application.candidate
      || 'Candidat';
  }

  getCandidateEmail(application: Application): string {
    return application.user?.email
      || 'Email non disponible';
  }

  getCandidateInitial(application: Application): string {
    return this.getCandidateName(application)
      .charAt(0)
      .toUpperCase();
  }

  getJobTitle(application: Application): string {
    if (typeof application.job === 'string') {
      return application.job;
    }

    return application.job?.title || 'Poste non disponible';
  }

  getJobCompany(application: Application): string {
    if (typeof application.job === 'object') {
      return application.job?.company || 'Entreprise non renseignée';
    }

    return 'Entreprise non renseignée';
  }

  getJobDescription(application: Application): string {
    if (typeof application.job === 'object') {
      return application.job?.description || 'Aucune description disponible.';
    }

    return 'Aucune description disponible.';
  }

  getJobLocation(application: Application): string {
    if (typeof application.job === 'object') {
      return application.job?.location || 'Localisation non renseignée';
    }

    return 'Localisation non renseignée';
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

    if (value === 'SHORTLISTED') {
      return 'shortlisted';
    }

    if (value === 'INTERVIEW') {
      return 'interview';
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

    if (value === 'SHORTLISTED') {
      return 'Shortlist';
    }

    if (value === 'INTERVIEW') {
      return 'Entretien';
    }

    return 'En attente';
  }

  getScoreClass(score: number): string {
    if (score >= 85) {
      return 'excellent';
    }

    if (score >= 70) {
      return 'good';
    }

    if (score >= 50) {
      return 'medium';
    }

    return 'weak';
  }

  getProfileLevel(score: number): string {
    if (score >= 85) {
      return 'Excellent profil';
    }

    if (score >= 70) {
      return 'Bon profil';
    }

    if (score >= 50) {
      return 'Profil moyen';
    }

    return 'Profil faible';
  }

  getRecommendationText(score: number): string {
    if (score >= 85) {
      return 'Profil prioritaire à contacter rapidement.';
    }

    if (score >= 70) {
      return 'Profil intéressant à analyser.';
    }

    if (score >= 50) {
      return 'Profil possible, vérification nécessaire.';
    }

    return 'Profil moins compatible avec cette offre.';
  }

  getTotalCount(): number {
    return this.applications.length;
  }

  getPendingCount(): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === 'PENDING'
    ).length;
  }

  getShortlistedCount(): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === 'SHORTLISTED'
    ).length;
  }

  getInterviewCount(): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === 'INTERVIEW'
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

  exportCSV(): void {
    const rows = [
      [
        'Candidat',
        'Email',
        'Poste',
        'Entreprise',
        'Statut',
        'Score',
        'Note recruteur'
      ],
      ...this.filteredApplications.map(application => [
        this.getCandidateName(application),
        this.getCandidateEmail(application),
        this.getJobTitle(application),
        this.getJobCompany(application),
        this.getStatusLabel(application.status),
        this.getScore(application).toString(),
        application.recruiterNote || ''
      ])
    ];

    const csvContent = rows
      .map(row => row.map(value => `"${value}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'applications_recruteur.csv';
    link.click();

    URL.revokeObjectURL(url);

    this.toast.show(
      'Export terminé',
      'Le fichier CSV a été généré.',
      'success'
    );
  }
}