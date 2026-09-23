import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import app.db.base  # noqa: F401
from app.db.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.repositories.user_repository import UserRepository
from app.core.security import get_password_hash


def create_or_update_user(email: str, password: str, role_name: str = "PASSENGER", first_name: str = "Demo", last_name: str = "User"):
    db = SessionLocal()
    try:
        repo = UserRepository(db)
        role = repo.create_role_if_not_exists(
            name=role_name.upper(),
            description=f"{role_name.upper()} role for FlightGuard AI"
        )
        existing = repo.get_by_email(email)
        if existing:
            existing.hashed_password = get_password_hash(password)
            existing.role_id = role.id
            existing.first_name = first_name
            existing.last_name = last_name
            existing.is_active = True
            db.commit()
            db.refresh(existing)
            print(f"Updated existing user '{email}' (Role: {role.name})")
            return existing
        else:
            new_user = repo.create_user(
                email=email,
                hashed_password=get_password_hash(password),
                first_name=first_name,
                last_name=last_name,
                role_id=role.id
            )
            print(f"Successfully created user '{email}' (Role: {role.name})")
            return new_user
    finally:
        db.close()


def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"\nTotal users in database: {len(users)}")
        print("-" * 70)
        print(f"{'Email':<35} | {'Role':<12} | {'Name':<20}")
        print("-" * 70)
        for u in users:
            role_name = u.role.name if u.role else "N/A"
            name = f"{u.first_name} {u.last_name}"
            print(f"{u.email:<35} | {role_name:<12} | {name:<20}")
        print("-" * 70)
    finally:
        db.close()


def seed_default_users():
    print("Seeding default roles and users...")
    defaults = [
        {"email": "admin@flightguard.com", "password": "AdminPassword123!", "role": "ADMIN", "first_name": "Admin", "last_name": "Portal"},
        {"email": "passenger@flightguard.com", "password": "PassengerPassword123!", "role": "PASSENGER", "first_name": "John", "last_name": "Doe"},
        {"email": "operations@flightguard.com", "password": "OperationsPassword123!", "role": "OPERATIONS", "first_name": "Flight", "last_name": "Ops"},
    ]
    for d in defaults:
        create_or_update_user(d["email"], d["password"], d["role"], d["first_name"], d["last_name"])
    print("Default user seeding complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="FlightGuard AI User Management Tool")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # List
    subparsers.add_parser("list", help="List all users")

    # Seed
    subparsers.add_parser("seed", help="Seed default admin, passenger, and operations users")

    # Create / update
    create_parser = subparsers.add_parser("create", help="Create or reset a user")
    create_parser.add_argument("--email", required=True, help="User email address")
    create_parser.add_argument("--password", required=True, help="User password")
    create_parser.add_argument("--role", default="PASSENGER", choices=["ADMIN", "PASSENGER", "OPERATIONS"], help="User role")
    create_parser.add_argument("--first-name", default="User", help="First name")
    create_parser.add_argument("--last-name", default="Account", help="Last name")

    args = parser.parse_args()

    if args.command == "list":
        list_users()
    elif args.command == "seed":
        seed_default_users()
        list_users()
    elif args.command == "create":
        create_or_update_user(args.email, args.password, args.role, args.first_name, args.last_name)
    else:
        parser.print_help()
