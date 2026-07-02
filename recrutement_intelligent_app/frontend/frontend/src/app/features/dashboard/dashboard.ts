import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import {
  ApiService,
  Candidate,
  Job,
  Application,
  Recommendation,
  User
} from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class RecruiterDashboard implements OnInit {

  role = '';
  currentUser: any = null;

  loading = true;
  error = '';

  users: User[] = [];
  candidates: Candidate[] = [];
  jobs: Job[] = [];
  applications: Application[] = [];
  recommendations: Recommendation[] = [];

  candidateProfile: Candidate | null = null;
  topCandidates: Candidate[] = [];
  bestRecommendations: Recommendation[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.role = this.currentUser.role;
    }

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      users: this.api.getUsers(),
      candidates: this.api.getCandidates(),
      jobs: this.api.getJobs(),
      applications: this.api.getApplications(),
      recommendations: this.api.getRecommendations()
    }).subscribe({
      next: data => {
        this.users = data.users;
        this.candidates = data.candidates;
        this.jobs = data.jobs;
        this.applications = data.applications;
        this.recommendations = data.recommendations;

        this.candidateProfile =
          this.candidates.find(c => c.email === this.currentUser?.email)
          || this.candidates[0]
          || null;

        this.topCandidates = [...this.candidates]
          .sort((a, b) => (b.score || 0) - (a.score || 0))
          .slice(0, 3);

        this.bestRecommendations = [...this.recommendations]
          .sort((a, b) => (b.match || 0) - (a.match || 0))
          .slice(0, 3);

        this.loading = false;
      },

      error: () => {
        this.error = 'Erreur lors du chargement du dashboard.';
        this.loading = false;
      }
    });
  }

  recruitersCount(): number {
    return this.users.filter(u => u.role === 'RECRUITER').length;
  }

  usersCount(): number {
    return this.users.filter(u => u.role === 'USER').length;
  }
}