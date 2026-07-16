import pytest
import pandas as pd
from unittest.mock import MagicMock
from datetime import datetime, timezone


def _make_mock_log(symptom, severity, triggers, ts=None):
    """Create a mock SymptomLog object."""
    mock = MagicMock()
    mock.symptom = symptom
    mock.severity = severity
    mock.triggers = triggers
    mock.timestamp = ts or datetime.now(timezone.utc)
    return mock


def test_analyze_patterns_insufficient_data():
    """Should return a message when fewer than 3 entries exist."""
    from app.core.pattern_engine import analyze_patterns

    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = [
        _make_mock_log("headache", 5, ["stress"]),
    ]

    result = analyze_patterns(db, "test_user", "headache")
    assert "message" in result
    assert "3 health check-ins" in result["message"]


def test_analyze_patterns_with_data():
    """Should compute trigger confidence scores."""
    from app.core.pattern_engine import analyze_patterns

    logs = [
        _make_mock_log("headache", 7, ["stress", "dehydration"]),
        _make_mock_log("headache", 8, ["stress"]),
        _make_mock_log("headache", 5, ["lack_of_sleep"]),
        _make_mock_log("headache", 6, ["stress", "lack_of_sleep"]),
        _make_mock_log("headache", 9, ["stress"]),
    ]

    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = logs

    result = analyze_patterns(db, "test_user", "headache")
    assert result["symptom"] == "headache"
    assert result["total_logs"] == 5
    assert len(result["triggers"]) > 0
    # "stress" should be the top trigger
    assert result["triggers"][0]["triggers"] == "stress"


def test_get_symptom_summary_empty():
    """Should return empty list for no logs."""
    from app.core.pattern_engine import get_symptom_summary

    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = []

    result = get_symptom_summary(db, "test_user")
    assert result == []
