import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ApiService,
  Application
} from '../../core/services/api.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applications.html',
  styleUrls: ['./applications.scss']
})
export class Applications implements OnInit {

  applications: Application[] = [];

  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {

    this.loading = true;
    this.error = '';

    this.api.getApplications().subscribe({

      next: (data: Application[]) => {

        this.applications = data;
        this.loading = false;

      },

      error: () => {

        this.error = 'Erreur lors du chargement des candidatures.';
        this.loading = false;

      }

    });

  }

  getCandidateName(application: Application): string {
    return application.user?.name
      || application.candidate
      || 'Candidat';
  }

  getCandidateEmail(application: Application): string {
    return application.user?.email
      || 'Email non disponible';
  }

  getCandidateInitial(application: Application): string {
    return this.getCandidateName(application)
      .charAt(0)
      .toUpperCase();
  }

  getJobTitle(application: Application): string {

    if (typeof application.job === 'string') {
      return application.job;
    }

    return application.job?.title
      || 'Poste non disponible';
  }

  getJobDescription(application: Application): string {

    if (typeof application.job === 'object') {
      return application.job?.description || 'Aucune description disponible.';
    }

    return 'Aucune description disponible.';
  }

  getJobLocation(application: Application): string {

    if (typeof application.job === 'object') {
      return application.job?.location || '';
    }

    return '';
  }

  getScore(application: Application): number {
    return application.score || 0;
  }

  getStatusClass(status: string): string {

    const value = status?.toUpperCase();

    if (value === 'ACCEPTED') {
      return 'accepted';
    }

    if (value === 'REJECTED') {
      return 'rejected';
    }

    return 'pending';
  }

}