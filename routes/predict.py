from flask import Blueprint, request, jsonify
from db import get_db
import joblib
import os
import json

predict_bp = Blueprint("predict", __name__)

# Load model once
MODEL_PATH = os.path.join("models", "classifier.pkl")
model = joblib.load(MODEL_PATH)

def get_gap_details(features, weak_areas):
    """
    Provide specific details about what's lacking in the user's profile
    """
    details = []
    
    if "skills" in weak_areas:
        skill_percentage = features['skill_match']
        if skill_percentage == 0:
            details.append("You don't have any of the required skills")
        else:
            details.append(f"You only match {skill_percentage:.0f}% of required skills")
    
    if "experience" in weak_areas:
        exp_gap = features['experience_gap'] 
        if exp_gap > 0:
            details.append(f"You need {exp_gap} more years of experience")
    
    if "location" in weak_areas:
        details.append("Your preferred location doesn't match the job location")
    
    if "education" in weak_areas:
        details.append("Your education level is below the job requirements")
    
    if "job type preference" in weak_areas:
        details.append("Your job type preference doesn't align with this role")
    
    if "work mode" in weak_areas:
        details.append("Your work mode preference (remote/onsite/hybrid) doesn't match")
    
    return ". ".join(details[:3]) + "." if details else ""

def generate_applicant_feedback(prediction_data, features_data):
    """
    Generate clear, actionable feedback messages for applicants based on ML prediction
    and feature analysis - with a touch of humor!
    """
    
    label = prediction_data['prediction']['label']
    features = features_data
    
    # Analyze what's lacking in the profile
    weak_areas = []
    if features['skill_match'] < 50:
        weak_areas.append("skills")
    if features['experience_gap'] > 0:
        weak_areas.append("experience")
    if features['location_match'] == 0:
        weak_areas.append("location")
    if features['education_match'] == 0:
        weak_areas.append("education")
    if features['job_type_match'] == 0:
        weak_areas.append("job type preference")
    if features['mode_match'] == 0:
        weak_areas.append("work mode")
    
    if label == 1:
        # Even for high matches, show minor improvements if any
        if weak_areas:
            minor_improvements = ", ".join(weak_areas[:2])
            return {
                "status": "high",
                "message": f"🎯 Perfect match! You're exactly what they're looking for. Small tip: Fine-tuning your {minor_improvements} could make you even stronger. Go apply now! ✨",
                "color": "green"
            }
        else:
            return {
                "status": "high", 
                "message": "🎯 Absolute perfect match! Every single requirement met - skills, experience, location, everything aligns perfectly. Apply immediately! ✨",
                "color": "green"
            }
    else:
        if len(weak_areas) <= 2:
            gap_text = " and ".join(weak_areas) if len(weak_areas) > 1 else weak_areas[0]
            gap_details = get_gap_details(features, weak_areas)
            return {
                "status": "medium", 
                "message": f"⚡ Almost there! You're lacking in: {gap_text}. {gap_details} Focus on these areas and you'll be a strong contender! 🏗️",
                "color": "orange"
            }
        else:
            main_gaps = weak_areas[:2]
            gap_text = " and ".join(main_gaps)
            gap_details = get_gap_details(features, weak_areas)
            return {
                "status": "low",
                "message": f"🚀 Honest feedback: You're lacking in {len(weak_areas)} areas - mainly {gap_text}. {gap_details} Work on these first, then reapply! 💪",
                "color": "red"
            }

@predict_bp.route("/predict_application", methods=["GET"])
def predict_application():
    uid = request.args.get("uid")
    jobid = request.args.get("jobid")
    
    if not uid or not jobid:
        return jsonify({"error": "uid and jobid are required"}), 400
    
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # --- Applicant total experience ---
        cursor.execute("""
            SELECT IFNULL(SUM(TIMESTAMPDIFF(YEAR, start, end)),0) AS exp_years
            FROM experience WHERE uid = %s
        """, (uid,))
        applicant_exp = cursor.fetchone()["exp_years"]
        
        # --- Job details ---
        cursor.execute("""
            SELECT experience_min, skillids, lid, qualification, job_type, mode_of_work 
            FROM jobs WHERE jobid = %s
        """, (jobid,))
        job = cursor.fetchone()
        
        if not job:
            return jsonify({"error": "Job not found"}), 404
            
        job_exp_min = job["experience_min"]
        
        # --- Experience gap ---
        exp_gap = job_exp_min - applicant_exp
        
        # --- Skills match ---
        cursor.execute("SELECT skillid FROM applicant_skills WHERE uid = %s", (uid,))
        applicant_skills = [row["skillid"] for row in cursor.fetchall()]
        
        # Handle job skills - they're stored as JSON
        job_skills_raw = job["skillids"]
        if job_skills_raw:
            if isinstance(job_skills_raw, str):
                try:
                    job_skills = json.loads(job_skills_raw)
                except json.JSONDecodeError:
                    job_skills = [int(s.strip()) for s in job_skills_raw.split(",") if s.strip()]
            else:
                job_skills = job_skills_raw if isinstance(job_skills_raw, list) else []
        else:
            job_skills = []
        
        matched_skills = len([s for s in applicant_skills if s in job_skills])
        total_skills = len(job_skills)
        skill_match = (matched_skills / total_skills) * 100 if total_skills > 0 else 0
        
        # --- Location match ---
        cursor.execute("SELECT preferredLocation FROM applicants WHERE uid = %s", (uid,))
        user_location_result = cursor.fetchone()
        user_location = user_location_result["preferredLocation"] if user_location_result else None
        
        cursor.execute("SELECT lname FROM locations WHERE lid = %s", (job["lid"],))
        job_location_result = cursor.fetchone()
        job_location = job_location_result["lname"] if job_location_result else None
        
        location_match = 1 if user_location and job_location and user_location == job_location else 0
        
        # --- Education match ---
        cursor.execute("""
            SELECT education_level FROM education WHERE uid = %s 
            ORDER BY 
                CASE education_level
                    WHEN 'Phd' THEN 6
                    WHEN 'Postgraduate' THEN 5
                    WHEN 'Undergraduate' THEN 4
                    WHEN 'Diploma' THEN 3
                    WHEN '12th' THEN 2
                    WHEN '10th' THEN 1
                    ELSE 0
                END DESC
            LIMIT 1
        """, (uid,))
        user_edu_result = cursor.fetchone()
        user_highest_edu = user_edu_result["education_level"] if user_edu_result else None
        
        edu_hierarchy = {
            '10th': 1, '12th': 2, 'Diploma': 3, 'Undergraduate': 4, 
            'Postgraduate': 5, 'Phd': 6
        }
        
        user_edu_level = edu_hierarchy.get(user_highest_edu, 0)
        required_edu_level = edu_hierarchy.get(job["qualification"], 0)
        education_match = 1 if user_edu_level >= required_edu_level else 0
        
        # --- Job type match ---
        cursor.execute("SELECT jobType FROM applicants WHERE uid = %s", (uid,))
        user_job_type_result = cursor.fetchone()
        user_job_type = user_job_type_result["jobType"] if user_job_type_result else None
        
        job_type_match = 1 if user_job_type and user_job_type == job["job_type"] else 0
        
        # --- Mode match ---
        cursor.execute("SELECT availability FROM applicants WHERE uid = %s", (uid,))
        user_mode_result = cursor.fetchone()
        user_mode = user_mode_result["availability"] if user_mode_result else None
        
        mode_mapping = {
            'Online': 'Remote',
            'Offline': 'Onsite',
            'Hybrid': 'Hybrid'
        }
        
        job_mode = job["mode_of_work"]
        job_mode_mapped = mode_mapping.get(job_mode, job_mode)
        
        mode_match = 1 if user_mode and user_mode == job_mode_mapped else 0
        
        # --- Prepare features for prediction ---
        features = [[
            skill_match,
            exp_gap,
            location_match,
            education_match,
            job_type_match,
            mode_match
        ]]
        
        # --- Make prediction ---
        label = int(model.predict(features)[0])
        probability = model.predict_proba(features)[0].tolist()
        
        # --- Prepare feature data for feedback ---
        features_data = {
            "skill_match": skill_match,
            "experience_gap": exp_gap,
            "location_match": location_match,
            "education_match": education_match,
            "job_type_match": job_type_match,
            "mode_match": mode_match
        }
        
        # --- Generate user feedback ---
        prediction_data = {
            "prediction": {
                "label": label,
                "probability": probability
            }
        }
        
        user_feedback = generate_applicant_feedback(prediction_data, features_data)
        
        return jsonify({
            "uid": uid,
            "jobid": jobid,
            "prediction": {
                "label": label,
                "probability": probability
            },
            "user_feedback": user_feedback,
            "features": {
                "skill_match": skill_match,
                "experience_gap": exp_gap,
                "location_match": location_match,
                "education_match": education_match,
                "job_type_match": job_type_match,
                "mode_match": mode_match
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()