// =========================================
// src/app/features/upload-cv/upload-cv.ts
// =========================================

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],

  template: `
  <div class="box">

    <h2>📄 Upload CV</h2>

    <input
      type="file"
      (change)="upload($event)"
    />

    <p *ngIf="done">
      ✅ CV analysé
    </p>

  </div>
  `,

  styles: [`
    .box{
      background:white;
      padding:30px;
      border-radius:20px;
    }
  `]
})
export class UploadCv {

  done = false;

  upload(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    const result = {

      score: 88,

      skills: [

        {
                   
        },

        {
          name: 'Java',
          level: 80
        },

        {
          
        }

      ]

    };

    localStorage.setItem(
      'cvResult',
      JSON.stringify(result)
    );

    this.done = true;

  }

}