from flask import Blueprint, request, jsonify
from db import get_db
import joblib
import os
import json
#regressor
regressor_bp = Blueprint("regressor", __name__)

# Model path
MODEL_PATH = os.path.join("models", "final.pkl")
model = None

def load_model():
    """Lazy load the model to handle import errors gracefully"""
    global model
    if model is None:
        try:
            import warnings
            warnings.filterwarnings('ignore', category=UserWarning)
            model = joblib.load(MODEL_PATH)
        except Exception as e:
            raise Exception(f"Model loading failed - please retrain the model. Error: {str(e)}")
    return model

@regressor_bp.route("/regressor-ML", methods=["POST"])
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
        applicant_exp_result = cursor.fetchone()
        applicant_exp = applicant_exp_result["exp_years"] if applicant_exp_result else 0
        
        # --- Job details ---
        cursor.execute("""
            SELECT experience_min, skillids, lid, qualification, job_type, mode_of_work 
            FROM jobs WHERE jobid = %s
        """, (jobid,))
        job = cursor.fetchone()
        
        if not job:
            return jsonify({"error": "Job not found"}), 404
            
        job_exp_min = job["experience_min"] or 0
        
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
                    job_skills = [int(s.strip()) for s in job_skills_raw.split(",") if s.strip().isdigit()]
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
        try:
            current_model = load_model()
            prediction_label = float(current_model.predict(features)[0])
            
        except Exception as model_error:
            return jsonify({"error": f"Model prediction failed: {str(model_error)}"}), 500
        
        # --- Update the regressor table ---
        cursor.execute("""
            INSERT INTO regressor (uid, jobid, skill_match, experience_gap, location_match, 
                                   education_match, job_type_match, mode_match, label)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                skill_match = VALUES(skill_match),
                experience_gap = VALUES(experience_gap),
                location_match = VALUES(location_match),
                education_match = VALUES(education_match),
                job_type_match = VALUES(job_type_match),
                mode_match = VALUES(mode_match),
                label = VALUES(label)
        """, (
            uid, jobid, skill_match, exp_gap, location_match,
            education_match, job_type_match, mode_match, prediction_label
        ))
        conn.commit()
        
        # --- Return prediction results ---
        response = {
            "uid": int(uid),
            "jobid": int(jobid),
            "features": {
                "skill_match": round(skill_match, 2),
                "experience_gap": round(exp_gap, 2),
                "location_match": location_match,
                "education_match": education_match,
                "job_type_match": job_type_match,
                "mode_match": mode_match
            },
            "prediction": {
                "label": round(prediction_label, 2),
            },
            "status": "success"
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()