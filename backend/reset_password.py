"""Reset or set a user's password from the command line (for a forgotten password).

Run inside the container:
  docker exec vlogplanner python reset_password.py <username>          # remove the password
  docker exec -it vlogplanner python reset_password.py <username> --set  # set a new one (prompts)
"""
import argparse
import getpass
import secrets
import sys

from auth import hash_password
from database import SessionLocal
from models import User


def main() -> int:
    parser = argparse.ArgumentParser(description="Reset a VlogPlanner user's password.")
    parser.add_argument("username")
    parser.add_argument("--set", action="store_true", help="prompt for a new password instead of removing it")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == args.username).first()
        if not user:
            print(f"Gebruiker '{args.username}' bestaat niet.", file=sys.stderr)
            return 1
        if args.set:
            new = getpass.getpass("Nieuw wachtwoord (min. 6 tekens): ")
            if len(new) < 6 or new != getpass.getpass("Herhaal wachtwoord: "):
                print("Wachtwoord te kort of niet gelijk. Niets gewijzigd.", file=sys.stderr)
                return 1
            user.hashed_password = hash_password(new)
            user.has_password = True
            print(f"Nieuw wachtwoord ingesteld voor '{user.username}'.")
        else:
            user.hashed_password = hash_password(secrets.token_urlsafe(32))
            user.has_password = False
            print(f"Wachtwoord van '{user.username}' verwijderd: inloggen kan weer met alleen de naam.")
        db.commit()
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
