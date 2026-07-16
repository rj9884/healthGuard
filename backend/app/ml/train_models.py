"""
Standalone build script to pre-train and verify HealthGuard ML models.
Run this during Docker build or startup to ensure lightweight .joblib artifacts are ready.
"""
import time
from app.ml.triage_model import triage_classifier
from app.ml.skin_screener import skin_screener

def train_all():
    start_time = time.time()
    print("=== [HealthGuard ML Pipeline] Pre-training Models ===")
    
    # 1. Train Clinical Triage & Risk Classifier
    triage_classifier.train_and_save()
    
    # 2. Train Dermatological ABCDE Skin Screener
    skin_screener.train_and_save()
    
    elapsed = round(time.time() - start_time, 2)
    print(f"=== All HealthGuard ML models successfully trained and serialized in {elapsed} seconds ===")

if __name__ == "__main__":
    train_all()
