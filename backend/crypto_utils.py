import base64
import hashlib
import os

from cryptography.fernet import Fernet

from auth import JWT_SECRET_KEY


def _load_key() -> bytes:
    dedicated = os.environ.get("ENCRYPTION_KEY")
    if dedicated:
        return base64.urlsafe_b64encode(hashlib.sha256(dedicated.encode()).digest())
    # Legacy fallback for installs without ENCRYPTION_KEY: this branch must
    # never change, or existing encrypted fields become unreadable.
    return base64.urlsafe_b64encode(hashlib.sha256(JWT_SECRET_KEY.encode()).digest())


_fernet = Fernet(_load_key())


def encrypt(plaintext: str) -> str:
    return _fernet.encrypt(plaintext.encode()).decode()


def decrypt(ciphertext: str) -> str:
    return _fernet.decrypt(ciphertext.encode()).decode()
