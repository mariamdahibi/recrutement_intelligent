// ===============================
// FINAL auth.service.ts
// src/app/core/services/auth.service.ts
// ===============================

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  login(email: string, password: string): boolean {

    if(
      email === 'admin@gmail.com'
      &&
      password === '1234'
    ){

      localStorage.setItem('token','jwt-token');

      return true;
    }

    return false;
  }

  logout(){
    localStorage.removeItem('token');
  }

  isLogged(){
    return !!localStorage.getItem('token');
  }

}