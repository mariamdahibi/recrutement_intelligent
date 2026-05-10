import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  login(email: string, password: string) {

    if (
      email === 'admin@gmail.com'
      &&
      password === '1234'
    ) {

      localStorage.setItem(
        'token',
        'jwt-token'
      );

      localStorage.setItem(
        'role',
        'recruiter'
      );

      return true;
    }

    return false;
  }

  logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('role');

  }

  isLogged() {

    return !!localStorage.getItem('token');

  }

}