import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export type UserRole = 'ADMIN' | 'RECRUITER' | 'USER' | 'CANDIDATE';

export interface User {
  id: number | string;
  name: string;
  email: string;
  password?: string;
  role: UserRole | string;
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
  status: string;
  job?: Job;
  user?: User;
  candidate?: string;
  score?: number;
}

export interface Recommendation {
  id: number | string;
  candidate?: string;
  job: string;
  match?: number;
  score?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      catchError(error => {
        console.error('Users API error:', error);
        return of([]);
      })
    );
  }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/jobs`).pipe(
      catchError(error => {
        console.error('Jobs API error:', error);
        return of([]);
      })
    );
  }

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/candidates`).pipe(
      catchError(error => {
        console.error('Candidates API error:', error);
        return of([]);
      })
    );
  }

  getApplications(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/applications`).pipe(
      catchError(error => {
        console.error('Applications API error:', error);
        return of([]);
      })
    );
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.apiUrl}/recommendations`).pipe(
      catchError(error => {
        console.error('Recommendations API error:', error);
        return of([]);
      })
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  deleteUser(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  createJob(job: Partial<Job>): Observable<Job> {
    return this.http.post<Job>(`${this.apiUrl}/jobs`, job);
  }

  deleteJob(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/jobs/${id}`);
  }

  updateApplication(application: Application): Observable<Application> {
    return this.http.put<Application>(
      `${this.apiUrl}/applications/${application.id}`,
      application
    );
  }

  login(email: string, password: string, role: UserRole): Observable<User | null> {
    return this.getUsers().pipe(
      map((users: User[]) => {

        const user = users.find(
          u =>
            u.email === email &&
            u.password === password &&
            u.role === role
        );

        return user || null;
      }),
      catchError(error => {
        console.error('Login API error:', error);
        return of(null);
      })
    );
  }

}