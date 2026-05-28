import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  catchError,
  finalize,
  of
} from 'rxjs';

import {
  ActivityLog,
  ApiService
} from '../../../core/services/api.service';

import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './admin-logs.html',
  styleUrls: ['./admin-logs.scss']
})
export class AdminLogs implements OnInit {

  loading = true;
  error = '';

  logs: ActivityLog[] = [];

  typeFilter = 'ALL';
  globalSearch = '';

  page = 1;
  pageSize = 10;

  constructor(
    private api: ApiService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadLogs();

    this.searchService.search$.subscribe(value => {
      this.globalSearch = value;
      this.page = 1;
      this.cdr.detectChanges();
    });
  }

  loadLogs(): void {
    this.loading = true;
    this.error = '';

    this.api.getActivityLogs().pipe(
      catchError(() => {
        this.error = 'Erreur lors du chargement des logs.';
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: data => {
        this.logs = data;
      }
    });
  }

  get filteredLogs(): ActivityLog[] {
    let result = [...this.logs];

    if (this.typeFilter !== 'ALL') {
      result = result.filter(log => log.type === this.typeFilter);
    }

    if (this.globalSearch) {
      result = result.filter(log =>
        log.action?.toLowerCase().includes(this.globalSearch) ||
        log.actor?.toLowerCase().includes(this.globalSearch) ||
        log.target?.toLowerCase().includes(this.globalSearch) ||
        log.type?.toLowerCase().includes(this.globalSearch)
      );
    }

    return result.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  get paginatedLogs(): ActivityLog[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredLogs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLogs.length / this.pageSize) || 1;
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
    }
  }

  getLogIcon(type: string): string {
    if (type === 'USER') {
      return '👤';
    }

    if (type === 'JOB') {
      return '💼';
    }

    if (type === 'APPLICATION') {
      return '📨';
    }

    return '🛡️';
  }

  getLogClass(type: string): string {
    return type?.toLowerCase() || 'system';
  }

  getUserLogsCount(): number {
    return this.logs.filter(log => log.type === 'USER').length;
  }

  getJobLogsCount(): number {
    return this.logs.filter(log => log.type === 'JOB').length;
  }

  getApplicationLogsCount(): number {
    return this.logs.filter(log => log.type === 'APPLICATION').length;
  }
}