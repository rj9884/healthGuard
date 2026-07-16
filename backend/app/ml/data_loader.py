import os
import pandas as pd
from sklearn.model_selection import train_test_split

DATASET_PATH = os.path.join(os.path.dirname(__file__), "../../data/clinical_symptom_dataset.csv")
FEATURE_COLUMNS = [
    "fever", "cough", "fatigue", "headache", "shortness_of_breath", "chest_pain", 
    "nausea", "dizziness", "muscle_ache", "sore_throat", "nasal_congestion", 
    "abdominal_pain", "diarrhea", "vomiting", "skin_rash", "itching", 
    "joint_pain", "blurred_vision", "sleep_hours", "stress_level", 
    "hydration_liters", "body_temperature_f", "heart_rate_bpm", "severity", "duration_hr"
]


def load_clinical_data():
    if not os.path.exists(DATASET_PATH):
        from app.ml.dataset_generator import generate_clinical_dataset
        generate_clinical_dataset(output_path=DATASET_PATH)

    df = pd.read_csv(DATASET_PATH)
    return df


def get_train_test_splits(target_col: str = "disease_category", test_size: float = 0.2, random_state: int = 42):
    df = load_clinical_data()
    X = df[FEATURE_COLUMNS]
    y = df[target_col]
    return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)


def prepare_input_vector(symptoms_dict: dict, vitals_dict: dict) -> pd.DataFrame:
    """
    Converts user input dictionaries into a single-row DataFrame matching FEATURE_COLUMNS.
    """
    row = {}
    for col in FEATURE_COLUMNS:
        if col in symptoms_dict:
            row[col] = 1 if symptoms_dict[col] else 0
        elif col in vitals_dict:
            row[col] = float(vitals_dict[col])
        else:
            # Default values for missing vitals/symptoms
            defaults = {
                "sleep_hours": 7.0,
                "stress_level": 5.0,
                "hydration_liters": 2.0,
                "body_temperature_f": 98.6,
                "heart_rate_bpm": 72.0,
                "severity": 3.0,
                "duration_hr": 2.0
            }
            row[col] = defaults.get(col, 0)
            
    return pd.DataFrame([row], columns=FEATURE_COLUMNS)
