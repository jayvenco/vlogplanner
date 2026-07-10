from openai import OpenAI, OpenAIError

from models import Project

OPENAI_MODEL = "gpt-4o-mini"

SYSTEM_PROMPT = (
    "Je bent een vriendelijke, behulpzame assistent voor kinderen die YouTube-video's en vlogs maken. "
    "Geef korte, concrete, positieve tips in het Nederlands, in eenvoudige taal die een kind van rond de "
    "10-12 jaar goed begrijpt. Gebruik geen moeilijke woorden en houd het antwoord kort (max. 4-5 zinnen)."
)


class NoApiKeyError(Exception):
    pass


class GptRequestError(Exception):
    pass


def ask_tip(api_key: str, project: Project, question: str) -> str:
    if not api_key:
        raise NoApiKeyError("Er is nog geen OpenAI-sleutel ingesteld bij Instellingen.")

    context = f"Project thema: {project.title}. Beschrijving: {project.description or 'geen beschrijving'}."

    client = OpenAI(api_key=api_key)
    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"{context}\n\nVraag: {question}"},
            ],
            max_tokens=300,
        )
    except OpenAIError as exc:
        raise GptRequestError("GPT kon geen antwoord geven, probeer het later opnieuw.") from exc

    answer = response.choices[0].message.content
    if not answer:
        raise GptRequestError("GPT gaf geen antwoord terug, probeer het opnieuw.")
    return answer.strip()
