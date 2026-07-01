import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  catchError,
  map,
  of,
  timeout
} from 'rxjs';

export type UserRole =
  | 'ADMIN'
  | 'RECRUITER'
  | 'USER'
  | 'CANDIDATE';

export type ApplicationStatus =
  | 'PENDING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'REJECTED';

export interface User {
  id: number | string;
  name: string;
  email: string;
  password?: string;
  role: UserRole | string;
  skills?: string | string[];
}

export interface Job {
  id: number | string;
  title: string;
  description?: string;
  location?: string;
  company?: string;
  skills?: string | string[];
}

export interface Candidate {
  id: number | string;
  name: string;
  email?: string;
  skills?: string | string[];
  score?: number;
}

export interface Application {
  id: number | string;
  status: ApplicationStatus | string;
  job?: Job | string;
  user?: User;
  candidate?: string;
  score?: number;
  createdAt?: string;
  updatedAt?: string;
  recruiterNote?: string;
  interviewDate?: string;
  interviewMode?: string;
  interviewLink?: string;
}

export interface Recommendation {
  id: number | string;
  candidate?: string;
  job: string;
  match?: number;
  score?: number;
}

export interface ActivityLog {
  id?: number | string;
  action: string;
  type: string;
  actor?: string;
  role?: string;
  target?: string;
  createdAt: string;
}

export interface AiMatchRequest {
  candidate?: any;
  profile?: any;
  jobs?: Job[];
}

export interface AiMatchResponse {
  recommendations?: any[];
  matches?: any[];
  bestMatches?: any[];
  summary?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // Backend Spring Boot
  private backendUrl = 'http://20.19.209.121:8080/api';

  // Json-server temporaire pour les données qui ne sont pas encore dans le backend
  private mockUrl = 'http://localhost:3000';

  // Service IA FastAPI
  private aiUrl = 'http://20.19.209.121:8000';

  private requestTimeout = 8000;

  constructor(private http: HttpClient) {}

  // =====================================================
  // SESSION UTILISATEUR
  // =====================================================

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user');

    if (!userData) {
      return null;
    }

    try {
      return JSON.parse(userData) as User;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  getNormalizedRole(role?: UserRole | string): string {
    if (!role) {
      return '';
    }

    return role === 'CANDIDATE' ? 'USER' : role;
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  isAdmin(): boolean {
    return this.getNormalizedRole(this.getCurrentUser()?.role) === 'ADMIN';
  }

  isRecruiter(): boolean {
    return this.getNormalizedRole(this.getCurrentUser()?.role) === 'RECRUITER';
  }

  isCandidate(): boolean {
    return this.getNormalizedRole(this.getCurrentUser()?.role) === 'USER';
  }

  // =====================================================
  // USERS — BACKEND SPRING BOOT
  // =====================================================

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.backendUrl}/users`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Users API error:', error);
        return of([]);
      })
    );
  }

  getUserById(id: number | string): Observable<User> {
    return this.getUsers().pipe(
      map((users: User[]) => {
        const user = users.find(u => String(u.id) === String(id));
        return user as User;
      }),
      catchError(error => {
        console.error('User by id error:', error);
        return of(null as any);
      })
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.backendUrl}/users`, user).pipe(
      timeout(this.requestTimeout)
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(
      `${this.backendUrl}/users/${user.id}`,
      user
    ).pipe(
      timeout(this.requestTimeout)
    );
  }

  deleteUser(id: number | string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/users/${id}`).pipe(
      timeout(this.requestTimeout)
    );
  }

  // =====================================================
  // JOBS — BACKEND SPRING BOOT
  // =====================================================

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.backendUrl}/jobs`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Jobs API error:', error);
        return of([]);
      })
    );
  }

  getJobById(id: number | string): Observable<Job> {
    return this.getJobs().pipe(
      map((jobs: Job[]) => {
        const job = jobs.find(j => String(j.id) === String(id));
        return job as Job;
      }),
      catchError(error => {
        console.error('Job by id error:', error);
        return of(null as any);
      })
    );
  }

  createJob(job: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(`${this.backendUrl}/jobs`, job).pipe(
      timeout(this.requestTimeout)
    );
  }

  updateJob(job: Job): Observable<Job> {
    return this.http.put<Job>(
      `${this.backendUrl}/jobs/${job.id}`,
      job
    ).pipe(
      timeout(this.requestTimeout)
    );
  }

  deleteJob(id: number | string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/jobs/${id}`).pipe(
      timeout(this.requestTimeout)
    );
  }

  // =====================================================
  // APPLICATIONS — BACKEND SPRING BOOT
  // =====================================================

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.backendUrl}/applications`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Applications API error:', error);
        return of([]);
      })
    );
  }

  getApplicationById(id: number | string): Observable<Application> {
    return this.getApplications().pipe(
      map((applications: Application[]) => {
        const application = applications.find(a => String(a.id) === String(id));
        return application as Application;
      }),
      catchError(error => {
        console.error('Application by id error:', error);
        return of(null as any);
      })
    );
  }

  createApplication(application: Partial<Application>): Observable<Application> {
    const currentUser = this.getCurrentUser();

    const appToCreate: any = {
      status: application.status || 'PENDING'
    };

    if (application.user && typeof application.user === 'object' && application.user.id) {
      appToCreate.user = {
        id: application.user.id
      };
    } else if (currentUser?.id) {
      appToCreate.user = {
        id: currentUser.id
      };
    }

    if (application.job && typeof application.job === 'object' && application.job.id) {
      appToCreate.job = {
        id: application.job.id
      };
    }

    return this.http.post<Application>(
      `${this.backendUrl}/applications`,
      appToCreate
    ).pipe(
      timeout(this.requestTimeout)
    );
  }

  deleteApplication(id: number | string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/applications/${id}`).pipe(
      timeout(this.requestTimeout)
    );
  }

  updateApplication(application: Application): Observable<Application> {
    const applicationToUpdate: Application = {
      ...application,
      updatedAt: new Date().toISOString()
    };

    console.warn('updateApplication non connecté au backend pour le moment.');

    return of(applicationToUpdate);
  }

  updateApplicationStatus(
    application: Application,
    status: ApplicationStatus
  ): Observable<Application> {

    const applicationToUpdate: Application = {
      ...application,
      status,
      updatedAt: new Date().toISOString()
    };

    return this.updateApplication(applicationToUpdate);
  }

  saveRecruiterNote(
    application: Application,
    recruiterNote: string
  ): Observable<Application> {

    const applicationToUpdate: Application = {
      ...application,
      recruiterNote,
      updatedAt: new Date().toISOString()
    };

    return this.updateApplication(applicationToUpdate);
  }

  scheduleInterview(
    application: Application,
    interviewDate: string,
    interviewMode?: string,
    interviewLink?: string
  ): Observable<Application> {

    const applicationToUpdate: Application = {
      ...application,
      status: 'INTERVIEW',
      interviewDate,
      interviewMode,
      interviewLink,
      updatedAt: new Date().toISOString()
    };

    return this.updateApplication(applicationToUpdate);
  }

  // =====================================================
  // CANDIDATES — JSON-SERVER TEMPORAIRE
  // =====================================================

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.mockUrl}/candidates`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.warn('Candidates non disponibles. json-server peut être fermé.', error);
        return of([]);
      })
    );
  }

  // =====================================================
  // RECOMMENDATIONS — JSON-SERVER TEMPORAIRE
  // =====================================================

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.mockUrl}/recommendations`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.warn('Recommendations non disponibles. json-server peut être fermé.', error);
        return of([]);
      })
    );
  }

  // =====================================================
  // ACTIVITY LOGS — JSON-SERVER TEMPORAIRE
  // =====================================================

  getActivityLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.mockUrl}/activityLogs`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.warn('Activity logs non disponibles. json-server peut être fermé.', error);
        return of([]);
      })
    );
  }

  createActivityLog(log: Partial<ActivityLog>): Observable<ActivityLog> {
    const logToCreate: Partial<ActivityLog> = {
      ...log,
      createdAt: log.createdAt || new Date().toISOString()
    };

    return this.http.post<ActivityLog>(
      `${this.mockUrl}/activityLogs`,
      logToCreate
    ).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.warn('Activity log non sauvegardé. json-server indisponible.', error);
        return of(logToCreate as ActivityLog);
      })
    );
  }

  // =====================================================
  // LOGIN — VIA BACKEND USERS
  // =====================================================

  login(
    email: string,
    password: string,
    role: UserRole
  ): Observable<User | null> {

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const normalizedRole = this.getNormalizedRole(role);

    return this.getUsers().pipe(
      map((users: User[]) => {

        const user = users.find(u => {
          const userEmail = u.email?.trim().toLowerCase();
          const userPassword = u.password?.trim();
          const userRole = this.getNormalizedRole(u.role);

          return (
            userEmail === cleanEmail &&
            userPassword === cleanPassword &&
            userRole === normalizedRole
          );
        });

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        return user || null;
      }),
      catchError(error => {
        console.error('Login API error:', error);
        return of(null);
      })
    );
  }

  // =====================================================
  // IA FASTAPI
  // =====================================================

  checkAiHealth(): Observable<any> {
    return this.http.get(`${this.aiUrl}/health`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('AI health error:', error);
        return of({
          status: 'DOWN',
          error: true
        });
      })
    );
  }

  matchProfileJobs(payload: AiMatchRequest): Observable<AiMatchResponse> {
    return this.http.post<AiMatchResponse>(
      `${this.aiUrl}/api/ai/match-profile-jobs`,
      payload
    ).pipe(
      timeout(15000),
      catchError(error => {
        console.error('AI matching error:', error);
        return of({
          recommendations: [],
          matches: [],
          bestMatches: [],
          summary: 'Service IA indisponible.'
        });
      })
    );
  }
}