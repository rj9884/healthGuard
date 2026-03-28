import anthropic
from app.config import ANTHROPIC_API_KEY

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

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

    messages = history + [{"role": "user", "content": user_message + context_block}]

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    return response.content[0].text
