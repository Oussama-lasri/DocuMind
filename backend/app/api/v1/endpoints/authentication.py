from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import DbSession
from app.schemas.user import UserCreate, UserResponse
from app.services.authentication_service import register_user, login_user
from app.utils.jwt_service import JwtService
from app.schemas.token import Token



router = APIRouter()
def get_jwt_service() -> JwtService:
    return JwtService()


@router.post("/login", response_model=Token)
def login(
    db: DbSession,
    form_data: OAuth2PasswordRequestForm = Depends(),
    jwt_service: JwtService = Depends(get_jwt_service),
):
    return login_user(db, form_data.username, form_data.password, jwt_service)


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: DbSession, jwt_service: JwtService = Depends(get_jwt_service)):
    return register_user(db, user, jwt_service)
