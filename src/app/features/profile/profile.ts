import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';

@Component({
  standalone:true,
  imports:[CommonModule],

  template:`

  <div class="profile">

    <div class="card">

      

      <h2></h2>

      <p>
        AI Recruiter
      </p>

    </div>

    <div class="upload">

      <h2>📄 Upload CV</h2>

      <label class="upload-btn">

        Choose CV

        <input
          type="file"
          hidden
          (change)="upload($event)"
        >

      </label>

      <p *ngIf="fileName">

        ✅ {{ fileName }}

      </p>

    </div>

  </div>

  `,

  styles:[`

    .profile{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:20px;
    }

    .card,
    .upload{
      background:white;
      padding:30px;
      border-radius:20px;
      box-shadow:0 5px 15px rgba(0,0,0,0.08);
    }

    .avatar{
      width:90px;
      height:90px;
      border-radius:50%;
      background:#2563eb;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:35px;
      margin:auto;
    }

    h2,p{
      text-align:center;
    }

    .upload-btn{
      display:inline-block;
      padding:12px 20px;
      background:#2563eb;
      color:white;
      border-radius:12px;
      cursor:pointer;
      margin-top:20px;
    }

  `]
})
export class Profile {

  fileName='';

  upload(event:any){

    const file = event.target.files[0];

    if(file){

      this.fileName = file.name;

    }

  }

}