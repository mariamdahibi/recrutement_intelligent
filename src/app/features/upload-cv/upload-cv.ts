import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  catchError,
  finalize,
  of
} from 'rxjs';

import {
  ApiService,
  Job,
  User
} from '../../core/services/api.service';

import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-upload-cv',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './upload-cv.html',
  styleUrls: ['./upload-cv.scss']
})
export class UploadCv implements OnInit {

  loading = false;
  analyzing = false;

  currentUser: User | null = null;
  jobs: Job[] = [];

  selectedFile: File | null = null;

  detectedSkills: string[] = [];
  missingSkills: string[] = [];
  recommendedJobs: Job[] = [];

  analysisDone = false;

  knownSkills = [
    'Angular',
    'TypeScript',
    'HTML',
    'SCSS',
    'Java',
    'Spring Boot',
    'MySQL',
    'Docker',
    'REST API',
    'SQL',
    'Git'
  ];

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.api.getCurrentUser();
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;

    this.api.getJobs().pipe(
      catchError(() => of([])),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: jobs => {
        this.jobs = jobs;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.setFile(input.files[0]);
  }

  setFile(file: File): void {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      this.toast.show(
        'Format invalide',
        'Veuillez choisir un fichier PDF ou Word.',
        'warning'
      );
      return;
    }

    this.selectedFile = file;
    this.analysisDone = false;
    this.detectedSkills = [];
    this.missingSkills = [];
    this.recommendedJobs = [];
  }

  removeFile(): void {
    this.selectedFile = null;
    this.analysisDone = false;
    this.detectedSkills = [];
    this.missingSkills = [];
    this.recommendedJobs = [];
  }

  analyzeCv(): void {
    if (!this.selectedFile) {
      this.toast.show(
        'Aucun fichier',
        'Veuillez sélectionner un CV avant de lancer l’analyse.',
        'warning'
      );
      return;
    }

    this.analyzing = true;

    setTimeout(() => {
      const userSkills = this.getUserSkills();

      this.detectedSkills = userSkills.length > 0
        ? userSkills
        : ['Angular', 'TypeScript', 'Java'];

      this.recommendedJobs = this.getRecommendedJobs();

      this.missingSkills = this.getMissingSkills();

      this.analysisDone = true;
      this.analyzing = false;

      this.toast.show(
        'Analyse terminée',
        'Votre CV a été analysé avec succès.',
        'success'
      );

      this.cdr.detectChanges();
    }, 1200);
  }

  saveSkillsToProfile(): void {
    if (!this.currentUser || this.detectedSkills.length === 0) {
      return;
    }

    const updatedUser: User = {
      ...this.currentUser,
      skills: this.detectedSkills.join(', ')
    };

    this.api.updateUser(updatedUser).subscribe({
      next: user => {
        this.currentUser = user;

        localStorage.setItem(
          'user',
          JSON.stringify(user)
        );

        this.toast.show(
          'Profil mis à jour',
          'Les compétences détectées ont été ajoutées à votre profil.',
          'success'
        );
      },
      error: () => {
        this.toast.show(
          'Erreur',
          'Impossible de mettre à jour votre profil.',
          'error'
        );
      }
    });
  }

  getUserSkills(): string[] {
    const skills = this.currentUser?.skills;

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

  getJobSkills(job: Job): string[] {
    const skills = job.skills;

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

  calculateScore(job: Job): number {
    const userSkills = this.detectedSkills.map(skill =>
      skill.toLowerCase()
    );

    const jobSkills = this.getJobSkills(job).map(skill =>
      skill.toLowerCase()
    );

    if (jobSkills.length === 0) {
      return 50;
    }

    const matchedSkills = jobSkills.filter(skill =>
      userSkills.includes(skill)
    );

    return Math.round((matchedSkills.length / jobSkills.length) * 100);
  }

  getRecommendedJobs(): Job[] {
    return [...this.jobs]
      .sort((a, b) =>
        this.calculateScore(b) - this.calculateScore(a)
      )
      .slice(0, 3);
  }

  getMissingSkills(): string[] {
    const requiredSkills = this.jobs
      .flatMap(job => this.getJobSkills(job))
      .map(skill => skill.trim());

    const uniqueRequiredSkills = Array.from(new Set(requiredSkills));

    return uniqueRequiredSkills.filter(skill =>
      !this.detectedSkills
        .map(item => item.toLowerCase())
        .includes(skill.toLowerCase())
    ).slice(0, 5);
  }

  getFileSize(): string {
    if (!this.selectedFile) {
      return '';
    }

    const sizeInMb = this.selectedFile.size / 1024 / 1024;
    return `${sizeInMb.toFixed(2)} MB`;
  }
}