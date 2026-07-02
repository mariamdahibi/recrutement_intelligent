import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar implements OnInit {

  role = '';
  userName = '';

  constructor(private router: Router) {}

  ngOnInit(): void {

    const userData = localStorage.getItem('user');

    if (userData) {

      const user = JSON.parse(userData);

      this.role = user.role;
      this.userName = user.name;

    }

  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isRecruiter(): boolean {
    return this.role === 'RECRUITER';
  }

  isUser(): boolean {
    return this.role === 'USER';
  }

  canSeeDashboard(): boolean {
    return this.role === 'ADMIN'
      || this.role === 'RECRUITER'
      || this.role === 'USER';
  }

  canSeeProfile(): boolean {
    return this.role === 'ADMIN'
      || this.role === 'RECRUITER'
      || this.role === 'USER';
  }

  canSeeJobs(): boolean {
    return this.role === 'ADMIN'
      || this.role === 'RECRUITER'
      || this.role === 'USER';
  }

  canSeeApplications(): boolean {
    return this.role === 'ADMIN'
      || this.role === 'RECRUITER';
  }

  canSeeRecommendations(): boolean {
    return this.role === 'ADMIN'
      || this.role === 'RECRUITER'
      || this.role === 'USER';
  }

  canSeeUsers(): boolean {
    return this.role === 'ADMIN';
  }

  logout(): void {

    localStorage.removeItem('user');

    this.router.navigate(['/login']);

  }

}