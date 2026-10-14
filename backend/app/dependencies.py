import uuid
from typing import Optional

import jwt
from app.database import get_db
from app.models import User
from app.security import decode_access_token
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:

    unauthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={
            "WWW-Authenticate": "Bearer",
        },
    )

    if credentials is None:
        raise unauthorized_exception

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except jwt.PyJWTError as e:
        raise unauthorized_exception from e

    if payload.get("type") != "access":
        raise unauthorized_exception

    subject = payload.get("sub")

    if not subject:
        raise unauthorized_exception

    try:
        user_id = uuid.UUID(subject)
    except ValueError as e:
        raise unauthorized_exception from e

    user = db.get(User, user_id)

    if user is None:
        raise unauthorized_exception

    return user
