import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {

  email = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  login() {

    if (this.email && this.password) {

      localStorage.setItem(
        'user',
        JSON.stringify({
          email: this.email,
          role: 'Recruiter'
        })
      );

      this.router.navigate(['/app/dashboard']);

    } else {

      this.error = 'Email and password required';

    }

  }

}