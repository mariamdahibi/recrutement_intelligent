import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recommendations.html',
  styleUrls: ['./recommendations.scss']
})

export class Recommendations implements OnInit {

  loading = true;

  matches:any[] = [];

  constructor(private api:ApiService){}

  ngOnInit(): void {

    this.api.getCandidates().subscribe(users=>{

      const user = users[0];

      this.api.getJobs().subscribe(jobs=>{

        this.matches = jobs.map((job:any)=>{

          let score = 50;

          if(user.skills && job.skills){

            user.skills.forEach((skill:string)=>{

              if(job.skills.includes(skill)){
                score += 20;
              }

            });

          }

          return {
            ...job,
            score: score > 100 ? 100 : score
          };

        });

        this.loading = false;

      });

    });

  }

}