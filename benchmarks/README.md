# HealthGuard Performance & Evaluation Benchmarks

This directory contains the automated evaluation and performance benchmarks for the HealthGuard platform. It measures machine learning classification metrics, execution latency scaling, and HTTP API load performance under concurrent requests.

---

## Benchmark Structure

```
benchmarks/
├── README.md           # Reproduction guide and environment details
├── scripts/
│   ├── benchmark_ml.py      # Evaluates ML models accuracy, inference, and SHAP latencies
│   ├── benchmark_anomaly.py # Measures anomaly/correlation engine scaling
│   └── benchmark_api.py     # Executes concurrent HTTP load-testing on FastAPI endpoints
└── results/
    ├── raw_ml.json          # Raw output log from ML model evaluations
    ├── raw_anomaly.json     # Raw latency metrics for anomaly scaling
    ├── raw_api.json         # Raw concurrent RPS and latency output
    └── summary.md           # Human-readable rollup and engineering analysis of the benchmarks
```

---

## System & Reference Environment

All measurements were taken in the reference local development environment:
- **OS**: Linux (Fedora/Arch/Ubuntu base)
- **CPU**: Intel/AMD Multi-core processor (Reference: 8-core CPU)
- **Python Version**: 3.12.13 (running inside the Docker container context)
- **Database**: PostgreSQL 16-alpine (containerized)
- **API Server**: FastAPI 0.115.0 / Uvicorn (single-worker)

---

## How to Reproduce Benchmarks

### 1. Ensure Services are Running
The benchmarks expect the PostgreSQL database and FastAPI backend container to be running and healthy:
```bash
docker compose up -d db backend
```

### 2. Copy Benchmark Scripts to the Container
To run in the correct environment with all machine learning dependencies preinstalled:
```bash
# Clean previous container copy and copy latest
docker exec health_monitor_backend rm -rf /app/benchmarks
docker cp benchmarks health_monitor_backend:/app/
```

### 3. Execute Benchmarks

#### Machine Learning Model Evaluation
Evaluates classification accuracy, weighted F1, and raw in-memory inference/explainer latencies:
```bash
docker exec health_monitor_backend python benchmarks/scripts/benchmark_ml.py
```
*Raw output is saved to `/app/benchmarks/results/raw_ml.json`.*

#### Longitudinal Anomaly & Correlation Engine Scaling
Measures how execution scales with historical log volume (5 to 2,000 logs):
```bash
docker exec health_monitor_backend python benchmarks/scripts/benchmark_anomaly.py
```
*Raw output is saved to `/app/benchmarks/results/raw_anomaly.json`.*

#### Concurrent API Load Testing
Runs HTTP load testing with concurrency levels of 1, 5, and 20:
```bash
docker exec health_monitor_backend python benchmarks/scripts/benchmark_api.py
```
*Raw output is saved to `/app/benchmarks/results/raw_api.json`.*

### 4. Fetch Results Back to Host
To save the generated raw logs back to the repository:
```bash
docker cp health_monitor_backend:/app/benchmarks/results/ benchmarks/
```
