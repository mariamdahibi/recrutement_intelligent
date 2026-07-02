import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  catchError,
  finalize,
  forkJoin,
  of
} from 'rxjs';

import {
  ApiService,
  Application,
  Job,
  Recommendation,
  User
} from '../../core/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {

  loading = true;
  error = '';

  currentUser: User | null = null;

  applications: Application[] = [];
  jobs: Job[] = [];
  recommendations: Recommendation[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    this.currentUser = this.api.getCurrentUser();

    if (!this.currentUser) {
      this.error = 'Utilisateur non connecté.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    forkJoin({
      applications: this.api.getApplications().pipe(
        catchError(() => of([]))
      ),
      jobs: this.api.getJobs().pipe(
        catchError(() => of([]))
      ),
      recommendations: this.api.getRecommendations().pipe(
        catchError(() => of([]))
      )
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: data => {
        this.applications = data.applications;
        this.jobs = data.jobs;
        this.recommendations = data.recommendations;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du profil.';
      }
    });
  }

  getInitial(): string {
    return this.currentUser?.name?.charAt(0)?.toUpperCase() || 'U';
  }

  getRoleLabel(): string {
    const role = this.currentUser?.role;

    if (role === 'ADMIN') {
      return 'Administrateur';
    }

    if (role === 'RECRUITER') {
      return 'Recruteur';
    }

    return 'Candidat';
  }

  isCandidate(): boolean {
    const role = this.currentUser?.role;
    return role === 'USER' || role === 'CANDIDATE';
  }

  isRecruiter(): boolean {
    return this.currentUser?.role === 'RECRUITER';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  getUserApplications(): Application[] {
    if (!this.currentUser) {
      return [];
    }

    const currentEmail = this.currentUser.email?.toLowerCase();
    const currentName = this.currentUser.name?.toLowerCase();

    return this.applications.filter(application => {
      const appEmail = application.user?.email?.toLowerCase();
      const appName = application.user?.name?.toLowerCase();
      const candidate = application.candidate?.toLowerCase();

      return (
        application.user?.id === this.currentUser?.id ||
        appEmail === currentEmail ||
        appName === currentName ||
        candidate === currentName ||
        candidate === currentEmail
      );
    });
  }

  getApplicationsCount(): number {
    if (this.isCandidate()) {
      return this.getUserApplications().length;
    }

    return this.applications.length;
  }

  getPendingCount(): number {
    const list = this.isCandidate()
      ? this.getUserApplications()
      : this.applications;

    return list.filter(app =>
      app.status?.toUpperCase() === 'PENDING'
    ).length;
  }

  getAcceptedCount(): number {
    const list = this.isCandidate()
      ? this.getUserApplications()
      : this.applications;

    return list.filter(app =>
      app.status?.toUpperCase() === 'ACCEPTED'
    ).length;
  }

  getRejectedCount(): number {
    const list = this.isCandidate()
      ? this.getUserApplications()
      : this.applications;

    return list.filter(app =>
      app.status?.toUpperCase() === 'REJECTED'
    ).length;
  }

  getSkills(): string[] {
    const skills = this.currentUser?.skills;

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