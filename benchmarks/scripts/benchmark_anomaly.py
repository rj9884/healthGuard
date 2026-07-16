import os
import sys
import time
import json
import numpy as np
from datetime import datetime, timedelta, timezone

# Adjust path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.ml.anomaly_detector import detect_anomalies_and_correlations

class MockSymptomLog:
    def __init__(self, id_val, ts, symptom, severity, sleep, stress, hydration, temp, hr, duration):
        self.id = id_val
        self.timestamp = ts
        self.symptom = symptom
        self.severity = severity
        self.duration_hr = duration
        self.sleep_hours = sleep
        self.stress_level = stress
        self.hydration_liters = hydration
        self.body_temperature_f = temp
        self.heart_rate_bpm = hr

def generate_mock_logs(count: int) -> list:
    logs = []
    base_time = datetime.now(timezone.utc) - timedelta(days=count)
    symptoms_pool = ["headache", "cough", "fatigue", "fever", "nausea"]
    
    # Generate stable baseline
    for i in range(count):
        ts = base_time + timedelta(days=i)
        symptom = np.random.choice(symptoms_pool)
        severity = float(np.random.choice([2, 3, 4]))
        sleep = float(np.random.normal(7.2, 0.6))
        stress = float(np.random.choice([3, 4, 5]))
        hydration = float(np.random.normal(2.2, 0.3))
        temp = float(np.random.normal(98.6, 0.2))
        hr = float(np.random.normal(70, 5))
        duration = float(np.random.choice([1.0, 2.0, 3.0]))
        
        logs.append(MockSymptomLog(i, ts, symptom, severity, sleep, stress, hydration, temp, hr, duration))
        
    return logs

def run_anomaly_benchmark():
    print("=== Starting Longitudinal Anomaly & Correlation Engine Benchmark ===")
    
    sizes = [5, 20, 100, 500, 2000]
    results = {}
    
    for size in sizes:
        print(f"Benchmarking with {size} historical logs...")
        logs = generate_mock_logs(size)
        
        # Define a new mock log to check
        recent_log = MockSymptomLog(
            id_val=-1,
            ts=datetime.now(timezone.utc),
            symptom="headache",
            severity=8.0, # high severity
            sleep=3.5, # low sleep (outlier)
            stress=9.0, # high stress (outlier)
            hydration=0.8, # low hydration (outlier)
            temp=101.5, # fever (outlier)
            hr=110.0, # high heart rate (outlier)
            duration=4.0
        )
        
        # Warmup
        detect_anomalies_and_correlations(logs + [recent_log], recent_log=recent_log)
        
        latencies = []
        iterations = 50 if size <= 500 else 10
        for _ in range(iterations):
            t0 = time.perf_counter()
            _ = detect_anomalies_and_correlations(logs + [recent_log], recent_log=recent_log)
            t1 = time.perf_counter()
            latencies.append((t1 - t0) * 1000) # ms
            
        mean_latency = float(np.mean(latencies))
        p95_latency = float(np.percentile(latencies, 95))
        
        print(f"Size {size:4d} logs: Mean Latency = {mean_latency:.3f} ms (p95 = {p95_latency:.3f} ms)")
        results[str(size)] = {
            "mean_latency_ms": mean_latency,
            "p50_latency_ms": float(np.percentile(latencies, 50)),
            "p95_latency_ms": p95_latency,
            "p99_latency_ms": float(np.percentile(latencies, 99)),
            "iterations_tested": iterations
        }
        
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../results"))
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "raw_anomaly.json")
    
    with open(out_file, "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"\nSaved Anomaly Engine benchmark results to {out_file}")

if __name__ == "__main__":
    run_anomaly_benchmark()
