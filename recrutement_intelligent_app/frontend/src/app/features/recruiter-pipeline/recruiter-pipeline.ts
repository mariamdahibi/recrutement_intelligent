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
  ApplicationStatus
} from '../../core/services/api.service';

import { SearchService } from '../../core/services/search.service';
import { ToastService } from '../../core/services/toast.service';

interface PipelineColumn {
  status: ApplicationStatus;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-recruiter-pipeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './recruiter-pipeline.html',
  styleUrls: ['./recruiter-pipeline.scss']
})
export class RecruiterPipeline implements OnInit {

  loading = true;
  error = '';

  applications: Application[] = [];

  globalSearch = '';
  jobFilter = 'ALL';
  minScoreFilter = 0;

  columns: PipelineColumn[] = [
    {
      status: 'PENDING',
      label: 'En attente',
      icon: '⏳',
      description: 'Candidatures à analyser'
    },
    {
      status: 'SHORTLISTED',
      label: 'Shortlist',
      icon: '⭐',
      description: 'Profils intéressants'
    },
    {
      status: 'INTERVIEW',
      label: 'Entretien',
      icon: '📅',
      description: 'Candidats à rencontrer'
    },
    {
      status: 'ACCEPTED',
      label: 'Acceptés',
      icon: '✅',
      description: 'Candidatures validées'
    },
    {
      status: 'REJECTED',
      label: 'Refusés',
      icon: '❌',
      description: 'Candidatures refusées'
    }
  ];

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
      this.cdr.detectChanges();
    });
  }

  loadApplications(): void {
    this.loading = true;
    this.error = '';

    this.api.getApplications().pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement du pipeline.';
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
        this.getJobCompany(application).toLowerCase().includes(this.globalSearch)
      );
    }

    return result.sort((a, b) =>
      this.getScore(b) - this.getScore(a)
    );
  }

  getColumnApplications(status: ApplicationStatus): Application[] {
    return this.filteredApplications.filter(application =>
      application.status?.toUpperCase() === status
    );
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

  moveApplication(
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
        this.applications = this.applications.map(item =>
          item.id === result.id ? result : item
        );

        this.toast.show(
          'Pipeline mis à jour',
          `${this.getCandidateName(application)} est maintenant dans "${this.getStatusLabel(status)}".`,
          'success'
        );

        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible de déplacer cette candidature.',
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
        this.applications = this.applications.map(item =>
          item.id === result.id ? result : item
        );

        this.toast.show(
          'Note sauvegardée',
          'La note recruteur a été enregistrée.',
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

  getJobLocation(application: Application): string {
    if (typeof application.job === 'object') {
      return application.job?.location || 'Localisation non renseignée';
    }

    return 'Localisation non renseignée';
  }

  getScore(application: Application): number {
    return application.score || 0;
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

  getStatusLabel(status: string): string {
    const value = status?.toUpperCase();

    if (value === 'SHORTLISTED') {
      return 'Shortlist';
    }

    if (value === 'INTERVIEW') {
      return 'Entretien';
    }

    if (value === 'ACCEPTED') {
      return 'Accepté';
    }

    if (value === 'REJECTED') {
      return 'Refusé';
    }

    return 'En attente';
  }

  getTotalCount(): number {
    return this.applications.length;
  }

  getHighScoreCount(): number {
    return this.applications.filter(application =>
      this.getScore(application) >= 85
    ).length;
  }

  getPendingCount(): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === 'PENDING'
    ).length;
  }

  getInterviewCount(): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === 'INTERVIEW'
    ).length;
  }
}