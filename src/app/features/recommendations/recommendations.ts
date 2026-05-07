import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <h2>🤖 AI Job Matching</h2>

  <div *ngFor="let job of matches" class="card">
    <h3>{{ job.title }}</h3>
    <p>{{ job.description }}</p>
    <strong>Match: {{ job.match }}%</strong>
  </div>
  `,
  styles: [`
    .card {
      background:white;
      padding:20px;
      margin-bottom:15px;
      border-radius:10px;
    }
  `]
})
export class Recommendations implements OnInit {

  matches: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {

    const cv = JSON.parse(localStorage.getItem('cvResult') || '{}');
    const skills = cv.skills || [];

    this.api.getJobs().subscribe((jobs: any[]) => {

      this.matches = jobs.map(job => {

        let score = 0;

        skills.forEach((s: any) => {
          if (
            job.title?.toLowerCase().includes(s.name.toLowerCase()) ||
            job.description?.toLowerCase().includes(s.name.toLowerCase())
          ) {
            score += s.level;
          }
        });

        const match = skills.length
          ? Math.min(Math.floor(score / skills.length), 100)
          : 0;

        return {
          ...job,
          match
        };

      }).sort((a, b) => b.match - a.match);

    });

  }

}