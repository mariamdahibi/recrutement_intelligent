import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applications.html',
  styleUrls: ['./applications.scss']
})

export class Applications implements OnInit {

  applications:any[] = [];

  loading = true;

  constructor(private api:ApiService){}

  ngOnInit(): void {

    this.api.getRecommendations().subscribe((data:any[])=>{

      this.applications = data;

      this.loading = false;

    });

  }

}