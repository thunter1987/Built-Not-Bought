from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_-]+$",
    )
    password: str = Field(
        min_length=8,
        max_length=128,
    )

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    created_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
    )

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
