import httpx

from app.config import OPENROUTER_API_KEY, OPENROUTER_MODEL

SYSTEM_PROMPT = """
You are an AI health assistant helping users understand their health patterns.
You are NOT a medical professional and cannot diagnose conditions.
Always recommend professional care for concerning symptoms.
Be empathetic, clear, and evidence-based. When user history is provided,
reference it to give personalized, relevant insights.

Safety: If the user expresses suicidal thoughts or severe crisis, immediately provide:
- iCall (India): 9152987821
- Vandrevala Foundation (India, 24/7): 1860-2662-345
- 988 Suicide & Crisis Lifeline (US): Call or text 988
- Crisis Text Line: Text HOME to 741741

For emergency symptoms (chest pain, difficulty breathing, stroke signs, etc.),
always urge the user to seek immediate medical care.
"""


def chat_with_health_ai(user_message: str, history: list, user_context: dict) -> str:
    """
    Send message to Claude with user's symptom history injected as context.
    history: [{"role": "user"/"assistant", "content": "..."}, ...]
    """
    context_block = ""
    if user_context.get("recent_symptoms"):
        context_block = (
            f"\n\n[User's recent symptom history: {user_context['recent_symptoms']}]"
        )

    messages = [{"role": "system", "content": SYSTEM_PROMPT}, *history]
    messages.append({"role": "user", "content": user_message + context_block})

    with httpx.Client(timeout=60) as client:
        response = client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": OPENROUTER_MODEL,
                "messages": messages,
                "stream": False,
            },
        )
        response.raise_for_status()
        payload = response.json()

    return payload["choices"][0]["message"]["content"]
