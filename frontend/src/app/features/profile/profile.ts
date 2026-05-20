import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import jsPDF from 'jspdf';

import {
  ApiService,
  Candidate
} from '../../core/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {

  currentUser: any = null;
  role = '';

  candidate: Candidate | null = null;

  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadProfile();
  }

  loadCurrentUser(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      this.currentUser = JSON.parse(userData);
      this.role = this.currentUser.role;
    }
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    if (this.role !== 'USER') {
      this.loading = false;
      return;
    }

    this.api.getCandidates().subscribe({
      next: (candidates: Candidate[]) => {

        this.candidate =
          candidates.find(candidate =>
            candidate.email === this.currentUser?.email ||
            candidate.name?.toLowerCase() === this.currentUser?.name?.toLowerCase()
          )
          || candidates[0]
          || null;

        this.loading = false;
      },

      error: () => {
        this.error = 'Erreur lors du chargement du profil.';
        this.loading = false;
      }
    });
  }

  isUser(): boolean {
    return this.role === 'USER';
  }

  isRecruiter(): boolean {
    return this.role === 'RECRUITER';
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  getRoleLabel(): string {
    if (this.role === 'ADMIN') {
      return 'Administrateur';
    }

    if (this.role === 'RECRUITER') {
      return 'Recruteur';
    }

    return 'Candidat';
  }

  getPageTitle(): string {
    if (this.isAdmin()) {
      return 'Profil Administrateur';
    }

    if (this.isRecruiter()) {
      return 'Profil Recruteur';
    }

    return 'Profil Candidat';
  }

  getPageSubtitle(): string {
    if (this.isAdmin()) {
      return 'Gérez les utilisateurs, les recruteurs, les offres et les candidatures.';
    }

    if (this.isRecruiter()) {
      return 'Suivez les candidatures, publiez des offres et analysez les meilleurs profils.';
    }

    return 'Consultez votre profil, vos compétences et votre score IA.';
  }

  getDisplayName(): string {
    if (this.isUser() && this.candidate) {
      return this.candidate.name;
    }

    return this.currentUser?.name || 'Utilisateur';
  }

  getDisplayEmail(): string {
    if (this.isUser() && this.candidate?.email) {
      return this.candidate.email;
    }

    return this.currentUser?.email || 'Email non disponible';
  }

  getInitial(): string {
    return this.getDisplayName().charAt(0).toUpperCase();
  }

  getScore(): number {
    return this.candidate?.score || 0;
  }

  getSkillsArray(): string[] {
    const skills = this.candidate?.skills;

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

  downloadPDF(): void {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text('Recruitment IA - Profile', 10, 20);

    pdf.setFontSize(12);
    pdf.text(`Name: ${this.getDisplayName()}`, 10, 40);
    pdf.text(`Email: ${this.getDisplayEmail()}`, 10, 50);
    pdf.text(`Role: ${this.getRoleLabel()}`, 10, 60);

    if (this.isUser() && this.candidate) {
      pdf.text(`Skills: ${this.getSkillsArray().join(', ')}`, 10, 70);
      pdf.text(`AI Score: ${this.getScore()}%`, 10, 80);
    }

    pdf.save('profile.pdf');
  }

}