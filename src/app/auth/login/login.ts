// src/app/features/login/login.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],

  template: `

  <div class="login-page">

    <div class="login-card">

      <h1>🤖 Recruitment IA</h1>

      <p>
        Smart AI Recruitment Platform
      </p>

      <input
        [(ngModel)]="email"
        placeholder="Email"
      />

      <input
        [(ngModel)]="password"
        type="password"
        placeholder="Password"
      />

      <button (click)="login()">
        Login
      </button>

    </div>

  </div>

  `,

  styles: [`

    .login-page{
      height:100vh;
      display:flex;
      justify-content:center;
      align-items:center;
      background:linear-gradient(135deg,#2563eb,#7c3aed);
    }

    .login-card{
      width:400px;
      background:white;
      padding:40px;
      border-radius:25px;
      display:flex;
      flex-direction:column;
      gap:15px;
      box-shadow:0 10px 30px rgba(0,0,0,0.2);
    }

    h1{
      text-align:center;
    }

    p{
      text-align:center;
      color:#666;
      margin-bottom:20px;
    }

    input{
      padding:14px;
      border-radius:12px;
      border:1px solid #ddd;
    }

    button{
      padding:14px;
      border:none;
      border-radius:12px;
      background:#2563eb;
      color:white;
      font-size:16px;
      cursor:pointer;
    }

  `]
})
export class Login {

  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  login(){

    const ok = this.auth.login(
      this.email,
      this.password
    );

    if(ok){

      localStorage.setItem(
        'user',
        JSON.stringify({
          name:'Admin',
          email:this.email,
          role:'Recruiter'
        })
      );

      this.router.navigate(['/app/dashboard']);

    }else{
      alert('Invalid credentials');
    }

  }

}