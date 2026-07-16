import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, Any

from app.ml.data_loader import FEATURE_COLUMNS, load_clinical_data, prepare_input_vector
from app.ml.explainer import explain_prediction

MODELS_DIR = os.path.join(os.path.dirname(__file__), "../../data/models")
DISEASE_MODEL_PATH = os.path.join(MODELS_DIR, "disease_classifier.joblib")
TRIAGE_MODEL_PATH = os.path.join(MODELS_DIR, "triage_classifier.joblib")


class ClinicalTriageClassifier:
    def __init__(self):
        self.disease_model = None
        self.triage_model = None
        self.disease_classes = []
        self.triage_classes = []
        self._ensure_models_loaded()

    def _ensure_models_loaded(self):
        if self.disease_model is None or self.triage_model is None:
            if os.path.exists(DISEASE_MODEL_PATH) and os.path.exists(TRIAGE_MODEL_PATH):
                try:
                    disease_bundle = joblib.load(DISEASE_MODEL_PATH)
                    triage_bundle = joblib.load(TRIAGE_MODEL_PATH)
                    self.disease_model = disease_bundle["model"]
                    self.disease_classes = disease_bundle["classes"]
                    self.triage_model = triage_bundle["model"]
                    self.triage_classes = triage_bundle["classes"]
                    return
                except Exception as e:
                    print(f"Error loading saved models: {e}. Retraining...")
            # If not saved or failed to load, train immediately
            self.train_and_save()

    def train_and_save(self):
        print("Training Clinical Triage & Risk ML Models on real dataset...")
        df = load_clinical_data()
        X = df[FEATURE_COLUMNS]
        y_disease = df["disease_category"]
        y_triage = df["triage_level"]

        # Try LightGBM first, fallback to RandomForest for 100% container compatibility
        try:
            from lightgbm import LGBMClassifier
            self.disease_model = LGBMClassifier(n_estimators=120, max_depth=8, learning_rate=0.08, random_state=42, verbose=-1)
            self.triage_model = LGBMClassifier(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42, verbose=-1)
        except Exception:
            self.disease_model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
            self.triage_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)

        self.disease_model.fit(X, y_disease)
        self.triage_model.fit(X, y_triage)

        self.disease_classes = list(self.disease_model.classes_)
        self.triage_classes = list(self.triage_model.classes_)

        os.makedirs(MODELS_DIR, exist_ok=True)
        joblib.dump({"model": self.disease_model, "classes": self.disease_classes}, DISEASE_MODEL_PATH)
        joblib.dump({"model": self.triage_model, "classes": self.triage_classes}, TRIAGE_MODEL_PATH)
        print("Models successfully trained and saved to", MODELS_DIR)

    def predict(self, symptoms_dict: Dict[str, Any], vitals_dict: Dict[str, Any]) -> Dict[str, Any]:
        self._ensure_models_loaded()
        input_df = prepare_input_vector(symptoms_dict, vitals_dict)

        # Disease prediction & probabilities
        disease_probs = self.disease_model.predict_proba(input_df)[0]
        top_disease_idx = np.argmax(disease_probs)
        predicted_disease = self.disease_classes[top_disease_idx]
        disease_conf = float(disease_probs[top_disease_idx])

        # Top 3 disease categories
        top_indices = np.argsort(disease_probs)[::-1][:3]
        top_risk_categories = [
            {"category": self.disease_classes[idx], "probability": round(float(disease_probs[idx]), 3)}
            for idx in top_indices if disease_probs[idx] > 0.01
        ]

        # Triage prediction
        triage_probs = self.triage_model.predict_proba(input_df)[0]
        top_triage_idx = np.argmax(triage_probs)
        predicted_triage = self.triage_classes[top_triage_idx]
        triage_conf = float(triage_probs[top_triage_idx])

        # SHAP Explainability
        shap_explanation = explain_prediction(self.disease_model, input_df, FEATURE_COLUMNS, predicted_disease, model_id="disease_lgbm")

        return {
            "predicted_disease_category": predicted_disease,
            "disease_confidence": round(disease_conf, 2),
            "triage_level": predicted_triage,
            "triage_confidence": round(triage_conf, 2),
            "top_risk_categories": top_risk_categories,
            "shap_explanation": shap_explanation
        }


# Singleton instance
triage_classifier = ClinicalTriageClassifier()
