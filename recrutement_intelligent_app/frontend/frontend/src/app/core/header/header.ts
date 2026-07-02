// src/app/core/header/header.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],

  template: `

    <header class="header">

      <div class="search-box">

        <span class="search-icon">🔍</span>

        <input
          type="text"
          placeholder="Search candidates..."
          (input)="onSearch($event)"
        />

      </div>

      <div class="profile" *ngIf="user">

        <div class="avatar">
          {{ user.name?.charAt(0) || 'U' }}
        </div>

        <div class="user-text">
          <h4>{{ user.name }}</h4>
          <p>{{ getRoleLabel(user.role) }}</p>
        </div>

      </div>

    </header>

  `,

  styles: [`

    .header {
      height: 82px;
      background: white;
      padding: 0 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      z-index: 500;
    }

    .search-box {
      width: 380px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 0 15px;
    }

    .search-icon {
      font-size: 16px;
      color: #6b7280;
    }

    input {
      width: 100%;
      height: 46px;
      border: none;
      outline: none;
      background: transparent;
      font-size: 14px;
      color: #111827;
    }

    input::placeholder {
      color: #9ca3af;
    }

    .profile {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #2563eb;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 18px;
      box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
    }

    .user-text h4 {
      margin: 0;
      color: #111827;
      font-size: 16px;
      font-weight: 700;
    }

    .user-text p {
      margin: 4px 0 0;
      color: #6b7280;
      font-size: 13px;
      font-weight: 500;
    }

    @media (max-width: 700px) {

      .header {
        height: auto;
        padding: 18px;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .search-box {
        width: 100%;
      }

      .profile {
        width: 100%;
      }

    }

  `]
})
export class Header implements OnInit {

  user: any = null;

  searchText = '';

  ngOnInit(): void {

    const userData = localStorage.getItem('user');

    if (userData) {

      try {

        this.user = JSON.parse(userData);

      } catch {

        this.user = null;

      }

    }

  }

  getRoleLabel(role: string): string {

    if (role === 'ADMIN') {
      return 'Admin';
    }

    if (role === 'RECRUITER') {
      return 'Recruteur';
    }

    if (role === 'USER') {
      return 'Utilisateur';
    }

    return role || 'Utilisateur';

  }

  onSearch(event: Event): void {

    const input = event.target as HTMLInputElement;

    this.searchText = input.value;

    console.log('Search:', this.searchText);

  }

}