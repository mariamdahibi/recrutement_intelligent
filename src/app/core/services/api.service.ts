import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private api = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<any[]>(
      `${this.api}/users`
    );
  }

  getJobs() {
    return this.http.get<any[]>(
      `${this.api}/jobs`
    );
  }

  getApplications() {
    return this.http.get<any[]>(
      `${this.api}/applications`
    );
  }

}