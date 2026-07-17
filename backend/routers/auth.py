from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token, UserOut, UserSettingsUpdate, LLMVerifyRequest, LLMVerifyResult
from auth import hash_password, verify_password, create_access_token, get_current_user
from crypto_utils import encrypt
from llm_service import verify_key

router = APIRouter()


@router.post("/register", response_model=Token)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Deze gebruikersnaam is al in gebruik")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Dit e-mailadres is al in gebruik")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return Token(access_token=token, user=UserOut.from_user(user))


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gebruikersnaam of wachtwoord is onjuist",
        )

    token = create_access_token(user.id)
    return Token(access_token=token, user=UserOut.from_user(user))


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.from_user(current_user)


@router.put("/me", response_model=UserOut)
def update_me(
    payload: UserSettingsUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    data = payload.model_dump(exclude_unset=True)
    if "llm_provider" in data:
        current_user.llm_provider = data["llm_provider"]
    if "llm_api_key" in data:
        current_user.llm_api_key_encrypted = encrypt(data["llm_api_key"]) if data["llm_api_key"] else None
    if "llm_model" in data:
        current_user.llm_model = data["llm_model"] or None
    if "llm_custom_endpoint" in data:
        current_user.llm_custom_endpoint = data["llm_custom_endpoint"] or None
    if "youtube_client_id" in data:
        current_user.youtube_client_id = data["youtube_client_id"] or None
    if "youtube_client_secret" in data:
        current_user.youtube_client_secret_encrypted = (
            encrypt(data["youtube_client_secret"]) if data["youtube_client_secret"] else None
        )
    if "youtube_redirect_uri" in data:
        current_user.youtube_redirect_uri = data["youtube_redirect_uri"] or None
    if "youtube_api_key" in data:
        current_user.youtube_api_key_encrypted = encrypt(data["youtube_api_key"]) if data["youtube_api_key"] else None
    db.commit()
    db.refresh(current_user)
    return UserOut.from_user(current_user)


@router.post("/llm/verify", response_model=LLMVerifyResult)
def verify_llm_key(payload: LLMVerifyRequest, current_user: User = Depends(get_current_user)):
    ok, message = verify_key(
        payload.llm_provider.value,
        payload.llm_api_key,
        payload.llm_model,
        payload.llm_custom_endpoint,
    )
    return LLMVerifyResult(ok=ok, message=message)
