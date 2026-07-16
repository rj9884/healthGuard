import os
import sys
import time
import json
import asyncio
import httpx
import numpy as np

BASE_URL = "http://localhost:8000"

async def authenticate_client(client: httpx.AsyncClient) -> str:
    email = "benchmark_api@healthguard.ai"
    password = "benchmarkpassword123"
    
    # Try logging in first
    try:
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": email, "password": password}
        )
        if response.status_code == 200:
            print("Successfully authenticated via Login.")
            return response.json()["access_token"]
    except Exception:
        pass
        
    # If login fails, register the user
    try:
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": email,
                "password": password,
                "name": "Benchmark API User",
                "full_name": "Benchmark API User",
                "age_range": "adult",
                "sex": "male"
            }
        )
        if response.status_code == 201 or response.status_code == 200:
            print("Successfully registered and authenticated benchmark user.")
            return response.json()["access_token"]
        else:
            print(f"Failed to register: {response.text}")
    except Exception as e:
        print(f"Registration request error: {e}")
        
    # Fallback to empty token
    return ""

async def test_endpoint(client: httpx.AsyncClient, name: str, method: str, path: str, payload: dict = None) -> float:
    t0 = time.perf_counter()
    try:
        if method == "GET":
            resp = await client.get(f"{BASE_URL}{path}")
        else:
            resp = await client.post(f"{BASE_URL}{path}", json=payload)
        
        status_code = resp.status_code
        # Success if 200 or 201
        success = (status_code in [200, 201])
    except Exception as e:
        success = False
        
    t1 = time.perf_counter()
    duration = (t1 - t0) * 1000 # ms
    return duration if success else -1.0

async def run_load_test(client: httpx.AsyncClient, name: str, method: str, path: str, payload: dict, concurrency: int, total_requests: int) -> dict:
    print(f"  Testing endpoint '{name}' (Concurrency={concurrency}, Total Requests={total_requests})...")
    
    sem = asyncio.Semaphore(concurrency)
    
    async def worker():
        async with sem:
            return await test_endpoint(client, name, method, path, payload)
            
    tasks = [worker() for _ in range(total_requests)]
    t0 = time.perf_counter()
    durations = await asyncio.gather(*tasks)
    total_time = (time.perf_counter() - t0)
    
    valid_durations = [d for d in durations if d > 0]
    errors = total_requests - len(valid_durations)
    
    if not valid_durations:
        return {
            "rps": 0.0,
            "mean_ms": 0.0,
            "p50_ms": 0.0,
            "p95_ms": 0.0,
            "p99_ms": 0.0,
            "error_rate": 1.0
        }
        
    rps = len(valid_durations) / total_time
    
    return {
        "rps": float(rps),
        "mean_ms": float(np.mean(valid_durations)),
        "p50_ms": float(np.percentile(valid_durations, 50)),
        "p95_ms": float(np.percentile(valid_durations, 95)),
        "p99_ms": float(np.percentile(valid_durations, 99)),
        "error_rate": float(errors / total_requests)
    }

async def main():
    print("=== Starting HealthGuard API Load Test ===")
    
    limits = httpx.Limits(max_keepalive_connections=50, max_connections=100)
    async with httpx.AsyncClient(limits=limits, timeout=15.0) as client:
        # Check health
        try:
            resp = await client.get(f"{BASE_URL}/health")
            if resp.status_code != 200:
                print("Server is not healthy or unreachable.")
                return
        except Exception as e:
            print(f"Error connecting to server: {e}")
            return
            
        # Authenticate
        token = await authenticate_client(client)
        if token:
            client.headers.update({"Authorization": f"Bearer {token}"})
            
        endpoints = [
            {
                "name": "Health Check (GET /health)",
                "method": "GET",
                "path": "/health",
                "payload": None
            },
            {
                "name": "ABCDE Skin Lesion Screener (POST /api/v1/image/evaluate-abcde)",
                "method": "POST",
                "path": "/api/v1/image/evaluate-abcde",
                "payload": {
                    "asymmetry": 1,
                    "border_irregular": 1,
                    "color_variation": 1,
                    "diameter_gt_6mm": 0,
                    "evolving": 0,
                    "itching_or_pain": 1,
                    "bleeding_or_crust": 0,
                    "new_lesion": 1
                }
            },
            {
                "name": "Symptom Logging & Triage Pipeline (POST /api/v1/symptoms)",
                "method": "POST",
                "path": "/api/v1/symptoms",
                "payload": {
                    "symptom": "fever",
                    "severity": 8,
                    "duration_hr": 24.5,
                    "sleep_hours": 4.5,
                    "stress_level": 8,
                    "hydration_liters": 1.2,
                    "body_temperature_f": 101.5,
                    "heart_rate_bpm": 105,
                    "triggers": ["stress", "dehydration"],
                    "relief": ["water", "sleep"],
                    "notes": "Fever spike after midnight"
                }
            }
        ]
        
        concurrency_levels = [1, 5, 20]
        results = {}
        
        for ep in endpoints:
            results[ep["name"]] = {}
            for concurrency in concurrency_levels:
                # Set request count proportional to concurrency to keep benchmarks fast but representative
                total_requests = concurrency * 10 if concurrency > 1 else 10
                res = await run_load_test(
                    client=client,
                    name=ep["name"],
                    method=ep["method"],
                    path=ep["path"],
                    payload=ep["payload"],
                    concurrency=concurrency,
                    total_requests=total_requests
                )
                results[ep["name"]][str(concurrency)] = res
                print(f"    RPS: {res['rps']:.2f} | p95: {res['p95_ms']:.2f}ms | Errors: {res['error_rate']*100:.1f}%")
                
        out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../results"))
        os.makedirs(out_dir, exist_ok=True)
        out_file = os.path.join(out_dir, "raw_api.json")
        
        with open(out_file, "w") as f:
            json.dump(results, f, indent=2)
            
        print(f"\nSaved API benchmark results to {out_file}")

if __name__ == "__main__":
    asyncio.run(main())
