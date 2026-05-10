import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Sidebar } from '../../core/sidebar/sidebar';
import { Header } from '../../core/header/header';

@Component({
  standalone: true,

  imports: [
    CommonModule,
    RouterOutlet,
    Sidebar,
    Header
  ],

  template: `

  <div class="layout">

    <aside class="sidebar">

      <app-sidebar></app-sidebar>

    </aside>

    <div class="main">

      <app-header></app-header>

      <div class="content">

        <router-outlet></router-outlet>

      </div>

    </div>

  </div>

  `,

  styles: [`

    .layout{
      display:flex;
      min-height:100vh;
      background:#f3f4f6;
    }

    .sidebar{
      width:250px;
      flex-shrink:0;
    }

    .main{
      flex:1;
      display:flex;
      flex-direction:column;
    }

    .content{
      padding:30px;
      flex:1;
      overflow:auto;
    }

  `]
})
export class MainLayout {}