from fastapi import APIRouter, File, UploadFile

from app.core.image_classifier import classify_skin_image

router = APIRouter()


@router.post("/classify")
async def classify_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    return classify_skin_image(image_bytes)
