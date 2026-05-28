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
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class RecruiterDashboard implements OnInit {

  loading = true;
  error = '';

  currentUser: User | null = null;

  users: User[] = [];
  jobs: Job[] = [];
  applications: Application[] = [];
  recommendations: Recommendation[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.api.getCurrentUser();
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      users: this.api.getUsers().pipe(catchError(() => of([]))),
      jobs: this.api.getJobs().pipe(catchError(() => of([]))),
      applications: this.api.getApplications().pipe(catchError(() => of([]))),
      recommendations: this.api.getRecommendations().pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: data => {
        this.users = data.users;
        this.jobs = data.jobs;
        this.applications = data.applications;
        this.recommendations = data.recommendations;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du dashboard.';
      }
    });
  }

  isCandidate(): boolean {
    const role = this.currentUser?.role;
    return role === 'USER' || role === 'CANDIDATE';
  }

  isRecruiter(): boolean {
    return this.currentUser?.role === 'RECRUITER';
  }

  getCandidateApplications(): Application[] {
    if (!this.currentUser) {
      return [];
    }

    const email = this.currentUser.email?.toLowerCase();
    const name = this.currentUser.name?.toLowerCase();

    return this.applications.filter(application => {
      const appEmail = application.user?.email?.toLowerCase();
      const appName = application.user?.name?.toLowerCase();
      const candidate = application.candidate?.toLowerCase();

      return (
        application.user?.id === this.currentUser?.id ||
        appEmail === email ||
        appName === name ||
        candidate === name ||
        candidate === email
      );
    });
  }

  getPendingCount(): number {
    return this.getCandidateApplications().filter(app =>
      app.status?.toUpperCase() === 'PENDING'
    ).length;
  }

  getAcceptedCount(): number {
    return this.getCandidateApplications().filter(app =>
      app.status?.toUpperCase() === 'ACCEPTED'
    ).length;
  }

  getRejectedCount(): number {
    return this.getCandidateApplications().filter(app =>
      app.status?.toUpperCase() === 'REJECTED'
    ).length;
  }

  getInterviewCount(): number {
    return this.getCandidateApplications().filter(app =>
      app.status?.toUpperCase() === 'INTERVIEW'
    ).length;
  }

  getAverageScore(): number {
    const list = this.getCandidateApplications();

    if (list.length === 0) {
      return 0;
    }

    const total = list.reduce(
      (sum, item) => sum + (item.score || 0),
      0
    );

    return Math.round(total / list.length);
  }

  getUserSkills(): string[] {
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

  getJobSkills(job: Job): string[] {
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

  calculateJobScore(job: Job): number {
    const userSkills = this.getUserSkills()
      .map(skill => skill.toLowerCase());

    const jobSkills = this.getJobSkills(job)
      .map(skill => skill.toLowerCase());

    if (jobSkills.length === 0) {
      return 50;
    }

    const matchedSkills = jobSkills.filter(skill =>
      userSkills.includes(skill)
    );

    return Math.round((matchedSkills.length / jobSkills.length) * 100);
  }

  getRecommendedJobs(): Job[] {
    return [...this.jobs]
      .sort((a, b) =>
        this.calculateJobScore(b) - this.calculateJobScore(a)
      )
      .slice(0, 3);
  }

  getRecentApplications(): Application[] {
    return this.getCandidateApplications().slice(0, 3);
  }

  getJobTitle(application: Application): string {
    if (typeof application.job === 'string') {
      return application.job;
    }

    return application.job?.title || 'Poste non disponible';
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
}