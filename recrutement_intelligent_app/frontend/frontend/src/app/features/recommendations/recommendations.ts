import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  ApiService,
  Candidate,
  Job
} from '../../core/services/api.service';

interface MatchResult {
  candidateName: string;
  candidateEmail?: string;
  jobTitle: string;
  company?: string;
  candidateSkills: string[];
  jobSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  score: number;
}

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './recommendations.html',
  styleUrls: ['./recommendations.scss']
})
export class Recommendations implements OnInit {

  loading = true;
  error = '';

  currentUser: any = null;
  role = '';

  candidates: Candidate[] = [];
  jobs: Job[] = [];
  matches: MatchResult[] = [];

  searchText = '';
  selectedJob = 'ALL';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadData();
  }

  loadCurrentUser(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.role = this.currentUser.role;
    }
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    this.api.getCandidates().subscribe({
      next: (candidates: Candidate[]) => {

        this.api.getJobs().subscribe({
          next: (jobs: Job[]) => {

            this.candidates = candidates;
            this.jobs = jobs;

            this.calculateMatches();

            this.loading = false;
          },

          error: () => {
            this.error = 'Erreur lors du chargement des offres.';
            this.loading = false;
          }
        });

      },

      error: () => {
        this.error = 'Erreur lors du chargement des candidats.';
        this.loading = false;
      }
    });
  }

  calculateMatches(): void {
    this.matches = [];

    let candidatesToUse = this.candidates;

    if (this.role === 'USER') {
      const connectedCandidate =
        this.candidates.find(candidate =>
          candidate.email === this.currentUser?.email ||
          candidate.name?.toLowerCase() === this.currentUser?.name?.toLowerCase()
        )
        || this.candidates[0];

      candidatesToUse = connectedCandidate ? [connectedCandidate] : [];
    }

    candidatesToUse.forEach(candidate => {

      this.jobs.forEach(job => {

        const candidateSkills = this.convertSkillsToArray(candidate.skills);
        const jobSkills = this.convertSkillsToArray(job.skills);

        const matchedSkills = candidateSkills.filter(skill =>
          jobSkills.includes(skill)
        );

        const missingSkills = jobSkills.filter(skill =>
          !candidateSkills.includes(skill)
        );

        const score =
          jobSkills.length > 0
            ? Math.round((matchedSkills.length / jobSkills.length) * 100)
            : 0;

        this.matches.push({
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobTitle: job.title,
          company: job.company,
          candidateSkills,
          jobSkills,
          matchedSkills,
          missingSkills,
          score
        });

      });

    });

    this.matches.sort((a, b) => b.score - a.score);
  }

  get filteredMatches(): MatchResult[] {
    let result = this.matches;

    if (this.selectedJob !== 'ALL') {
      result = result.filter(match => match.jobTitle === this.selectedJob);
    }

    const value = this.searchText.toLowerCase().trim();

    if (value) {
      result = result.filter(match =>
        match.candidateName.toLowerCase().includes(value) ||
        match.jobTitle.toLowerCase().includes(value) ||
        match.matchedSkills.join(', ').toLowerCase().includes(value)
      );
    }

    return result;
  }

  get averageScore(): number {
    if (this.filteredMatches.length === 0) {
      return 0;
    }

    const total = this.filteredMatches.reduce(
      (sum, match) => sum + match.score,
      0
    );

    return Math.round(total / this.filteredMatches.length);
  }

  get bestScore(): number {
    if (this.filteredMatches.length === 0) {
      return 0;
    }

    return Math.max(...this.filteredMatches.map(match => match.score));
  }

  get availableJobs(): string[] {
    return this.jobs.map(job => job.title);
  }

  getPageTitle(): string {
    if (this.role === 'ADMIN') {
      return 'Analyse IA globale';
    }

    if (this.role === 'RECRUITER') {
      return 'AI Matching Recruteur';
    }

    return 'Mes recommandations IA';
  }

  getPageSubtitle(): string {
    if (this.role === 'ADMIN') {
      return 'Vue globale des correspondances entre candidats, compétences et offres.';
    }

    if (this.role === 'RECRUITER') {
      return 'Classement intelligent des candidats selon les offres publiées.';
    }

    return 'Découvre les offres les plus adaptées à ton profil.';
  }

  getRoleLabel(): string {
    if (this.role === 'ADMIN') {
      return 'Espace Admin';
    }

    if (this.role === 'RECRUITER') {
      return 'Espace Recruteur';
    }

    return 'Espace Candidat';
  }

  getScoreClass(score: number): string {
    if (score >= 80) {
      return 'excellent';
    }

    if (score >= 50) {
      return 'good';
    }

    return 'low';
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedJob = 'ALL';
  }

  private convertSkillsToArray(
    skills: string | string[] | undefined
  ): string[] {

    if (!skills) {
      return [];
    }

    if (Array.isArray(skills)) {
      return skills
        .map(skill => skill.trim().toLowerCase())
        .filter(skill => skill.length > 0);
    }

    return skills
      .split(',')
      .map(skill => skill.trim().toLowerCase())
      .filter(skill => skill.length > 0);
  }

}