from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from app.models.enums import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str
    role: UserRole
    user_id: int
    email: str
    full_name: str


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=128)
    password: str = Field(..., min_length=6, max_length=128)
    password_confirm: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)
    new_password_confirm: str = Field(..., min_length=6, max_length=128)


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=128)


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
