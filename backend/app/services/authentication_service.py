from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserInDB, UserResponse
from app.utils.jwt_service import JwtService
from app.schemas.token import Token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/authentication/login")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_user(db: Session, email: str) -> UserInDB | None:
    user_repository = UserRepository(db)
    user_dict = user_repository.get_user_by_email(email)
    if user_dict is None:
        return None
    return UserInDB.model_validate(user_dict)

def authenticate_user(db: Session, email: str, password: str) -> UserInDB | None:
    user = get_user(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def create_user(db: Session, user: UserCreate):
    # Check first, before hashing (avoid wasted bcrypt work)
    if get_user(db, user.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(**user.model_dump(exclude={"password"}))
    new_user.hashed_password = get_password_hash(user.password.get_secret_value())

    user_repository = UserRepository(db)
    created_user = user_repository.create_user(new_user)
    return UserResponse.model_validate(created_user)

def login_user(db: Session, email: str, password: str, jwt_service: JwtService) -> Token:
    user = authenticate_user(db, email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return jwt_service.create_access_token(data={"sub": user.email , "user_id": user.id})

def register_user(db: Session, user: UserCreate, jwt_service: JwtService) -> Token:
    created_user = create_user(db, user)
    return jwt_service.create_access_token(data={"sub": created_user.email, "user_id": created_user.id})