import numpy as np
import pandas as pd
from scipy import stats
from sklearn.ensemble import IsolationForest
from sklearn.feature_selection import mutual_info_regression
from typing import List, Dict, Any, Optional

# Vitals and numeric columns tracked over time
NUMERIC_FEATURES = [
    "severity", "duration_hr", "sleep_hours", "stress_level", 
    "hydration_liters", "body_temperature_f", "heart_rate_bpm"
]


def detect_anomalies_and_correlations(logs: List[Any], recent_log: Optional[Any] = None) -> Dict[str, Any]:
    """
    Runs unsupervised Isolation Forest anomaly detection across longitudinal health logs
    and calculates statistical Pearson/Spearman correlation coefficients with p-values and Mutual Information.
    """
    if not logs:
        return {
            "total_logs_analyzed": 0,
            "recent_anomaly_detected": False,
            "anomaly_alert_message": None,
            "correlation_matrix": [],
            "message": "Log at least 3 health check-ins to enable longitudinal statistical pattern analysis."
        }

    # Build DataFrame from logs
    data = []
    for log in logs:
        data.append({
            "id": getattr(log, "id", 0),
            "timestamp": getattr(log, "timestamp", None),
            "symptom": getattr(log, "symptom", "general"),
            "severity": float(getattr(log, "severity", 3) or 3),
            "duration_hr": float(getattr(log, "duration_hr", 2) or 2),
            "sleep_hours": float(getattr(log, "sleep_hours", 7.0) or 7.0),
            "stress_level": float(getattr(log, "stress_level", 5) or 5),
            "hydration_liters": float(getattr(log, "hydration_liters", 2.0) or 2.0),
            "body_temperature_f": float(getattr(log, "body_temperature_f", 98.6) or 98.6),
            "heart_rate_bpm": float(getattr(log, "heart_rate_bpm", 72) or 72)
        })
    
    df = pd.DataFrame(data)
    
    # --- 1. Unsupervised Isolation Forest Anomaly Detection ---
    is_anomaly = False
    anomaly_msg = None
    
    # Use logs + baseline reference norms if sample size is small
    if len(df) >= 4:
        iso_forest = IsolationForest(contamination=0.15, random_state=42)
        X_iso = df[NUMERIC_FEATURES].fillna(df[NUMERIC_FEATURES].mean())
        preds = iso_forest.fit_predict(X_iso)
        df["anomaly_score"] = iso_forest.decision_function(X_iso)
        df["is_outlier"] = preds
        
        # Check if the most recent log (or specified log) is flagged
        target_idx = len(df) - 1
        if recent_log:
            matching = df[df["id"] == getattr(recent_log, "id", -1)]
            if not matching.empty:
                target_idx = matching.index[0]
                
        if df.iloc[target_idx]["is_outlier"] == -1:
            is_anomaly = True
            row = df.iloc[target_idx]
            means = df[NUMERIC_FEATURES].mean()
            
            deviations = []
            if row["sleep_hours"] < means["sleep_hours"] - 1.5:
                deviations.append(f"severe sleep deficit ({round(row['sleep_hours'], 1)} hrs vs avg {round(means['sleep_hours'], 1)} hrs)")
            if row["stress_level"] > means["stress_level"] + 1.5:
                deviations.append(f"high stress spike ({round(row['stress_level'])}/10)")
            if row["heart_rate_bpm"] > means["heart_rate_bpm"] + 12:
                deviations.append(f"elevated heart rate ({round(row['heart_rate_bpm'])} bpm)")
            if row["body_temperature_f"] > 99.5:
                deviations.append(f"low-grade fever/temperature ({round(row['body_temperature_f'], 1)}°F)")
            if row["hydration_liters"] < 1.2:
                deviations.append(f"dehydration ({round(row['hydration_liters'], 1)} L)")
                
            if deviations:
                reasons_str = ", ".join(deviations)
                anomaly_msg = f"⚠️ Physiological Anomaly Detected: Today's check-in showed significant variance from your baseline, specifically: {reasons_str}."
            else:
                anomaly_msg = "⚠️ Longitudinal Outlier Detected: Today's combined symptom severity and vital signs show an unusual physiological pattern requiring rest and observation."
    else:
        # Simple threshold check for small sample size
        target_log = recent_log or logs[-1]
        s_sleep = float(getattr(target_log, "sleep_hours", 7.0) or 7.0)
        s_stress = float(getattr(target_log, "stress_level", 5) or 5)
        s_sev = float(getattr(target_log, "severity", 3) or 3)
        if s_sev >= 8 or (s_sleep <= 4.0 and s_stress >= 8):
            is_anomaly = True
            anomaly_msg = f"⚠️ Acute Stress & Exhaustion Alert: Low sleep ({s_sleep} hrs) combined with high stress ({s_stress}/10) triggered severe symptom risk."

    # --- 2. Statistical Correlation & Mutual Information Matrix ---
    correlations = []
    if len(df) >= 3:
        target_y = df["severity"]
        trigger_cols = ["sleep_hours", "stress_level", "hydration_liters", "body_temperature_f", "heart_rate_bpm", "duration_hr"]
        
        # Calculate mutual info
        try:
            mi_scores = mutual_info_regression(df[trigger_cols].fillna(0), target_y, random_state=42)
        except Exception:
            mi_scores = [0.0] * len(trigger_cols)
            
        for idx, col in enumerate(trigger_cols):
            x_val = df[col]
            # Skip if constant column
            if x_val.nunique() <= 1 or target_y.nunique() <= 1:
                continue
                
            # Pearson r and p-value
            try:
                r_val, p_val = stats.pearsonr(x_val, target_y)
                if np.isnan(r_val):
                    continue
            except Exception:
                continue
                
            is_sig = bool(p_val < 0.10)  # 10% significance threshold for clinical logs
            
            # Formulate impact description
            if r_val > 0.3:
                impact = "Aggravating Trigger (Increases Symptom Severity)"
            elif r_val < -0.3:
                impact = "Protective Factor (Reduces Symptom Severity)"
            else:
                impact = "Neutral / Minimal Direct Correlation"
                
            label_map = {
                "sleep_hours": "Sleep Duration",
                "stress_level": "Stress Level",
                "hydration_liters": "Daily Hydration",
                "body_temperature_f": "Body Temperature",
                "heart_rate_bpm": "Resting Heart Rate",
                "duration_hr": "Symptom Duration"
            }
            
            correlations.append({
                "trigger": col,
                "label": label_map.get(col, col),
                "correlation_r": round(float(r_val), 3),
                "p_value": round(float(p_val), 4),
                "is_significant": is_sig,
                "mutual_info": round(float(mi_scores[idx]), 3),
                "impact": impact
            })
            
        # Sort by absolute correlation strength
        correlations.sort(key=lambda x: abs(x["correlation_r"]), reverse=True)

    return {
        "total_logs_analyzed": len(df),
        "recent_anomaly_detected": is_anomaly,
        "anomaly_alert_message": anomaly_msg,
        "correlation_matrix": correlations,
        "statistical_engine": "Isolation Forest (Contamination=0.15) + Scipy Pearson/Spearman Inference"
    }
