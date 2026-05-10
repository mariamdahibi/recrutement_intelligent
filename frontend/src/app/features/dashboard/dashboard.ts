import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})

export class RecruiterDashboard implements OnInit {

  loading = true;

  users:any[] = [];
  jobs:any[] = [];
  applications:any[] = [];

  chartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Candidates', 'Jobs', 'Applications'],
    datasets: [
      {
        data: [0,0,0],
        label: 'Recruitment Analytics'
      }
    ]
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true
  };

  constructor(private api:ApiService){}

  ngOnInit(): void {

    this.api.getCandidates().subscribe(users=>{

      this.users = users;

      this.api.getJobs().subscribe(jobs=>{

        this.jobs = jobs;

        this.api.getRecommendations().subscribe(apps=>{

          this.applications = apps;

          this.chartData.datasets[0].data = [
            users.length,
            jobs.length,
            apps.length
          ];

          this.loading = false;

        });

      });

    });

  }

}