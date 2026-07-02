import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit {

  userName = '';
  role = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      try {
        const user = JSON.parse(userData);

        this.userName = user.name || 'Utilisateur';
        this.role = user.role || 'USER';
      } catch {
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }
    }
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isRecruiter(): boolean {
    return this.role === 'RECRUITER';
  }

  isUser(): boolean {
    return this.role === 'USER' || this.role === 'CANDIDATE';
  }

  canSeeApplications(): boolean {
    return this.isAdmin() || this.isRecruiter();
  }

  canSeeRecruiterPipeline(): boolean {
    return this.isAdmin() || this.isRecruiter();
  }

  canSeeMyApplications(): boolean {
    return this.isUser();
  }

  canSeeUploadCv(): boolean {
    return this.isUser();
  }

  canSeeUsers(): boolean {
    return this.isAdmin();
  }

  canSeeAdminDashboard(): boolean {
    return this.isAdmin();
  }

  canSeeAdminLogs(): boolean {
    return this.isAdmin();
  }

  getRoleLabel(): string {
    if (this.isAdmin()) {
      return 'Espace Admin';
    }

    if (this.isRecruiter()) {
      return 'Espace Recruteur';
    }

    return 'Espace Candidat';
  }

  getInitial(): string {
    return this.userName
      ? this.userName.charAt(0).toUpperCase()
      : 'U';
  }

  logout(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}