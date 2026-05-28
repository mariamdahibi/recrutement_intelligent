from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Union
from io import BytesIO

import json
import re
import unicodedata

import pdfplumber
from docx import Document

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


app = FastAPI(
    title="AI Recruitment Service",
    description="Serveur IA réel pour analyser les CV et matcher les candidats avec les offres",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4300",
        "http://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


class CandidateProfile(BaseModel):
    id: Union[str, int]
    name: str
    email: Optional[str] = None
    skills: Optional[Union[str, List[str]]] = None
    experience_years: Optional[int] = 0
    english_level: Optional[str] = ""
    cv_text: Optional[str] = ""
    education: Optional[str] = ""
    experience: Optional[str] = ""


class JobOffer(BaseModel):
    id: Union[str, int]
    title: str
    company: Optional[str] = ""
    description: Optional[str] = ""
    location: Optional[str] = ""
    skills: Optional[Union[str, List[str]]] = None


class MatchRequest(BaseModel):
    candidate: CandidateProfile
    jobs: List[JobOffer]


KNOWN_SKILLS = [
    "Angular",
    "TypeScript",
    "JavaScript",
    "HTML",
    "CSS",
    "SCSS",
    "React",
    "Node.js",
    "Java",
    "Spring Boot",
    "SQL",
    "MySQL",
    "REST API",
    "Docker",
    "Git",
    "Python",
    "Machine Learning",
    "IA",
    "Mécanique",
    "Electromécanique"
]

SYNONYMS = {
    "angular": "Angular",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "html": "HTML",
    "css": "CSS",
    "scss": "SCSS",
    "react": "React",
    "node": "Node.js",
    "nodejs": "Node.js",
    "java": "Java",
    "spring": "Spring Boot",
    "springboot": "Spring Boot",
    "spring boot": "Spring Boot",
    "sql": "SQL",
    "mysql": "MySQL",
    "rest": "REST API",
    "api": "REST API",
    "docker": "Docker",
    "git": "Git",
    "python": "Python",
    "machine learning": "Machine Learning",
    "machinelearning": "Machine Learning",
    "ia": "IA",
    "ai": "IA",
    "mecanique": "Mécanique",
    "mécanique": "Mécanique",
    "electromecanique": "Electromécanique",
    "électromécanique": "Electromécanique"
}


def normalize_text(value: str) -> str:
    value = value.lower()
    value = unicodedata.normalize("NFD", value)
    value = value.encode("ascii", "ignore").decode("utf-8")
    value = re.sub(r"[^a-z0-9 ]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def unique(values: List[str]) -> List[str]:
    result = {}

    for value in values:
        key = normalize_text(value)

        if key:
            result[key] = value

    return list(result.values())


def normalize_skill_name(skill: str) -> str:
    clean_skill = skill.strip()

    if not clean_skill:
        return ""

    normalized = normalize_text(clean_skill)

    return SYNONYMS.get(normalized, clean_skill)


def normalize_skills(skills: Optional[Union[str, List[str]]]) -> List[str]:
    if not skills:
        return []

    if isinstance(skills, list):
        raw_skills = skills
    else:
        raw_skills = skills.split(",")

    result = []

    for skill in raw_skills:
        normalized_skill = normalize_skill_name(skill)

        if normalized_skill:
            result.append(normalized_skill)

    return unique(result)


def extract_skills_from_text(text: str) -> List[str]:
    normalized_text = normalize_text(text)
    detected_skills = []

    for key, value in SYNONYMS.items():
        if normalize_text(key) in normalized_text:
            detected_skills.append(value)

    for skill in KNOWN_SKILLS:
        if normalize_text(skill) in normalized_text:
            detected_skills.append(skill)

    return unique(detected_skills)


def contains_skill(skills: List[str], searched_skill: str) -> bool:
    searched = normalize_text(searched_skill)

    return any(
        normalize_text(skill) == searched
        for skill in skills
    )


def build_candidate_text(candidate: CandidateProfile) -> str:
    return " ".join([
        candidate.name or "",
        candidate.email or "",
        skills_to_text(candidate.skills),
        candidate.cv_text or "",
        candidate.education or "",
        candidate.experience or "",
        candidate.english_level or "",
        str(candidate.experience_years or 0)
    ])


def build_job_text(job: JobOffer) -> str:
    return " ".join([
        job.title or "",
        job.company or "",
        job.description or "",
        job.location or "",
        skills_to_text(job.skills)
    ])


def skills_to_text(skills: Optional[Union[str, List[str]]]) -> str:
    if not skills:
        return ""

    if isinstance(skills, list):
        return " ".join(skills)

    return skills


def get_candidate_skills(candidate: CandidateProfile) -> List[str]:
    skills_from_profile = normalize_skills(candidate.skills)
    skills_from_cv = extract_skills_from_text(candidate.cv_text or "")

    return unique(skills_from_profile + skills_from_cv)


def get_job_skills(job: JobOffer) -> List[str]:
    skills_from_field = normalize_skills(job.skills)
    skills_from_text = extract_skills_from_text(
        f"{job.title or ''} {job.description or ''}"
    )

    return unique(skills_from_field + skills_from_text)


def calculate_text_similarity(candidate_text: str, job_text: str) -> int:
    if not candidate_text.strip() or not job_text.strip():
        return 0

    vectorizer = TfidfVectorizer(
        lowercase=True,
        ngram_range=(1, 2)
    )

    matrix = vectorizer.fit_transform([
        candidate_text,
        job_text
    ])

    similarity = cosine_similarity(
        matrix[0:1],
        matrix[1:2]
    )[0][0]

    return round(similarity * 100)


def calculate_skill_score(
    matched_skills: List[str],
    job_skills: List[str]
) -> int:

    if not job_skills:
        return 50

    return round(
        (len(matched_skills) / len(job_skills)) * 100
    )


def calculate_profile_score(candidate: CandidateProfile) -> int:
    score = 0

    if candidate.email:
        score += 20

    if candidate.skills:
        score += 25

    if candidate.cv_text:
        score += 25

    if candidate.experience_years and candidate.experience_years >= 1:
        score += 15

    if candidate.english_level:
        score += 15

    return min(score, 100)


def get_level(score: int) -> str:
    if score >= 85:
        return "Excellent profil"

    if score >= 70:
        return "Bon profil"

    if score >= 50:
        return "Profil moyen"

    return "Profil faible"


def get_decision(score: int) -> str:
    if score >= 85:
        return "Recommandé pour entretien"

    if score >= 70:
        return "À analyser rapidement"

    if score >= 50:
        return "Peut être étudié"

    return "Non prioritaire"


def get_summary(
    candidate_name: str,
    job_title: str,
    score: int
) -> str:

    if score >= 85:
        return f"{candidate_name} correspond fortement au poste {job_title}."

    if score >= 70:
        return f"{candidate_name} possède une bonne compatibilité avec le poste {job_title}."

    if score >= 50:
        return f"{candidate_name} possède quelques compétences utiles pour le poste {job_title}, mais des améliorations sont nécessaires."

    return f"{candidate_name} ne correspond pas suffisamment au poste {job_title}."


def get_advice(
    score: int,
    missing_skills: List[str]
) -> List[str]:

    advice = []

    if score >= 85:
        advice.append("Profil prioritaire à contacter rapidement.")
    elif score >= 70:
        advice.append("Profil intéressant à analyser.")
    elif score >= 50:
        advice.append("Profil partiellement compatible.")
    else:
        advice.append("Profil peu compatible avec cette offre.")

    if missing_skills:
        advice.append(
            "Compétences à améliorer : " + ", ".join(missing_skills)
        )

    return advice


def match_candidate_with_job(
    candidate: CandidateProfile,
    job: JobOffer
) -> dict:

    candidate_text = build_candidate_text(candidate)
    job_text = build_job_text(job)

    candidate_skills = get_candidate_skills(candidate)
    job_skills = get_job_skills(job)

    matched_skills = [
        skill for skill in job_skills
        if contains_skill(candidate_skills, skill)
    ]

    missing_skills = [
        skill for skill in job_skills
        if not contains_skill(candidate_skills, skill)
    ]

    text_similarity = calculate_text_similarity(
        candidate_text,
        job_text
    )

    skill_score = calculate_skill_score(
        matched_skills,
        job_skills
    )

    profile_score = calculate_profile_score(candidate)

    final_score = round(
        skill_score * 0.55 +
        text_similarity * 0.35 +
        profile_score * 0.10
    )

    final_score = min(final_score, 98)

    return {
        "candidateId": candidate.id,
        "candidateName": candidate.name,
        "candidateEmail": candidate.email,

        "jobId": job.id,
        "jobTitle": job.title,
        "jobCompany": job.company,
        "jobLocation": job.location,

        "score": final_score,
        "skillScore": skill_score,
        "textSimilarity": text_similarity,
        "profileScore": profile_score,

        "level": get_level(final_score),
        "decision": get_decision(final_score),
        "summary": get_summary(
            candidate.name,
            job.title,
            final_score
        ),

        "candidateSkills": candidate_skills,
        "jobSkills": job_skills,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "advice": get_advice(
            final_score,
            missing_skills
        )
    }


def extract_pdf_text(file_content: bytes) -> str:
    text_parts = []

    with pdfplumber.open(BytesIO(file_content)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            text_parts.append(page_text)

    return "\n".join(text_parts).strip()


def extract_docx_text(file_content: bytes) -> str:
    document = Document(BytesIO(file_content))

    paragraphs = [
        paragraph.text
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    return "\n".join(paragraphs).strip()


def extract_cv_text(file_content: bytes, filename: str) -> str:
    lower_filename = filename.lower()

    if lower_filename.endswith(".pdf"):
        return extract_pdf_text(file_content)

    if lower_filename.endswith(".docx"):
        return extract_docx_text(file_content)

    if lower_filename.endswith(".txt"):
        return file_content.decode("utf-8", errors="ignore")

    raise ValueError(
        "Format non supporté. Utilisez PDF, DOCX ou TXT."
    )


@app.get("/")
def root():
    return {
        "message": "AI Recruitment Service is running",
        "version": "2.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "AI Recruitment Service"
    }


@app.post("/api/ai/match-profile-jobs")
def match_profile_jobs(request: MatchRequest):
    results = []

    for job in request.jobs:
        result = match_candidate_with_job(
            request.candidate,
            job
        )

        results.append(result)

    results = sorted(
        results,
        key=lambda item: item["score"],
        reverse=True
    )

    return {
        "candidate": request.candidate.name,
        "results": results
    }


@app.post("/api/ai/analyze-cv-and-match")
async def analyze_cv_and_match(
    file: UploadFile = File(...),
    candidate_json: str = Form(...),
    jobs_json: str = Form(...)
):
    try:
        file_content = await file.read()

        cv_text = extract_cv_text(
            file_content,
            file.filename or ""
        )

        candidate_data = json.loads(candidate_json)
        jobs_data = json.loads(jobs_json)

        candidate = CandidateProfile(
            **candidate_data,
            cv_text=cv_text
        )

        jobs = [
            JobOffer(**job)
            for job in jobs_data
        ]

        results = []

        for job in jobs:
            result = match_candidate_with_job(
                candidate,
                job
            )

            results.append(result)

        results = sorted(
            results,
            key=lambda item: item["score"],
            reverse=True
        )

        detected_skills = get_candidate_skills(candidate)

        return {
            "fileName": file.filename,
            "cvTextLength": len(cv_text),
            "detectedSkills": detected_skills,
            "candidate": candidate.name,
            "results": results
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur pendant l'analyse IA : {str(error)}"
        )


@app.post("/score")
def old_score_compatibility(candidate: CandidateProfile):
    candidate_skills = get_candidate_skills(candidate)

    return {
        "message": "Ancien endpoint conservé pour compatibilité",
        "candidate": candidate.name,
        "detectedSkills": candidate_skills,
        "note": "Utilisez /api/ai/match-profile-jobs pour le vrai matching IA."
    }