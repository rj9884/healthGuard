import os
import numpy as np
import pandas as pd

# Set random seed for reproducibility
np.random.seed(42)

DISEASE_PROFILES = [
    {
        "category": "Respiratory Infection (Flu/COVID)",
        "triage": "Urgent Doctor",
        "symptoms": {"fever": 0.85, "cough": 0.90, "fatigue": 0.80, "sore_throat": 0.60, "nasal_congestion": 0.50, "shortness_of_breath": 0.40, "headache": 0.60, "muscle_ache": 0.70},
        "vitals": {"sleep": (5.5, 1.5), "stress": (6.0, 1.8), "hydration": (1.8, 0.5), "temp": (101.2, 1.1), "hr": (88, 12), "severity": (7, 1.5), "duration": (72, 36)}
    },
    {
        "category": "Cardiovascular Alert (Angina/Arrhythmia)",
        "triage": "Emergency",
        "symptoms": {"chest_pain": 0.95, "shortness_of_breath": 0.85, "dizziness": 0.70, "fatigue": 0.75, "nausea": 0.40, "blurred_vision": 0.30},
        "vitals": {"sleep": (5.0, 1.5), "stress": (8.5, 1.2), "hydration": (1.5, 0.4), "temp": (98.8, 0.5), "hr": (108, 18), "severity": (9, 1.0), "duration": (4, 3)}
    },
    {
        "category": "Severe Migraine / Neurological",
        "triage": "Urgent Doctor",
        "symptoms": {"headache": 0.98, "blurred_vision": 0.65, "nausea": 0.70, "dizziness": 0.60, "fatigue": 0.80},
        "vitals": {"sleep": (4.5, 1.2), "stress": (8.0, 1.5), "hydration": (1.2, 0.4), "temp": (98.6, 0.4), "hr": (78, 10), "severity": (8, 1.2), "duration": (18, 12)}
    },
    {
        "category": "Gastrointestinal Disorder (IBS/Reflux)",
        "triage": "Routine Checkup",
        "symptoms": {"abdominal_pain": 0.90, "nausea": 0.60, "diarrhea": 0.50, "vomiting": 0.30, "fatigue": 0.50},
        "vitals": {"sleep": (6.5, 1.2), "stress": (7.0, 1.5), "hydration": (1.6, 0.5), "temp": (98.7, 0.4), "hr": (74, 8), "severity": (5, 1.5), "duration": (48, 24)}
    },
    {
        "category": "Metabolic / Diabetes Risk Alert",
        "triage": "Routine Checkup",
        "symptoms": {"fatigue": 0.85, "blurred_vision": 0.55, "dizziness": 0.50, "muscle_ache": 0.40},
        "vitals": {"sleep": (6.0, 1.5), "stress": (6.5, 1.5), "hydration": (3.2, 0.8), "temp": (98.5, 0.4), "hr": (76, 8), "severity": (5, 1.2), "duration": (120, 48)}
    },
    {
        "category": "Dermatological Infection / Allergic Reaction",
        "triage": "Routine Checkup",
        "symptoms": {"skin_rash": 0.95, "itching": 0.90, "joint_pain": 0.30, "fever": 0.20},
        "vitals": {"sleep": (6.8, 1.1), "stress": (5.5, 1.8), "hydration": (2.0, 0.5), "temp": (99.1, 0.6), "hr": (75, 8), "severity": (6, 1.5), "duration": (72, 36)}
    },
    {
        "category": "Musculoskeletal Strain & Arthritis",
        "triage": "Routine Checkup",
        "symptoms": {"joint_pain": 0.90, "muscle_ache": 0.95, "fatigue": 0.60, "headache": 0.30},
        "vitals": {"sleep": (6.5, 1.2), "stress": (6.0, 1.5), "hydration": (1.9, 0.5), "temp": (98.6, 0.3), "hr": (73, 7), "severity": (6, 1.5), "duration": (96, 48)}
    },
    {
        "category": "Anxiety & Panic Attack",
        "triage": "Urgent Doctor",
        "symptoms": {"shortness_of_breath": 0.80, "chest_pain": 0.60, "dizziness": 0.75, "headache": 0.50, "fatigue": 0.70},
        "vitals": {"sleep": (4.8, 1.3), "stress": (9.2, 0.8), "hydration": (1.5, 0.5), "temp": (98.6, 0.4), "hr": (102, 14), "severity": (8, 1.2), "duration": (3, 2)}
    },
    {
        "category": "Viral Gastroenteritis (Stomach Flu)",
        "triage": "Urgent Doctor",
        "symptoms": {"vomiting": 0.85, "diarrhea": 0.90, "abdominal_pain": 0.95, "fever": 0.65, "nausea": 0.95, "fatigue": 0.85},
        "vitals": {"sleep": (5.2, 1.5), "stress": (7.5, 1.4), "hydration": (1.1, 0.4), "temp": (100.8, 0.9), "hr": (92, 12), "severity": (8, 1.3), "duration": (48, 24)}
    },
    {
        "category": "Upper Respiratory Infection (Common Cold)",
        "triage": "Self-Care",
        "symptoms": {"nasal_congestion": 0.95, "sore_throat": 0.85, "cough": 0.70, "fatigue": 0.50, "headache": 0.40},
        "vitals": {"sleep": (7.0, 1.0), "stress": (4.5, 1.5), "hydration": (2.2, 0.5), "temp": (99.2, 0.5), "hr": (76, 8), "severity": (4, 1.2), "duration": (72, 24)}
    },
    {
        "category": "Chronic Fatigue & Occupational Burnout",
        "triage": "Routine Checkup",
        "symptoms": {"fatigue": 0.98, "headache": 0.65, "muscle_ache": 0.55, "dizziness": 0.45, "blurred_vision": 0.35},
        "vitals": {"sleep": (4.2, 1.0), "stress": (9.0, 1.0), "hydration": (1.4, 0.5), "temp": (98.5, 0.3), "hr": (78, 10), "severity": (7, 1.3), "duration": (168, 72)}
    },
    {
        "category": "Acute Dehydration / Electrolyte Alert",
        "triage": "Urgent Doctor",
        "symptoms": {"dizziness": 0.90, "muscle_ache": 0.80, "fatigue": 0.85, "headache": 0.70, "nausea": 0.50},
        "vitals": {"sleep": (6.0, 1.5), "stress": (6.5, 1.8), "hydration": (0.7, 0.3), "temp": (99.0, 0.6), "hr": (98, 14), "severity": (7, 1.4), "duration": (12, 8)}
    },
    {
        "category": "Sinusitis / Facial Congestion",
        "triage": "Self-Care",
        "symptoms": {"headache": 0.85, "nasal_congestion": 0.95, "sore_throat": 0.50, "fatigue": 0.60, "fever": 0.30},
        "vitals": {"sleep": (6.5, 1.1), "stress": (5.0, 1.5), "hydration": (2.0, 0.5), "temp": (99.4, 0.5), "hr": (76, 7), "severity": (5, 1.2), "duration": (96, 36)}
    },
    {
        "category": "Acute Insomnia & Sleep Deprivation",
        "triage": "Self-Care",
        "symptoms": {"fatigue": 0.95, "headache": 0.75, "dizziness": 0.50, "blurred_vision": 0.45},
        "vitals": {"sleep": (3.5, 0.8), "stress": (8.5, 1.2), "hydration": (1.5, 0.5), "temp": (98.6, 0.3), "hr": (82, 10), "severity": (6, 1.3), "duration": (48, 24)}
    },
    {
        "category": "General Wellness / Normal Health State",
        "triage": "Self-Care",
        "symptoms": {"fatigue": 0.15, "headache": 0.10, "nasal_congestion": 0.10},
        "vitals": {"sleep": (7.5, 0.8), "stress": (3.5, 1.5), "hydration": (2.5, 0.5), "temp": (98.6, 0.3), "hr": (71, 6), "severity": (2, 0.8), "duration": (2, 1)}
    }
]

ALL_SYMPTOMS = [
    "fever", "cough", "fatigue", "headache", "shortness_of_breath", "chest_pain", 
    "nausea", "dizziness", "muscle_ache", "sore_throat", "nasal_congestion", 
    "abdominal_pain", "diarrhea", "vomiting", "skin_rash", "itching", 
    "joint_pain", "blurred_vision"
]


def generate_clinical_dataset(num_records: int = 4500, output_path: str = None):
    if output_path is None:
        output_path = os.path.join(os.path.dirname(__file__), "../../data/clinical_symptom_dataset.csv")
    rows = []
    num_profiles = len(DISEASE_PROFILES)
    records_per_profile = num_records // num_profiles
    
    for profile in DISEASE_PROFILES:
        for _ in range(records_per_profile):
            row = {}
            # Binary symptoms (1 = present, 0 = absent) based on probability
            for sym in ALL_SYMPTOMS:
                prob = profile["symptoms"].get(sym, 0.05)
                row[sym] = 1 if np.random.random() < prob else 0
            
            # Vitals & Biometrics with normal noise
            v_sleep = np.random.normal(profile["vitals"]["sleep"][0], profile["vitals"]["sleep"][1])
            row["sleep_hours"] = np.clip(round(v_sleep, 1), 1.0, 14.0)
            
            v_stress = np.random.normal(profile["vitals"]["stress"][0], profile["vitals"]["stress"][1])
            row["stress_level"] = int(np.clip(round(v_stress), 1, 10))
            
            v_hyd = np.random.normal(profile["vitals"]["hydration"][0], profile["vitals"]["hydration"][1])
            row["hydration_liters"] = np.clip(round(v_hyd, 2), 0.2, 6.0)
            
            v_temp = np.random.normal(profile["vitals"]["temp"][0], profile["vitals"]["temp"][1])
            row["body_temperature_f"] = np.clip(round(v_temp, 1), 96.0, 106.0)
            
            v_hr = np.random.normal(profile["vitals"]["hr"][0], profile["vitals"]["hr"][1])
            row["heart_rate_bpm"] = int(np.clip(round(v_hr), 45, 180))
            
            v_sev = np.random.normal(profile["vitals"]["severity"][0], profile["vitals"]["severity"][1])
            row["severity"] = int(np.clip(round(v_sev), 1, 10))
            
            v_dur = np.random.normal(profile["vitals"]["duration"][0], profile["vitals"]["duration"][1])
            row["duration_hr"] = np.clip(round(v_dur, 1), 0.5, 336.0)
            
            row["disease_category"] = profile["category"]
            row["triage_level"] = profile["triage"]
            
            rows.append(row)
            
    df = pd.DataFrame(rows)
    # Shuffle dataset
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Successfully generated {len(df)} clinical symptom records at {output_path}")
    return df


if __name__ == "__main__":
    generate_clinical_dataset()
