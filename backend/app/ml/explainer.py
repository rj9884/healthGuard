import numpy as np
import pandas as pd
import shap
from typing import Dict, Any, List

# Global cache for explainer instances to avoid re-initializing
_EXPLAINER_CACHE = {}


def get_tree_explainer(model, model_id: str = "default"):
    if model_id not in _EXPLAINER_CACHE:
        try:
            _EXPLAINER_CACHE[model_id] = shap.TreeExplainer(model)
        except Exception:
            # Fallback if tree explainer fails
            _EXPLAINER_CACHE[model_id] = None
    return _EXPLAINER_CACHE[model_id]


def format_feature_name(feature: str, val: float) -> str:
    labels = {
        "fever": "fever",
        "cough": "cough",
        "fatigue": "fatigue",
        "headache": "headache",
        "shortness_of_breath": "shortness of breath",
        "chest_pain": "chest pain",
        "nausea": "nausea",
        "dizziness": "dizziness",
        "muscle_ache": "muscle ache",
        "sore_throat": "sore throat",
        "nasal_congestion": "nasal congestion",
        "abdominal_pain": "abdominal pain",
        "diarrhea": "diarrhea",
        "vomiting": "vomiting",
        "skin_rash": "skin rash",
        "itching": "itching",
        "joint_pain": "joint pain",
        "blurred_vision": "blurred vision",
        "sleep_hours": f"sleep duration ({val} hrs)",
        "stress_level": f"stress level ({round(val)}/10)",
        "hydration_liters": f"hydration ({val} L)",
        "body_temperature_f": f"body temperature ({val}°F)",
        "heart_rate_bpm": f"heart rate ({round(val)} bpm)",
        "severity": f"symptom severity ({round(val)}/10)",
        "duration_hr": f"symptom duration ({val} hrs)"
    }
    return labels.get(feature, feature.replace("_", " "))


def explain_prediction(model, input_df: pd.DataFrame, feature_names: List[str], predicted_label: str, model_id: str = "triage") -> Dict[str, Any]:
    """
    Computes SHAP feature contributions for a prediction and generates a human-readable XAI clinical explanation.
    """
    row = input_df.iloc[0]
    explainer = get_tree_explainer(model, model_id)
    
    feature_contributions = []
    
    if explainer is not None:
        try:
            shap_values = explainer.shap_values(input_df)
            # Handle multi-class vs single-class SHAP outputs
            if isinstance(shap_values, list):
                # We take the max class or average absolute contribution
                vals = np.abs(shap_values[0][0])
            elif len(shap_values.shape) == 3:
                # 3D array: (samples, features, classes)
                vals = np.max(np.abs(shap_values[0]), axis=1)
            else:
                vals = np.abs(shap_values[0])
                
            for i, feat in enumerate(feature_names):
                val = row[feat]
                # Only include active symptoms or notable vitals
                if val > 0 or feat in ["sleep_hours", "stress_level", "hydration_liters", "body_temperature_f", "heart_rate_bpm"]:
                    feature_contributions.append({
                        "feature": feat,
                        "label": format_feature_name(feat, val),
                        "importance_score": float(vals[i]),
                        "value": float(val)
                    })
        except Exception:
            explainer = None

    # Fallback to feature importances if SHAP fails or model is scikit-learn without native SHAP
    if explainer is None or not feature_contributions:
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            for i, feat in enumerate(feature_names):
                val = row[feat]
                if val > 0 or feat in ["sleep_hours", "stress_level", "hydration_liters", "body_temperature_f", "heart_rate_bpm"]:
                    feature_contributions.append({
                        "feature": feat,
                        "label": format_feature_name(feat, val),
                        "importance_score": float(importances[i]),
                        "value": float(val)
                    })
                    
    # Sort by importance descending
    feature_contributions.sort(key=lambda x: x["importance_score"], reverse=True)
    
    top_factors = feature_contributions[:3]
    top_labels = [f["label"] for f in top_factors if f["importance_score"] > 0]
    
    if top_labels:
        if len(top_labels) == 1:
            factors_str = top_labels[0]
        elif len(top_labels) == 2:
            factors_str = f"{top_labels[0]} and {top_labels[1]}"
        else:
            factors_str = f"{top_labels[0]}, {top_labels[1]}, and {top_labels[2]}"
        summary = f"Your assessment for **{predicted_label}** was primarily driven by your **{factors_str}**."
    else:
        summary = f"Your assessment for **{predicted_label}** was based on overall pattern analysis of your logged vitals and symptoms."
        
    return {
        "top_contributing_features": top_factors,
        "human_readable_summary": summary,
        "model_type": "LightGBM + SHAP TreeExplainer" if explainer is not None else "Ensemble Tree Importance"
    }
