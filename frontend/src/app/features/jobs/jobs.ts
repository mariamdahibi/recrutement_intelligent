import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jobs.html',
  styleUrls: ['./jobs.scss']
})
export class Jobs implements OnInit {

  jobs: any[] = [];
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {

    this.api.getJobs().subscribe((data: any) => {

      this.jobs = data;
      this.loading = false;

    });

  }

}