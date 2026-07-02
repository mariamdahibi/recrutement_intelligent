import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  catchError,
  finalize,
  forkJoin,
  of
} from 'rxjs';

import {
  ApiService,
  Job,
  Application,
  User
} from '../../core/services/api.service';

import { SearchService } from '../../core/services/search.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './jobs.html',
  styleUrls: ['./jobs.scss']
})
export class Jobs implements OnInit {

  jobs: Job[] = [];
  applications: Application[] = [];

  loading = true;
  error = '';

  page = 1;
  pageSize = 6;

  showAddModal = false;
  showDeleteModal = false;
  selectedJob: Job | null = null;

  globalSearch = '';
  currentUser: User | null = null;
  currentRole = '';

  newJob: Partial<Job> = {
    title: '',
    company: '',
    description: '',
    location: '',
    skills: ''
  };

  constructor(
    private api: ApiService,
    private searchService: SearchService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPageData();

    this.searchService.search$.subscribe(value => {
      this.globalSearch = value;
      this.page = 1;
      this.cdr.detectChanges();
    });
  }

  loadCurrentUser(): void {
    this.currentUser = this.api.getCurrentUser();
    this.currentRole = this.currentUser?.role?.toString() || '';
  }

  loadPageData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      jobs: this.api.getJobs().pipe(catchError(() => of([]))),
      applications: this.api.getApplications().pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: data => {
        this.jobs = data.jobs;
        this.applications = data.applications;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des offres.';
      }
    });
  }

  canManageJobs(): boolean {
    return this.currentRole === 'ADMIN' || this.currentRole === 'RECRUITER';
  }

  isCandidate(): boolean {
    return this.currentRole === 'USER' || this.currentRole === 'CANDIDATE';
  }

  get filteredJobs(): Job[] {
    const value = this.globalSearch.toLowerCase();

    if (!value) {
      return this.jobs;
    }

    return this.jobs.filter(job =>
      job.title?.toLowerCase().includes(value) ||
      job.company?.toLowerCase().includes(value) ||
      job.location?.toLowerCase().includes(value) ||
      String(job.skills || '').toLowerCase().includes(value)
    );
  }

  get paginatedJobs(): Job[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredJobs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredJobs.length / this.pageSize) || 1;
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
    if (!this.canManageJobs()) {
      return;
    }

    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addJob(): void {
    if (!this.canManageJobs()) {
      this.toast.show(
        'Accès refusé',
        'Seuls les recruteurs et les administrateurs peuvent publier une offre.',
        'warning'
      );
      return;
    }

    if (!this.newJob.title || !this.newJob.description) {
      this.toast.show(
        'Champs obligatoires',
        'Veuillez saisir au minimum le titre et la description.',
        'warning'
      );
      return;
    }

    this.api.createJob(this.newJob).subscribe({
      next: job => {
        this.jobs = [...this.jobs, job];

        this.toast.show(
          'Offre ajoutée',
          'L’offre a été publiée avec succès.',
          'success'
        );

        this.closeAddModal();

        this.newJob = {
          title: '',
          company: '',
          description: '',
          location: '',
          skills: ''
        };

        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible d’ajouter l’offre.',
          'error'
        );
      }
    });
  }

  askDelete(job: Job): void {
    if (!this.canManageJobs()) {
      return;
    }

    this.selectedJob = job;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.selectedJob = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.selectedJob || !this.canManageJobs()) {
      return;
    }

    const jobId = this.selectedJob.id;

    this.api.deleteJob(jobId).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(job => job.id !== jobId);

        this.toast.show(
          'Offre supprimée',
          'L’offre a été supprimée avec succès.',
          'success'
        );

        this.cancelDelete();
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Suppression impossible.',
          'error'
        );
      }
    });
  }

  hasAlreadyApplied(job: Job): boolean {
    if (!this.currentUser) {
      return false;
    }

    return this.applications.some(application => {
      const sameUser =
        application.user?.id === this.currentUser?.id ||
        application.user?.email === this.currentUser?.email;

      const sameJob =
        typeof application.job === 'object' &&
        application.job?.id === job.id;

      return sameUser && sameJob;
    });
  }

  applyToJob(job: Job): void {
    if (!this.currentUser) {
      this.toast.show(
        'Connexion requise',
        'Veuillez vous connecter avant de postuler.',
        'warning'
      );
      return;
    }

    if (!this.isCandidate()) {
      this.toast.show(
        'Action non autorisée',
        'Seuls les candidats peuvent postuler à une offre.',
        'warning'
      );
      return;
    }

    if (this.hasAlreadyApplied(job)) {
      this.toast.show(
        'Déjà postulé',
        'Vous avez déjà postulé à cette offre.',
        'info'
      );
      return;
    }

    const application: Partial<Application> = {
      status: 'PENDING',
      job,
      user: {
        id: this.currentUser.id,
        name: this.currentUser.name,
        email: this.currentUser.email,
        role: this.currentUser.role
      },
      score: this.calculateScore(job),
      createdAt: new Date().toISOString()
    };

    this.api.createApplication(application).subscribe({
      next: createdApplication => {
        this.applications = [...this.applications, createdApplication];

        this.toast.show(
          'Candidature envoyée',
          `Votre candidature pour "${job.title}" a été enregistrée.`,
          'success'
        );

        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible d’envoyer la candidature.',
          'error'
        );
      }
    });
  }

  calculateScore(job: Job): number {
    const skillsCount = this.getSkills(job).length;
    return Math.min(95, 60 + skillsCount * 7);
  }

  getSkills(job: Job): string[] {
    const skills = job.skills;

    if (!skills) {
      return [];
    }

    if (Array.isArray(skills)) {
      return skills;
    }

    return skills
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  }
}