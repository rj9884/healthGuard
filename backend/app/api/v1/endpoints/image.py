from fastapi import APIRouter, File, UploadFile, Body
from typing import Dict, Any, Optional
from app.core.image_classifier import classify_skin_image
from app.ml.skin_screener import skin_screener

router = APIRouter()


@router.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    return classify_skin_image(image_bytes)


@router.post("/evaluate-abcde")
def evaluate_abcde(features: Dict[str, Any] = Body(...)):
    """
    Direct endpoint for tabular ABCDE dermatological symptom evaluation.
    """
    return skin_screener.evaluate(features)
