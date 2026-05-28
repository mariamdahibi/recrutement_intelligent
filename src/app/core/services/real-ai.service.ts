import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Job,
  User,
  Candidate
} from './api.service';

export interface RealAiMatchResult {
  candidateId: number | string;
  candidateName: string;
  candidateEmail?: string;

  jobId: number | string;
  jobTitle: string;
  jobCompany?: string;
  jobLocation?: string;

  score: number;
  skillScore: number;
  textSimilarity: number;
  profileScore: number;

  level: string;
  decision: string;
  summary: string;

  candidateSkills: string[];
  jobSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  advice: string[];
}

export interface MatchProfileJobsResponse {
  candidate: string;
  results: RealAiMatchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class RealAiService {

  private aiUrl = 'http://localhost:8000/api/ai';

  constructor(private http: HttpClient) {}

  matchProfileJobs(
    candidate: User | Candidate,
    jobs: Job[]
  ): Observable<MatchProfileJobsResponse> {

    return this.http.post<MatchProfileJobsResponse>(
      `${this.aiUrl}/match-profile-jobs`,
      {
        candidate,
        jobs
      }
    );
  }

  analyzeCvAndMatch(
    file: File,
    candidate: User,
    jobs: Job[]
  ): Observable<any> {

    const formData = new FormData();

    formData.append('file', file);
    formData.append('candidate_json', JSON.stringify(candidate));
    formData.append('jobs_json', JSON.stringify(jobs));

    return this.http.post(
      `${this.aiUrl}/analyze-cv-and-match`,
      formData
    );
  }
}