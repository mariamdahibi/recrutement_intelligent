// src/app/core/sidebar/sidebar.ts

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],

  template: `

  <div class="sidebar">

    <h2>
      🤖 Recruitment IA
    </h2>

    <a routerLink="/app/dashboard">
      🏢 Dashboard
    </a>

    <a routerLink="/app/profile">
      👤 Profile
    </a>

    <a routerLink="/app/jobs">
      💼 Jobs
    </a>

    <a routerLink="/app/applications">
      📨 Applications
    </a>

    <a routerLink="/app/recommendations">
      🤖 AI Matching
    </a>

  </div>

  `,

  styles:[`

    .sidebar{
      width:250px;
      height:100vh;
      background:#111827;
      color:white;
      padding:25px;
      display:flex;
      flex-direction:column;
      gap:15px;
    }

    h2{
      margin-bottom:30px;
    }

    a{
      color:white;
      text-decoration:none;
      padding:14px;
      border-radius:12px;
      background:#1f2937;
      transition:0.3s;
    }

    a:hover{
      background:#2563eb;
    }

  `]
})
export class Sidebar {}