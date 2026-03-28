from transformers import pipeline
from PIL import Image
import io

# Use a pretrained model from HuggingFace Hub
classifier = None


def _get_classifier():
    global classifier
    if classifier is None:
        classifier = pipeline(
            "image-classification",
            model="google/vit-base-patch16-224",
        )
    return classifier


DISCLAIMER = (
    "⚠️ Educational purposes only — NOT a medical diagnosis. "
    "Consult a dermatologist or healthcare provider for proper evaluation."
)


def classify_skin_image(image_bytes: bytes) -> dict:
    model = _get_classifier()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    results = model(image, top_k=3)

    return {
        "disclaimer": DISCLAIMER,
        "observations": results,
        "recommendation": (
            "Schedule an appointment if the condition persists over 2 weeks, "
            "spreads, or causes pain or bleeding."
        ),
    }
