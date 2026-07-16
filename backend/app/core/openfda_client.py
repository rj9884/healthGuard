"""
Live enrichment of WHO-listed generic medication names with real drug-label
data from the openFDA Drug Label API (https://api.fda.gov/drug/label.json).
This is a free, public, no-key-required API. It's used purely to enrich the
WHO Essential-Medicines guidance with real label text (purpose, dosage
wording, and warnings) — it never decides what to recommend, it only adds
context to what the WHO-guideline mapping already decided.

Network calls are best-effort: if openFDA is unreachable or a generic name
has no label on file, we degrade gracefully and just return the WHO
guidance without enrichment rather than failing the request.
"""
import httpx

OPENFDA_LABEL_URL = "https://api.fda.gov/drug/label.json"

# Tiny in-process cache so repeated symptom check-ins for the same
# medication don't re-hit the network every time.
_cache: dict[str, dict | None] = {}


def _extract_field(result: dict, field: str, max_chars: int = 320) -> str | None:
    value = result.get(field)
    if isinstance(value, list) and value:
        text = value[0]
        if isinstance(text, str) and len(text) > max_chars:
            return text[:max_chars].rsplit(" ", 1)[0] + "..."
        return text
    return None


def fetch_label_enrichment(generic_name: str, timeout_seconds: float = 3.0) -> dict | None:
    """Fetch a short label summary for a generic drug name. Returns None on
    any failure (network, timeout, not found) so callers can fall back
    silently to the static WHO guidance."""
    key = generic_name.lower().strip()
    if key in _cache:
        return _cache[key]

    params = {
        "search": f'openfda.generic_name:"{key}"',
        "limit": 1,
    }
    try:
        with httpx.Client(timeout=timeout_seconds) as client:
            response = client.get(OPENFDA_LABEL_URL, params=params)
            if response.status_code != 200:
                _cache[key] = None
                return None
            data = response.json()
            results = data.get("results") or []
            if not results:
                _cache[key] = None
                return None
            result = results[0]
            enrichment = {
                "purpose": _extract_field(result, "purpose"),
                "dosage_and_administration": _extract_field(result, "dosage_and_administration"),
                "warnings": _extract_field(result, "warnings"),
                "brand_names": (result.get("openfda", {}) or {}).get("brand_name", [])[:3],
            }
            _cache[key] = enrichment
            return enrichment
    except Exception:
        _cache[key] = None
        return None
