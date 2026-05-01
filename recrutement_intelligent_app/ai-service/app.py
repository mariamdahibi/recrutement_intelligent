from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AI Recruitment Service")

class CandidateRequest(BaseModel):
    skills: list[str]
    experience_years: int
    english_level: str

@app.get("/")
def root():
    return {"message": "AI service is running"}

@app.post("/score")
def calculate_score(candidate: CandidateRequest):
    score = 0
    skills_lower = [skill.lower() for skill in candidate.skills]

    if "java" in skills_lower:
        score += 30
    if "spring boot" in skills_lower:
        score += 25
    if "sql" in skills_lower:
        score += 15
    if candidate.experience_years >= 2:
        score += 20
    if candidate.english_level.lower() in ["b2", "c1", "c2", "advanced"]:
        score += 10

    recommendation = "Profil faible"
    if score >= 70:
        recommendation = "Profil recommande"
    elif score >= 40:
        recommendation = "Profil moyen"

    return {
        "score": score,
        "recommendation": recommendation
    }