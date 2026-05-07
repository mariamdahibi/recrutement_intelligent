// src/app/features/jobs/jobs.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="jobs">

    <h1>💼 Jobs</h1>

    <div class="job-card"
         *ngFor="let job of jobs">

      <h2>{{ job.title }}</h2>

      <p>{{ job.description }}</p>

    </div>

  </div>
  `,
  styles: [`
    .jobs{
      padding:30px;
    }

    .job-card{
      background:white;
      padding:25px;
      border-radius:18px;
      margin-bottom:20px;
      box-shadow:0 5px 15px rgba(0,0,0,0.08);
    }
  `]
})
export class Jobs implements OnInit {

  jobs:any[] = [];

  constructor(private api: ApiService){}

  ngOnInit(): void {

    this.api.getJobs().subscribe({
      next:(data:any[])=>{
        this.jobs = data;
      }
    });

  }

}