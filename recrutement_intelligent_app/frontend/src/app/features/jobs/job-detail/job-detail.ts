import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  RouterModule
} from '@angular/router';

import {
  ApiService,
  Job
} from '../../../core/services/api.service';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './job-detail.html',
  styleUrls: ['./job-detail.scss']
})
export class JobDetail implements OnInit {

  job: Job | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Offre introuvable.';
      this.loading = false;
      return;
    }

    this.api.getJobById(id).subscribe({
      next: job => {
        this.job = job;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement de l’offre.';
        this.loading = false;
      }
    });
  }

  getSkills(): string[] {
    const skills = this.job?.skills;

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