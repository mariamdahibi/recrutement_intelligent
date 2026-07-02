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
  ActivityLog,
  ApiService,
  Application,
  Job,
  User
} from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss']
})
export class AdminDashboard implements OnInit {

  loading = true;
  error = '';

  users: User[] = [];
  jobs: Job[] = [];
  applications: Application[] = [];
  logs: ActivityLog[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      users: this.api.getUsers().pipe(catchError(() => of([]))),
      jobs: this.api.getJobs().pipe(catchError(() => of([]))),
      applications: this.api.getApplications().pipe(catchError(() => of([]))),
      logs: this.api.getActivityLogs().pipe(catchError(() => of([])))
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
        this.logs = data.logs;
      },
      error: () => {
        this.error = 'Erreur lors du chargement du dashboard admin.';
      }
    });
  }

  normalizeRole(role?: string): string {
    return role === 'CANDIDATE' ? 'USER' : role || 'USER';
  }

  getAdminCount(): number {
    return this.users.filter(user =>
      this.normalizeRole(user.role?.toString()) === 'ADMIN'
    ).length;
  }

  getRecruiterCount(): number {
    return this.users.filter(user =>
      this.normalizeRole(user.role?.toString()) === 'RECRUITER'
    ).length;
  }

  getCandidateCount(): number {
    return this.users.filter(user =>
      this.normalizeRole(user.role?.toString()) === 'USER'
    ).length;
  }

  getStatusCount(status: string): number {
    return this.applications.filter(application =>
      application.status?.toUpperCase() === status
    ).length;
  }

  getAcceptanceRate(): number {
    if (this.applications.length === 0) {
      return 0;
    }

    return Math.round(
      (this.getStatusCount('ACCEPTED') / this.applications.length) * 100
    );
  }

  getBarWidth(value: number, total: number): number {
    if (total === 0) {
      return 0;
    }

    return Math.round((value / total) * 100);
  }

  getRecentLogs(): ActivityLog[] {
    return [...this.logs]
      .sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }

  getLogIcon(type: string): string {
    if (type === 'USER') {
      return '👤';
    }

    if (type === 'JOB') {
      return '💼';
    }

    if (type === 'APPLICATION') {
      return '📨';
    }

    return '🛡️';
  }
}