import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Liste des candidats</h2>

    <div *ngFor="let c of candidates">
      {{ c.name }} - score: {{ c.score }}
    </div>
  `
})
export class Candidates {

  candidates = [
    { name: 'Halima', score: 90 },
    { name: 'Ali', score: 75 }
  ];
}