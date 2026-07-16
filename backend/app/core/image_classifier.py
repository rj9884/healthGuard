import io
from PIL import Image
import numpy as np
from app.ml.skin_screener import skin_screener

DISCLAIMER = (
    "⚠️ Educational purposes only — NOT a medical diagnosis. "
    "Consult a dermatologist or healthcare provider for proper clinical evaluation."
)


def classify_skin_image(image_bytes: bytes, features_dict: dict = None) -> dict:
    """
    Evaluates dermatological lesion risk without heavy Vision Transformer RAM bloat.
    Uses gradient-boosted tabular ABCDE screening heuristics combined with basic visual metrics.
    """
    if features_dict is None:
        features_dict = {}

    # Perform lightweight visual heuristic analysis using PIL without loading ImageNet/PyTorch
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = image.size
        # Heuristic 1: Asymmetry check based on aspect ratio skew
        aspect_ratio = max(w, h) / max(1, min(w, h))
        if aspect_ratio > 1.35 and "asymmetry" not in features_dict:
            features_dict["asymmetry"] = True

        # Heuristic 2: Color variation check based on RGB standard deviation
        arr = np.array(image)
        std_rgb = np.std(arr, axis=(0, 1))
        if np.mean(std_rgb) > 55 and "color_variation" not in features_dict:
            features_dict["color_variation"] = True
    except Exception:
        pass

    # Default fallback heuristics if user uploaded image without manual checkboxes
    if not features_dict:
        features_dict = {
            "color_variation": True,
            "border_irregular": True,
            "evolving": False
        }

    # Evaluate with Gradient Boosted ABCDE screener
    ml_assessment = skin_screener.evaluate(features_dict)

    # Format observations for backward compatibility with UI cards
    observations = [
        {
            "label": ml_assessment["risk_level"],
            "score": ml_assessment["confidence"]
        }
    ]
    for factor in ml_assessment["key_risk_factors"]:
        observations.append({
            "label": f"Risk Factor: {factor['label']}",
            "score": round(factor["importance"] / 100.0, 2)
        })

    return {
        "disclaimer": DISCLAIMER,
        "observations": observations,
        "risk_level": ml_assessment["risk_level"],
        "confidence": ml_assessment["confidence"],
        "key_risk_factors": ml_assessment["key_risk_factors"],
        "recommendation": ml_assessment["recommendation"],
    }
