import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  catchError,
  forkJoin,
  of
} from 'rxjs';

import {
  ApiService,
  Candidate,
  Job,
  User
} from '../../core/services/api.service';

import {
  RealAiMatchResult,
  RealAiService
} from '../../core/services/real-ai.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './recommendations.html',
  styleUrls: ['./recommendations.scss']
})
export class Recommendations implements OnInit {

  loading = true;
  error = '';

  currentUser: User | null = null;

  jobs: Job[] = [];
  users: User[] = [];
  candidates: Candidate[] = [];

  results: RealAiMatchResult[] = [];

  search = '';
  jobFilter = 'ALL';
  minScoreFilter = 0;

  constructor(
    private api: ApiService,
    private realAi: RealAiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.api.getCurrentUser();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      jobs: this.api.getJobs().pipe(catchError(() => of([]))),
      users: this.api.getUsers().pipe(catchError(() => of([]))),
      candidates: this.api.getCandidates().pipe(catchError(() => of([])))
    }).subscribe({
      next: data => {
        this.jobs = data.jobs;
        this.users = data.users;
        this.candidates = data.candidates;

        this.callRealAiEngine();
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des données IA.';
        this.cdr.detectChanges();
      }
    });
  }

  callRealAiEngine(): void {
    const profiles = this.getCandidateProfiles();

    if (profiles.length === 0 || this.jobs.length === 0) {
      this.results = [];
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    const requests = profiles.map(profile =>
      this.realAi.matchProfileJobs(profile, this.jobs).pipe(
        catchError(error => {
          console.error('Erreur serveur IA:', error);
          return of({
            candidate: profile.name,
            results: []
          });
        })
      )
    );

    forkJoin(requests).subscribe({
      next: responses => {
        this.results = responses
          .flatMap(response => response.results)
          .sort((a, b) => b.score - a.score);

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors du calcul IA.';
        this.cdr.detectChanges();
      }
    });
  }

  getCandidateProfiles(): Array<User | Candidate> {
    if (this.isCandidate() && this.currentUser) {
      return [this.currentUser];
    }

    const usersAsCandidates = this.users.filter(user =>
      user.role === 'USER' || user.role === 'CANDIDATE'
    );

    const allProfiles: Array<User | Candidate> = [
      ...usersAsCandidates,
      ...this.candidates
    ];

    const map = new Map<string, User | Candidate>();

    allProfiles.forEach(profile => {
      const key = profile.email || String(profile.id);

      if (!map.has(key)) {
        map.set(key, profile);
      }
    });

    return Array.from(map.values());
  }

  isCandidate(): boolean {
    const role = this.currentUser?.role;
    return role === 'USER' || role === 'CANDIDATE';
  }

  get filteredResults(): RealAiMatchResult[] {
    let result = [...this.results];

    if (this.jobFilter !== 'ALL') {
      result = result.filter(item =>
        item.jobTitle === this.jobFilter
      );
    }

    if (Number(this.minScoreFilter) > 0) {
      result = result.filter(item =>
        item.score >= Number(this.minScoreFilter)
      );
    }

    if (this.search.trim()) {
      const value = this.search.toLowerCase();

      result = result.filter(item =>
        item.candidateName.toLowerCase().includes(value) ||
        item.jobTitle.toLowerCase().includes(value) ||
        item.level.toLowerCase().includes(value) ||
        item.decision.toLowerCase().includes(value)
      );
    }

    return result.sort((a, b) => b.score - a.score);
  }

  getAvailableJobs(): string[] {
    return Array.from(
      new Set(
        this.results.map(item => item.jobTitle)
      )
    ).sort();
  }

  getTotalCount(): number {
    return this.filteredResults.length;
  }

  getBestScore(): number {
    if (this.filteredResults.length === 0) {
      return 0;
    }

    return Math.max(
      ...this.filteredResults.map(item => item.score)
    );
  }

  getAverageScore(): number {
    if (this.filteredResults.length === 0) {
      return 0;
    }

    const total = this.filteredResults.reduce(
      (sum, item) => sum + item.score,
      0
    );

    return Math.round(total / this.filteredResults.length);
  }

  getHighMatchesCount(): number {
    return this.filteredResults.filter(item =>
      item.score >= 85
    ).length;
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
}