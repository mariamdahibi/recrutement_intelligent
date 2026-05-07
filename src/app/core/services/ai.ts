import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  calculateScore(user: any, job: any): number {
    if (!user.skills || !job.requirements) return 0;

    let match = 0;

    job.requirements.forEach((req: string) => {
      if (user.skills.includes(req)) match++;
    });

    return Math.round((match / job.requirements.length) * 100);
  }

  getRecommendations(user: any, jobs: any[]) {
    return jobs
      .map(job => ({
        ...job,
        score: this.calculateScore(user, job)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

}