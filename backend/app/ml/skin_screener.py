import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, Any, List

MODELS_DIR = os.path.join(os.path.dirname(__file__), "../../data/models")
SKIN_MODEL_PATH = os.path.join(MODELS_DIR, "skin_screener.joblib")

SKIN_FEATURES = [
    "asymmetry",          # 0 = symmetrical, 1 = asymmetrical
    "border_irregular",   # 0 = smooth/even, 1 = irregular/notched/ragged
    "color_variation",    # 0 = uniform color, 1 = multiple shades (brown, black, red, white)
    "diameter_gt_6mm",    # 0 = smaller than pencil eraser (6mm), 1 = larger than 6mm
    "evolving",           # 0 = stable over time, 1 = changing in size, shape, or color
    "itching_or_pain",    # 0 = none, 1 = itchy, tender, or painful
    "bleeding_or_crust",  # 0 = intact skin, 1 = oozing, bleeding, or crusting
    "new_lesion",         # 0 = existing long term, 1 = recently appeared (< 3 months)
]


class SkinLesionScreener:
    def __init__(self):
        self.model = None
        self.classes = ["Low Risk - Benign Pattern", "Moderate Risk - Monitor & Observe", "High Risk - Urgent Dermatologist Evaluation Required"]
        self._ensure_model_loaded()

    def _ensure_model_loaded(self):
        if self.model is None:
            if os.path.exists(SKIN_MODEL_PATH):
                try:
                    bundle = joblib.load(SKIN_MODEL_PATH)
                    self.model = bundle["model"]
                    self.classes = bundle["classes"]
                    return
                except Exception as e:
                    print(f"Error loading skin screener model: {e}. Retraining synthetic ABCDE baseline...")
            self.train_and_save()

    def train_and_save(self):
        print("Training Lightweight Dermatological ABCDE Risk Screener...")
        # Generate 1,500 synthetic ABCDE clinical training profiles
        np.random.seed(42)
        X_data = []
        y_data = []
        
        # 1. Benign moles / seborrheic keratoses (Low Risk)
        for _ in range(700):
            row = [
                np.random.choice([0, 1], p=[0.90, 0.10]), # asymmetry
                np.random.choice([0, 1], p=[0.92, 0.08]), # border
                np.random.choice([0, 1], p=[0.85, 0.15]), # color
                np.random.choice([0, 1], p=[0.88, 0.12]), # diameter
                np.random.choice([0, 1], p=[0.95, 0.05]), # evolving
                np.random.choice([0, 1], p=[0.80, 0.20]), # itching
                np.random.choice([0, 1], p=[0.98, 0.02]), # bleeding
                np.random.choice([0, 1], p=[0.70, 0.30]), # new
            ]
            X_data.append(row)
            y_data.append("Low Risk - Benign Pattern")
            
        # 2. Atypical / Dysplastic nevi (Moderate Risk)
        for _ in range(450):
            row = [
                np.random.choice([0, 1], p=[0.50, 0.50]), # asymmetry
                np.random.choice([0, 1], p=[0.40, 0.60]), # border
                np.random.choice([0, 1], p=[0.45, 0.55]), # color
                np.random.choice([0, 1], p=[0.70, 0.30]), # diameter
                np.random.choice([0, 1], p=[0.60, 0.40]), # evolving
                np.random.choice([0, 1], p=[0.50, 0.50]), # itching
                np.random.choice([0, 1], p=[0.90, 0.10]), # bleeding
                np.random.choice([0, 1], p=[0.40, 0.60]), # new
            ]
            X_data.append(row)
            y_data.append("Moderate Risk - Monitor & Observe")
            
        # 3. Melanoma / Carcinoma clinical alert profiles (High Risk)
        for _ in range(350):
            row = [
                np.random.choice([0, 1], p=[0.10, 0.90]), # asymmetry
                np.random.choice([0, 1], p=[0.08, 0.92]), # border
                np.random.choice([0, 1], p=[0.15, 0.85]), # color
                np.random.choice([0, 1], p=[0.20, 0.80]), # diameter
                np.random.choice([0, 1], p=[0.05, 0.95]), # evolving
                np.random.choice([0, 1], p=[0.40, 0.60]), # itching
                np.random.choice([0, 1], p=[0.30, 0.70]), # bleeding
                np.random.choice([0, 1], p=[0.15, 0.85]), # new
            ]
            X_data.append(row)
            y_data.append("High Risk - Urgent Dermatologist Evaluation Required")

        df_X = pd.DataFrame(X_data, columns=SKIN_FEATURES)
        
        try:
            from lightgbm import LGBMClassifier
            self.model = LGBMClassifier(n_estimators=100, max_depth=6, learning_rate=0.08, random_state=42, verbose=-1)
        except Exception:
            self.model = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
            
        self.model.fit(df_X, y_data)
        self.classes = list(self.model.classes_)
        
        os.makedirs(MODELS_DIR, exist_ok=True)
        joblib.dump({"model": self.model, "classes": self.classes}, SKIN_MODEL_PATH)
        print("Skin screener model trained and saved.")

    def evaluate(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        self._ensure_model_loaded()
        row = {}
        for feat in SKIN_FEATURES:
            row[feat] = 1 if features_dict.get(feat) else 0
            
        df_input = pd.DataFrame([row], columns=SKIN_FEATURES)
        probs = self.model.predict_proba(df_input)[0]
        top_idx = np.argmax(probs)
        predicted_risk = self.classes[top_idx]
        confidence = float(probs[top_idx])
        
        # Calculate feature attribution breakdown
        contributions = []
        labels_map = {
            "asymmetry": "Asymmetrical shape (A)",
            "border_irregular": "Irregular or jagged borders (B)",
            "color_variation": "Multiple colors or uneven shading (C)",
            "diameter_gt_6mm": "Diameter larger than 6mm / pencil eraser (D)",
            "evolving": "Changing in size, shape, or color over time (E)",
            "itching_or_pain": "Active itching, tenderness, or pain",
            "bleeding_or_crust": "Oozing, bleeding, or crusting surface",
            "new_lesion": "Recently appeared new lesion (< 3 months)"
        }
        
        if hasattr(self.model, "feature_importances_"):
            importances = self.model.feature_importances_
            for idx, feat in enumerate(SKIN_FEATURES):
                if row[feat] == 1:
                    contributions.append({
                        "feature": feat,
                        "label": labels_map.get(feat, feat),
                        "importance": round(float(importances[idx]) * 100, 1),
                        "present": True
                    })
        contributions.sort(key=lambda x: x["importance"], reverse=True)
        
        return {
            "risk_level": predicted_risk,
            "confidence": round(confidence, 2),
            "abcde_score": sum(row.values()),
            "key_risk_factors": contributions[:4],
            "recommendation": "If any lesion is evolving, bleeding, or asymmetrical, please schedule an in-person dermatology exam immediately.",
            "disclaimer": "This tool uses clinical ABCDE screening heuristics for preliminary educational risk assessment and does not constitute a definitive dermatological diagnosis."
        }


skin_screener = SkinLesionScreener()
