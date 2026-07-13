import requests
from openai import OpenAI, OpenAIError
import anthropic

from crypto_utils import decrypt

DEFAULT_MODELS = {
    "openai": "gpt-4o-mini",
    "anthropic": "claude-3-5-haiku-20241022",
}


class NoApiKeyError(Exception):
    pass


class LLMRequestError(Exception):
    pass


def _call_openai(api_key: str, model: str, system_prompt: str, user_prompt: str) -> str:
    client = OpenAI(api_key=api_key)
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=500,
        )
    except OpenAIError as exc:
        raise LLMRequestError(f"OpenAI-fout: {exc}") from exc
    content = response.choices[0].message.content
    if not content:
        raise LLMRequestError("OpenAI gaf geen antwoord terug.")
    return content.strip()


def _call_anthropic(api_key: str, model: str, system_prompt: str, user_prompt: str) -> str:
    client = anthropic.Anthropic(api_key=api_key)
    try:
        response = client.messages.create(
            model=model,
            max_tokens=500,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
    except anthropic.AnthropicError as exc:
        raise LLMRequestError(f"Anthropic-fout: {exc}") from exc
    if not response.content:
        raise LLMRequestError("Anthropic gaf geen antwoord terug.")
    return response.content[0].text.strip()


def _call_custom(api_key: str, model: str, endpoint: str, system_prompt: str, user_prompt: str) -> str:
    if not endpoint:
        raise LLMRequestError("Geen custom endpoint ingesteld.")
    url = endpoint.rstrip("/") + "/chat/completions"
    try:
        response = requests.post(
            url,
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "max_tokens": 500,
            },
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except (requests.RequestException, KeyError, IndexError) as exc:
        raise LLMRequestError(f"Custom endpoint-fout: {exc}") from exc


def _dispatch(provider: str, api_key: str, model: str, custom_endpoint: str, system_prompt: str, user_prompt: str) -> str:
    if provider == "openai":
        return _call_openai(api_key, model or DEFAULT_MODELS["openai"], system_prompt, user_prompt)
    if provider == "anthropic":
        return _call_anthropic(api_key, model or DEFAULT_MODELS["anthropic"], system_prompt, user_prompt)
    if provider == "custom":
        return _call_custom(api_key, model, custom_endpoint, system_prompt, user_prompt)
    raise LLMRequestError(f"Onbekende provider: {provider}")


def generate(user, system_prompt: str, user_prompt: str) -> str:
    if not user.llm_api_key_encrypted or not user.llm_provider:
        raise NoApiKeyError("Er is nog geen AI-sleutel ingesteld bij Instellingen.")

    api_key = decrypt(user.llm_api_key_encrypted)
    provider = user.llm_provider.value if hasattr(user.llm_provider, "value") else user.llm_provider
    return _dispatch(provider, api_key, user.llm_model, user.llm_custom_endpoint, system_prompt, user_prompt)


def verify_key(provider: str, api_key: str, model: str = None, custom_endpoint: str = None) -> tuple[bool, str]:
    try:
        _dispatch(
            provider,
            api_key,
            model,
            custom_endpoint,
            "Je bent een testassistent.",
            "Antwoord met het woord 'ok'.",
        )
        return True, "De API-sleutel werkt!"
    except LLMRequestError as exc:
        return False, str(exc)
