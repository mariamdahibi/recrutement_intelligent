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

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000';
  private requestTimeout = 5000;

  constructor(private http: HttpClient) {}

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

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Users API error:', error);
        return of([]);
      })
    );
  }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Jobs API error:', error);
        return of([]);
      })
    );
  }

  getJobById(id: number | string): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/jobs/${id}`).pipe(
      timeout(this.requestTimeout)
    );
  }

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/candidates`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Candidates API error:', error);
        return of([]);
      })
    );
  }

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/applications`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Applications API error:', error);
        return of([]);
      })
    );
  }

  getApplicationById(id: number | string): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/applications/${id}`).pipe(
      timeout(this.requestTimeout)
    );
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.apiUrl}/recommendations`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Recommendations API error:', error);
        return of([]);
      })
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user).pipe(
      timeout(this.requestTimeout)
    );
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/users/${user.id}`,
      user
    ).pipe(
      timeout(this.requestTimeout)
    );
  }

  deleteUser(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`).pipe(
      timeout(this.requestTimeout)
    );
  }

  createJob(job: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/jobs`, job).pipe(
      timeout(this.requestTimeout)
    );
  }

  deleteJob(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/jobs/${id}`).pipe(
      timeout(this.requestTimeout)
    );
  }

  createApplication(application: Partial<Application>): Observable<Application> {
    const applicationToCreate: Partial<Application> = {
      ...application,
      status: application.status || 'PENDING',
      createdAt: application.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.http.post<Application>(
      `${this.apiUrl}/applications`,
      applicationToCreate
    ).pipe(
      timeout(this.requestTimeout)
    );
  }

  updateApplication(application: Application): Observable<Application> {
    const applicationToUpdate: Application = {
      ...application,
      updatedAt: new Date().toISOString()
    };

    return this.http.put<Application>(
      `${this.apiUrl}/applications/${application.id}`,
      applicationToUpdate
    ).pipe(
      timeout(this.requestTimeout)
    );
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

  deleteApplication(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/applications/${id}`).pipe(
      timeout(this.requestTimeout)
    );
  }

  getActivityLogs(): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.apiUrl}/activityLogs`).pipe(
      timeout(this.requestTimeout),
      catchError(error => {
        console.error('Activity logs API error:', error);
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
      `${this.apiUrl}/activityLogs`,
      logToCreate
    ).pipe(
      timeout(this.requestTimeout)
    );
  }

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

        return user || null;
      }),
      catchError(error => {
        console.error('Login API error:', error);
        return of(null);
      })
    );
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
}