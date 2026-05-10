import { Injectable } from '@angular/core';

@Injectable({
  providedIn:'root'
})
export class AiService {

  calculateMatch(
    candidateSkills:string[],
    requiredSkills:string[]
  ):number{

    if(
      !candidateSkills.length ||
      !requiredSkills.length
    ){
      return 0;
    }

    let matched = 0;

    requiredSkills.forEach(skill=>{

      if(
        candidateSkills
        .map(s=>s.toLowerCase())
        .includes(skill.toLowerCase())
      ){
        matched++;
      }

    });

    return Math.round(
      (matched / requiredSkills.length) * 100
    );

  }

}