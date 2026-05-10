import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn:'root'
})
export class ApiService {

  api = 'http://localhost:3000';

  constructor(private http:HttpClient){}

  getCandidates(){
    return this.http.get<any[]>(
      `${this.api}/candidates`
    );
  }

  getJobs(){
    return this.http.get<any[]>(
      `${this.api}/jobs`
    );
  }

  getRecommendations(){
    return this.http.get<any[]>(
      `${this.api}/recommendations`
    );
  }

}