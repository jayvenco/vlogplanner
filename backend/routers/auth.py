from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token, UserOut, UserSettingsUpdate
from auth import hash_password, verify_password, create_access_token, get_current_user

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
    current_user.openai_api_key = payload.openai_api_key or None
    db.commit()
    db.refresh(current_user)
    return UserOut.from_user(current_user)
