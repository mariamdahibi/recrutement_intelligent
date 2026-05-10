import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})

export class Profile implements OnInit {

  user:any;

  loading = true;

  error = '';

  constructor(private api:ApiService){}

  ngOnInit(): void {

    this.api.getCandidates().subscribe({

      next:(data:any[])=>{

        this.user = data[0];

        this.loading = false;

      },

      error:()=>{

        this.error = 'Failed to load profile';

        this.loading = false;

      }

    });

  }

  downloadPDF(){

    const pdf = new jsPDF();

    pdf.text(`Name: ${this.user.name}`, 10, 20);

    pdf.text(`Email: ${this.user.email}`, 10, 30);

    pdf.text(`Role: ${this.user.role}`, 10, 40);

    pdf.save('profile.pdf');

  }

}