// src/app/features/applications/applications.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="apps">

    <h1>📨 Applications</h1>

    <div class="app-card"
         *ngFor="let app of applications">

      <h2>{{ app.candidate }}</h2>

      <p>{{ app.job }}</p>

      <span>{{ app.status }}</span>

    </div>

  </div>
  `,
  styles: [`
    .apps{
      padding:30px;
    }

    .app-card{
      background:white;
      padding:20px;
      border-radius:18px;
      margin-bottom:20px;
      box-shadow:0 5px 15px rgba(0,0,0,0.08);
    }

    span{
      background:#10b981;
      color:white;
      padding:8px 14px;
      border-radius:10px;
    }
  `]
})
export class Applications implements OnInit {

  applications:any[] = [];

  constructor(private api: ApiService){}

  ngOnInit(): void {

    this.api.getApplications().subscribe({
      next:(data:any[])=>{
        this.applications = data;
      }
    });

  }

}