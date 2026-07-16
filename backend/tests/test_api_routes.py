from fastapi.testclient import TestClient
from app.main import app
from app.core.auth import get_current_user
from app.models.user import User

# Override get_current_user to return a test user for routing tests
def mock_get_current_user():
    return User(id="test_user", name="Test User", email="test@healthguard.ai")

app.dependency_overrides[get_current_user] = mock_get_current_user

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_log_symptom():
    payload = {
        "symptom": "headache",
        "severity": 7,
        "triggers": ["stress"],
        "notes": "After long meeting",
    }
    response = client.post("/api/v1/symptoms", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symptom"] == "headache"
    assert data["severity"] == 7


def test_get_symptoms():
    response = client.get("/api/v1/symptoms")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_add_medication():
    payload = {"name": "Ibuprofen", "dosage": "200mg", "frequency": "Twice daily"}
    response = client.post("/api/v1/medications", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Ibuprofen"


def test_get_medications():
    response = client.get("/api/v1/medications")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_analysis_summary():
    response = client.get("/api/v1/analysis/summary")
    assert response.status_code == 200


def test_dashboard_endpoint():
    response = client.get("/api/v1/dashboard")
    assert response.status_code == 200
    payload = response.json()
    assert "metrics" in payload
    assert "charts" in payload
