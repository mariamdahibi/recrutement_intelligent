import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ThemeService } from '../services/theme.service';
import { SearchService } from '../services/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class Header implements OnInit {

  searchText = '';
  userName = '';
  role = '';
  isDark = false;

  constructor(
    private themeService: ThemeService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');

    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.name;
      this.role = user.role;
    }

    this.isDark = this.themeService.getCurrentTheme() === 'dark';
  }

  onSearchChange(): void {
    this.searchService.updateSearch(this.searchText);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDark = this.themeService.getCurrentTheme() === 'dark';
  }

  getInitial(): string {
    return this.userName?.charAt(0)?.toUpperCase() || 'U';
  }

  getRoleLabel(): string {
    if (this.role === 'ADMIN') {
      return 'Admin';
    }

    if (this.role === 'RECRUITER') {
      return 'Recruteur';
    }

    return 'Utilisateur';
  }
}