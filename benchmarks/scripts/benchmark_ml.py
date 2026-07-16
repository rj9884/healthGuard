import os
import sys
import time
import json
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, precision_recall_fscore_support

# Adjust path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.ml.data_loader import load_clinical_data, FEATURE_COLUMNS, get_train_test_splits
from app.ml.triage_model import triage_classifier
from app.ml.skin_screener import skin_screener
from app.ml.explainer import explain_prediction

def run_ml_benchmark():
    print("=== Starting HealthGuard ML Benchmark ===")
    
    # 1. Evaluate Clinical Triage and Disease Classification
    df = load_clinical_data()
    print(f"Loaded clinical dataset with {len(df)} records.")
    
    # Train / Test split
    X_train, X_test, y_train_disease, y_test_disease = get_train_test_splits("disease_category", test_size=0.2, random_state=42)
    _, _, y_train_triage, y_test_triage = get_train_test_splits("triage_level", test_size=0.2, random_state=42)
    
    # Ensure models are trained
    triage_classifier._ensure_models_loaded()
    
    # Evaluate Disease Classification
    disease_preds = triage_classifier.disease_model.predict(X_test)
    disease_acc = accuracy_score(y_test_disease, disease_preds)
    d_prec, d_rec, d_f1, _ = precision_recall_fscore_support(y_test_disease, disease_preds, average='weighted')
    
    print(f"Disease Classification Accuracy: {disease_acc:.4f} (Weighted F1: {d_f1:.4f})")
    
    # Evaluate Triage Classification
    triage_preds = triage_classifier.triage_model.predict(X_test)
    triage_acc = accuracy_score(y_test_triage, triage_preds)
    t_prec, t_rec, t_f1, _ = precision_recall_fscore_support(y_test_triage, triage_preds, average='weighted')
    
    print(f"Triage Level Accuracy: {triage_acc:.4f} (Weighted F1: {t_f1:.4f})")
    
    # 2. Evaluate Skin Lesion Screener (uses internal synthetic dataset of 1500 profiles)
    skin_screener._ensure_model_loaded()
    # Let's generate a test set similar to how model is trained
    np.random.seed(100) # different seed for test
    X_skin_test = []
    y_skin_test = []
    
    for _ in range(100):
        row = [np.random.choice([0, 1], p=[0.90, 0.10]) for _ in range(8)]
        X_skin_test.append(row)
        y_skin_test.append("Low Risk - Benign Pattern")
    for _ in range(100):
        row = [np.random.choice([0, 1], p=[0.50, 0.50]) for _ in range(8)]
        X_skin_test.append(row)
        y_skin_test.append("Moderate Risk - Monitor & Observe")
    for _ in range(100):
        row = [np.random.choice([0, 1], p=[0.10, 0.90]) for _ in range(8)]
        X_skin_test.append(row)
        y_skin_test.append("High Risk - Urgent Dermatologist Evaluation Required")
        
    skin_features = [
        "asymmetry", "border_irregular", "color_variation", "diameter_gt_6mm", 
        "evolving", "itching_or_pain", "bleeding_or_crust", "new_lesion"
    ]
    df_skin_test = pd.DataFrame(X_skin_test, columns=skin_features)
    
    skin_preds = skin_screener.model.predict(df_skin_test)
    skin_acc = accuracy_score(y_skin_test, skin_preds)
    s_prec, s_rec, s_f1, _ = precision_recall_fscore_support(y_skin_test, skin_preds, average='weighted')
    
    print(f"Skin Lesion Risk Screener Accuracy: {skin_acc:.4f} (Weighted F1: {s_f1:.4f})")
    
    # 3. Latency Benchmarks
    print("\nMeasuring inference latencies...")
    
    # Triage inference latency (over 100 samples)
    triage_latencies = []
    for i in range(100):
        sample_x = X_test.iloc[[i]]
        symptoms_dict = {col: int(sample_x[col].values[0]) for col in FEATURE_COLUMNS[:18]}
        vitals_dict = {col: float(sample_x[col].values[0]) for col in FEATURE_COLUMNS[18:]}
        
        t0 = time.perf_counter()
        # Direct prediction without SHAP first
        disease_probs = triage_classifier.disease_model.predict_proba(sample_x)[0]
        triage_probs = triage_classifier.triage_model.predict_proba(sample_x)[0]
        t1 = time.perf_counter()
        triage_latencies.append((t1 - t0) * 1000) # milliseconds
        
    # Explainer latency (over 30 samples, since SHAP can be slower)
    explainer_latencies = []
    for i in range(30):
        sample_x = X_test.iloc[[i]]
        t0 = time.perf_counter()
        # SHAP calculation
        _ = explain_prediction(triage_classifier.disease_model, sample_x, FEATURE_COLUMNS, "Mock Disease", model_id="disease_lgbm")
        t1 = time.perf_counter()
        explainer_latencies.append((t1 - t0) * 1000) # milliseconds
        
    # Skin Screener latency (over 100 samples)
    skin_latencies = []
    for i in range(100):
        row_dict = df_skin_test.iloc[i].to_dict()
        t0 = time.perf_counter()
        _ = skin_screener.evaluate(row_dict)
        t1 = time.perf_counter()
        skin_latencies.append((t1 - t0) * 1000) # milliseconds

    # Stats
    metrics = {
        "disease_classification": {
            "accuracy": float(disease_acc),
            "precision": float(d_prec),
            "recall": float(d_rec),
            "f1_score": float(d_f1)
        },
        "triage_level_classification": {
            "accuracy": float(triage_acc),
            "precision": float(t_prec),
            "recall": float(t_rec),
            "f1_score": float(t_f1)
        },
        "skin_lesion_classification": {
            "accuracy": float(skin_acc),
            "precision": float(s_prec),
            "recall": float(s_rec),
            "f1_score": float(s_f1)
        },
        "latency_ms": {
            "clinical_triage_inference": {
                "mean": float(np.mean(triage_latencies)),
                "p50": float(np.percentile(triage_latencies, 50)),
                "p95": float(np.percentile(triage_latencies, 95)),
                "p99": float(np.percentile(triage_latencies, 99))
            },
            "shap_explanation_generation": {
                "mean": float(np.mean(explainer_latencies)),
                "p50": float(np.percentile(explainer_latencies, 50)),
                "p95": float(np.percentile(explainer_latencies, 95)),
                "p99": float(np.percentile(explainer_latencies, 99))
            },
            "skin_screener_inference": {
                "mean": float(np.mean(skin_latencies)),
                "p50": float(np.percentile(skin_latencies, 50)),
                "p95": float(np.percentile(skin_latencies, 95)),
                "p99": float(np.percentile(skin_latencies, 99))
            }
        }
    }
    
    print("\nSummary statistics:")
    print(f"Mean clinical triage inference: {metrics['latency_ms']['clinical_triage_inference']['mean']:.3f} ms")
    print(f"Mean SHAP explanation generation: {metrics['latency_ms']['shap_explanation_generation']['mean']:.3f} ms")
    print(f"Mean skin screener inference: {metrics['latency_ms']['skin_screener_inference']['mean']:.3f} ms")
    
    # Save to file
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../results"))
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "raw_ml.json")
    
    with open(out_file, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\nSaved ML benchmark results to {out_file}")

if __name__ == "__main__":
    run_ml_benchmark()
