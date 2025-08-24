import fitz
import re
from fuzzywuzzy import fuzz
from fuzzywuzzy import process
from flask import Blueprint, jsonify
from io import BytesIO
import requests
import os

predefined_skills = [
    "Adobe XD", "Angular", "AWS", "Azure", "C++", "CSS", "Data Science", "Django", 
    "Docker", "Express.js", "Figma", "Flask", "Git", "GraphQL", "HTML", "Illustrator", 
    "Java", "JavaScript", "Kubernetes", "Laravel", "Linux", "Machine Learning", 
    "Microservices", "MongoDB", "MySQL", "Next.js", "Node.js", "Nuxt.js", "Photoshop", 
    "PHP", "PostgreSQL", "Python", "React", "Redux", "REST API", "TypeScript", 
    "UI/UX Design", "Vue.js", "Vuex"
]


EXPRESS = os.getenv('EXPRESS', 'http://localhost:3000')

def extract_text_from_pdf(pdf_file):
    try:
        with open("temp_resume.pdf", "wb") as f:
            f.write(pdf_file.read())  

        doc = fitz.open("temp_resume.pdf")  
        text = ""
        for page in doc:
            text += page.get_text("text")
        return text
    except Exception as e:
        print(f"Error opening PDF: {e}")
        raise
 

def find_exact_skills(resume_text, skills):
    found_skills = []
    for skill in skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', resume_text, re.IGNORECASE):
            found_skills.append(skill)
    return found_skills

def find_fuzzy_skills(resume_text, skills, threshold=80):
    found_skills = []
    for skill in skills:
        best_match, score = process.extractOne(skill, [resume_text], scorer=fuzz.ratio)
        if score >= threshold:
            found_skills.append((skill, score)) 
    return found_skills

def suggest_skills(resume_text, predefined_skills):
    exact_matches = find_exact_skills(resume_text, predefined_skills)
    fuzzy_matches = find_fuzzy_skills(resume_text, predefined_skills)
    
    fuzzy_skills = [match[0] for match in fuzzy_matches if match[0] not in exact_matches]

    return exact_matches + fuzzy_skills

suggest_skills_for_applicant = Blueprint('suggest_skills_for_applicant', __name__)

@suggest_skills_for_applicant.route('/suggest-skills/<int:uid>', methods=['GET'])
def suggest_skills_for_app(uid):
    
    response = requests.get(f"{EXPRESS}/resume/view-resume/{uid}")

    if response.status_code != 200:
        return jsonify({"message": "Failed to download resume from express"}), 500

    resume_file = BytesIO(response.content)

    try:
        resume_text = extract_text_from_pdf(resume_file)
    except Exception as e:
        return jsonify({"message": f"Error processing the resume: {str(e)}"}), 500

    suggested_skills = suggest_skills(resume_text, predefined_skills)

    os.remove("temp_resume.pdf")
    
    return jsonify({
        "message": "Successfully processed resume.",
        "suggested_skills": suggested_skills
    }), 200
