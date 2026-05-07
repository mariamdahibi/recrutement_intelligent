// src/app/features/dashboard/dashboard.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],

  template: `

  <div class="dashboard">

    <h1>🏢 Recruitment Dashboard</h1>

    <div class="cards">

      <div class="card blue">

        <h2>{{ totalCandidates }}</h2>

        <p>Candidates</p>

      </div>

      <div class="card green">

        <h2>{{ totalJobs }}</h2>

        <p>Jobs</p>

      </div>

      <div class="card purple">

        <h2>{{ totalApplications }}</h2>

        <p>Applications</p>

      </div>

    </div>

    <div class="analytics">

      <h2>📊 Recruitment Analytics</h2>

      <div class="line">

        <span>
          Matching Score
        </span>

        <div class="progress">

          <div
            class="fill blue-fill"
            [style.width.%]="matchingRate">
          </div>

        </div>

        <strong>{{ matchingRate }}%</strong>

      </div>

      <div class="line">

        <span>
          Accepted Applications
        </span>

        <div class="progress">

          <div
            class="fill green-fill"
            [style.width.%]="acceptedRate">
          </div>

        </div>

        <strong>{{ acceptedRate }}%</strong>

      </div>

    </div>

    <div class="section">

      <h2>🔥 Top Candidates</h2>

      <div
        class="candidate"
        *ngFor="let user of users"
      >

        <div>

          <h3>{{ user.name }}</h3>

          <p>{{ user.skills }}</p>

        </div>

        <span>
          {{ user.score }}%
        </span>

      </div>

    </div>

  </div>

  `,

  styles:[`

    .dashboard{
      padding:30px;
    }

    .cards{
      display:grid;
      grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
      gap:20px;
      margin-bottom:30px;
    }

    .card{
      color:white;
      padding:25px;
      border-radius:20px;
    }

    .blue{
      background:#2563eb;
    }

    .green{
      background:#10b981;
    }

    .purple{
      background:#7c3aed;
    }

    .analytics,
    .section{
      background:white;
      padding:25px;
      border-radius:20px;
      margin-bottom:25px;
    }

    .line{
      margin-bottom:20px;
    }

    .progress{
      width:100%;
      height:12px;
      background:#eee;
      border-radius:20px;
      overflow:hidden;
      margin:10px 0;
    }

    .fill{
      height:100%;
    }

    .blue-fill{
      background:#2563eb;
    }

    .green-fill{
      background:#10b981;
    }

    .candidate{
      display:flex;
      justify-content:space-between;
      align-items:center;
      padding:15px 0;
      border-bottom:1px solid #eee;
    }

    span{
      background:#2563eb;
      color:white;
      padding:8px 14px;
      border-radius:10px;
    }

  `]
})
export class RecruiterDashboard implements OnInit {

  users:any[] = [];
  jobs:any[] = [];
  applications:any[] = [];

  totalCandidates = 0;
  totalJobs = 0;
  totalApplications = 0;

  matchingRate = 0;
  acceptedRate = 0;

  constructor(private api: ApiService){}

  ngOnInit(): void {

    // USERS
    this.api.getUsers().subscribe({
      next:(data:any[])=>{

        this.users = data;

        this.totalCandidates = data.length;

        // moyenne scores candidats
        const totalScore =
          data.reduce(
            (sum,u)=>sum + (u.score || 0),
            0
          );

        this.matchingRate =
          data.length
          ? Math.round(totalScore / data.length)
          : 0;

      }
    });

    // JOBS
    this.api.getJobs().subscribe({
      next:(data:any[])=>{

        this.jobs = data;

        this.totalJobs = data.length;

      }
    });

    // APPLICATIONS
    this.api.getApplications().subscribe({
      next:(data:any[])=>{

        this.applications = data;

        this.totalApplications = data.length;

        const accepted =
          data.filter(
            a => a.status === 'Accepted'
          ).length;

        this.acceptedRate =
          data.length
          ? Math.round(
              (accepted / data.length) * 100
            )
          : 0;

      }
    });

  }

}