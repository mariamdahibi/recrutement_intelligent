import { Injectable } from '@angular/core';

import {
  Candidate,
  Job,
  User
} from './api.service';

export interface AiMatchingResult {
  candidateId: number | string;
  candidateName: string;
  candidateEmail?: string;
  jobId: number | string;
  jobTitle: string;
  jobCompany?: string;
  jobLocation?: string;
  score: number;
  level: string;
  decision: string;
  summary: string;
  matchedSkills: string[];
  missingSkills: string[];
  bonusSkills: string[];
  advice: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiMatchingService {

  private knownSkills = [
    'Angular',
    'TypeScript',
    'JavaScript',
    'HTML',
    'CSS',
    'SCSS',
    'React',
    'Node.js',
    'Java',
    'Spring Boot',
    'SQL',
    'MySQL',
    'REST API',
    'Docker',
    'Git',
    'Python',
    'Machine Learning',
    'IA',
    'Mécanique',
    'Electromécanique'
  ];

  private synonyms: Record<string, string> = {
    angular: 'Angular',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    javascript: 'JavaScript',
    js: 'JavaScript',
    html: 'HTML',
    css: 'CSS',
    scss: 'SCSS',
    react: 'React',
    node: 'Node.js',
    nodejs: 'Node.js',
    java: 'Java',
    spring: 'Spring Boot',
    springboot: 'Spring Boot',
    'spring boot': 'Spring Boot',
    sql: 'SQL',
    mysql: 'MySQL',
    rest: 'REST API',
    api: 'REST API',
    docker: 'Docker',
    git: 'Git',
    python: 'Python',
    machinelearning: 'Machine Learning',
    'machine learning': 'Machine Learning',
    ia: 'IA',
    ai: 'IA',
    mecanique: 'Mécanique',
    mécanique: 'Mécanique',
    electromecanique: 'Electromécanique',
    électromécanique: 'Electromécanique'
  };

  calculateMatching(
    candidate: User | Candidate,
    job: Job
  ): AiMatchingResult {

    const candidateSkills = this.extractCandidateSkills(candidate);
    const jobSkills = this.extractJobSkills(job);

    const matchedSkills = jobSkills.filter(skill =>
      this.includesSkill(candidateSkills, skill)
    );

    const missingSkills = jobSkills.filter(skill =>
      !this.includesSkill(candidateSkills, skill)
    );

    const bonusSkills = candidateSkills.filter(skill =>
      !this.includesSkill(jobSkills, skill)
    );

    const score = this.calculateScore(
      candidateSkills,
      jobSkills,
      matchedSkills,
      bonusSkills,
      candidate
    );

    return {
      candidateId: candidate.id,
      candidateName: candidate.name || 'Candidat',
      candidateEmail: candidate.email,
      jobId: job.id,
      jobTitle: job.title,
      jobCompany: job.company,
      jobLocation: job.location,
      score,
      level: this.getLevel(score),
      decision: this.getDecision(score),
      summary: this.getSummary(candidate.name || 'Le candidat', job.title, score),
      matchedSkills,
      missingSkills,
      bonusSkills,
      advice: this.getAdvice(score, missingSkills)
    };
  }

  calculateAllMatchings(
    candidates: Array<User | Candidate>,
    jobs: Job[]
  ): AiMatchingResult[] {

    const results: AiMatchingResult[] = [];

    candidates.forEach(candidate => {
      jobs.forEach(job => {
        results.push(
          this.calculateMatching(candidate, job)
        );
      });
    });

    return results.sort((a, b) => b.score - a.score);
  }

  extractCandidateSkills(candidate: User | Candidate): string[] {
    const rawSkills = candidate.skills;

    if (!rawSkills) {
      return [];
    }

    return this.normalizeSkills(rawSkills);
  }

  extractJobSkills(job: Job): string[] {
    const skillsFromField = this.normalizeSkills(job.skills || '');

    const text = `
      ${job.title || ''}
      ${job.description || ''}
      ${job.company || ''}
    `;

    const skillsFromText = this.extractSkillsFromText(text);

    return this.unique([
      ...skillsFromField,
      ...skillsFromText
    ]);
  }

  normalizeSkills(value: string | string[]): string[] {
    if (Array.isArray(value)) {
      return this.unique(
        value
          .map(skill => this.normalizeSkillName(skill))
          .filter(skill => skill.length > 0)
      );
    }

    return this.unique(
      value
        .split(',')
        .map(skill => this.normalizeSkillName(skill))
        .filter(skill => skill.length > 0)
    );
  }

  extractSkillsFromText(text: string): string[] {
    const normalizedText = this.normalizeText(text);
    const detectedSkills: string[] = [];

    Object.keys(this.synonyms).forEach(key => {
      if (normalizedText.includes(this.normalizeText(key))) {
        detectedSkills.push(this.synonyms[key]);
      }
    });

    this.knownSkills.forEach(skill => {
      if (normalizedText.includes(this.normalizeText(skill))) {
        detectedSkills.push(skill);
      }
    });

    return this.unique(detectedSkills);
  }

  normalizeSkillName(skill: string): string {
    const cleanSkill = skill.trim();

    if (!cleanSkill) {
      return '';
    }

    const normalized = this.normalizeText(cleanSkill);

    return this.synonyms[normalized] || cleanSkill;
  }

  normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, '')
      .trim();
  }

  includesSkill(skills: string[], skill: string): boolean {
    return skills.some(item =>
      this.normalizeText(item) === this.normalizeText(skill)
    );
  }

  unique(skills: string[]): string[] {
    const map = new Map<string, string>();

    skills.forEach(skill => {
      const key = this.normalizeText(skill);

      if (key) {
        map.set(key, skill);
      }
    });

    return Array.from(map.values());
  }

  calculateScore(
    candidateSkills: string[],
    jobSkills: string[],
    matchedSkills: string[],
    bonusSkills: string[],
    candidate: User | Candidate
  ): number {

    if (jobSkills.length === 0) {
      return 50;
    }

    const skillsScore = Math.round(
      (matchedSkills.length / jobSkills.length) * 70
    );

    const bonusScore = Math.min(
      bonusSkills.length * 4,
      15
    );

    let profileScore = 0;

    if (candidate.email) {
      profileScore += 5;
    }

    if (candidateSkills.length >= 3) {
      profileScore += 10;
    }

    const finalScore = skillsScore + bonusScore + profileScore;

    return Math.min(finalScore, 98);
  }

  getLevel(score: number): string {
    if (score >= 85) {
      return 'Excellent profil';
    }

    if (score >= 70) {
      return 'Bon profil';
    }

    if (score >= 50) {
      return 'Profil moyen';
    }

    return 'Profil faible';
  }

  getDecision(score: number): string {
    if (score >= 85) {
      return 'Recommandé pour entretien';
    }

    if (score >= 70) {
      return 'À analyser rapidement';
    }

    if (score >= 50) {
      return 'Peut être étudié';
    }

    return 'Non prioritaire';
  }

  getSummary(
    candidateName: string,
    jobTitle: string,
    score: number
  ): string {

    if (score >= 85) {
      return `${candidateName} correspond fortement au poste ${jobTitle}. Ce profil est prioritaire.`;
    }

    if (score >= 70) {
      return `${candidateName} présente une bonne compatibilité avec le poste ${jobTitle}.`;
    }

    if (score >= 50) {
      return `${candidateName} possède quelques compétences utiles pour le poste ${jobTitle}, mais des améliorations sont nécessaires.`;
    }

    return `${candidateName} ne correspond pas suffisamment au poste ${jobTitle}.`;
  }

  getAdvice(
    score: number,
    missingSkills: string[]
  ): string[] {

    const advice: string[] = [];

    if (score >= 85) {
      advice.push('Profil très compatible avec l’offre.');
      advice.push('Recommandation : contacter rapidement le candidat.');
    } else if (score >= 70) {
      advice.push('Profil intéressant à analyser.');
      advice.push('Recommandation : vérifier les expériences du candidat.');
    } else if (score >= 50) {
      advice.push('Profil partiellement compatible.');
      advice.push('Recommandation : vérifier les compétences manquantes.');
    } else {
      advice.push('Profil peu compatible avec cette offre.');
      advice.push('Recommandation : non prioritaire.');
    }

    if (missingSkills.length > 0) {
      advice.push(
        `Compétences à améliorer : ${missingSkills.join(', ')}.`
      );
    }

    return advice;
  }
}