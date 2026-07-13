import base64
import hashlib

from cryptography.fernet import Fernet

from auth import JWT_SECRET_KEY

_DERIVED_KEY = base64.urlsafe_b64encode(hashlib.sha256(JWT_SECRET_KEY.encode()).digest())
_fernet = Fernet(_DERIVED_KEY)


def encrypt(plaintext: str) -> str:
    return _fernet.encrypt(plaintext.encode()).decode()


def decrypt(ciphertext: str) -> str:
    return _fernet.decrypt(ciphertext.encode()).decode()
