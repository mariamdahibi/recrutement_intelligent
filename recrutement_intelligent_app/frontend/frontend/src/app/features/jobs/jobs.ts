import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ApiService,
  Job
} from '../../core/services/api.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './jobs.html',
  styleUrls: ['./jobs.scss']
})
export class Jobs implements OnInit {

  jobs: Job[] = [];
  filteredJobs: Job[] = [];

  loading = true;
  error = '';
  searchText = '';

  role = '';

  newJob: Partial<Job> = {
    title: '',
    company: '',
    description: '',
    skills: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getCurrentRole();
    this.loadJobs();
  }

  getCurrentRole(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      const user = JSON.parse(userData);
      this.role = user.role;
    }
  }

  canManageJobs(): boolean {
    return this.role === 'ADMIN' || this.role === 'RECRUITER';
  }

  loadJobs(): void {
    this.loading = true;
    this.error = '';

    this.api.getJobs().subscribe({
      next: data => {
        this.jobs = data;
        this.filteredJobs = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des offres.';
        this.loading = false;
      }
    });
  }

  addJob(): void {
    if (!this.newJob.title || !this.newJob.skills) {
      this.error = 'Veuillez saisir au minimum le titre et les compétences.';
      return;
    }

    this.api.createJob(this.newJob).subscribe({
      next: job => {
        this.jobs.push(job);
        this.filteredJobs = this.jobs;

        this.newJob = {
          title: '',
          company: '',
          description: '',
          skills: ''
        };

        this.error = '';
      }
    });
  }

  deleteJob(id: number | string): void {
    this.api.deleteJob(id).subscribe({
      next: () => {
        this.jobs = this.jobs.filter(job => job.id !== id);
        this.filteredJobs = this.filteredJobs.filter(job => job.id !== id);
      }
    });
  }

  searchJobs(): void {
    const value = this.searchText.toLowerCase().trim();

    if (!value) {
      this.filteredJobs = this.jobs;
      return;
    }

    this.filteredJobs = this.jobs.filter(job => {
      const title = job.title?.toLowerCase() || '';
      const company = job.company?.toLowerCase() || '';
      const description = job.description?.toLowerCase() || '';
      const skills = this.getSkillsArray(job.skills).join(', ').toLowerCase();

      return (
        title.includes(value) ||
        company.includes(value) ||
        description.includes(value) ||
        skills.includes(value)
      );
    });
  }

  getSkillsArray(skills: string | string[] | undefined): string[] {
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