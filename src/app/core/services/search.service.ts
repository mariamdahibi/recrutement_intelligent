import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private searchSubject = new BehaviorSubject<string>('');

  search$ = this.searchSubject.asObservable();

  updateSearch(value: string): void {
    this.searchSubject.next(value.trim().toLowerCase());
  }

  clear(): void {
    this.searchSubject.next('');
  }
}