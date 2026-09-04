from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, SecretStr


class UserCreate(BaseModel):
    full_name : str
    email: EmailStr
    role: str = Field(default="user", description="Role of the user, e.g., 'user', 'admin'")
    password: SecretStr = Field(min_length=8)
    
    


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserInDB(BaseModel):
    id: int
    email: EmailStr
    hashed_password: str
    role: str
    is_active: bool
    full_name : str
    model_config = ConfigDict(from_attributes=True)