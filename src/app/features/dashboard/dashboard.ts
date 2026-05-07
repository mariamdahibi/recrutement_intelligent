import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';



import {
  ChartConfiguration
} from 'chart.js';

import { ApiService } from '../../core/services/api.service';

@Component({
  standalone:true,
  imports:[
  CommonModule,
  BaseChartDirective
],

  templateUrl:'./dashboard.html',
  styleUrls:['./dashboard.scss']
})
export class RecruiterDashboard implements OnInit {

  users:any[]=[];
  jobs:any[]=[];
  applications:any[]=[];

  loading=true;

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Candidates', 'Jobs', 'Applications'],
    datasets: [
      {
        data: [0,0,0],
        label: 'Recruitment Analytics'
      }
    ]
  };

  constructor(
    private api:ApiService
  ){}

  ngOnInit(): void {

    this.loadData();

  }

  loadData(){

  this.api.getUsers().subscribe({

    next:(users)=>{

      this.users = users;

      this.api.getJobs().subscribe({

        next:(jobs)=>{

          this.jobs = jobs;

          this.api.getApplications().subscribe({

            next:(apps)=>{

              this.applications = apps;

              this.barChartData.datasets[0].data = [
                users.length,
                jobs.length,
                apps.length
              ];

              // IMPORTANT
              this.loading = false;

            },

            error:()=>{

              this.loading = false;

            }

          });

        },

        error:()=>{

          this.loading = false;

        }

      });

    },

    error:()=>{

      this.loading = false;

    }

  });

}

  

}