// src/app/core/header/header.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector:'app-header',
  standalone:true,
  imports:[CommonModule],

  template:`

  <div class="header">

    <input
      placeholder="🔍 Search candidates..."
    />

    <div class="profile">

      <div class="avatar">
        A
      </div>

      <div>
        <h4>Admin</h4>
        <p>Recruiter</p>
      </div>

    </div>

  </div>

  `,

  styles:[`

    .header{
      background:white;
      padding:20px 30px;
      display:flex;
      justify-content:space-between;
      align-items:center;
      border-bottom:1px solid #eee;
    }

    input{
      width:320px;
      padding:12px;
      border-radius:12px;
      border:1px solid #ddd;
    }

    .profile{
      display:flex;
      align-items:center;
      gap:10px;
    }

    .avatar{
      width:45px;
      height:45px;
      border-radius:50%;
      background:#2563eb;
      color:white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:bold;
    }

    h4,p{
      margin:0;
    }

    p{
      color:#777;
      font-size:13px;
    }

  `]
  
})
export class Header {}