"""Authentication endpoints — keyword-based login."""

from fastapi import APIRouter, HTTPException, Depends, status

from app.core.security import (
    verify_keyword,
    create_access_token,
    get_current_user,
)
from app.schemas.auth import KeywordLogin, TokenResponse, UserInfo

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(body: KeywordLogin):
    """Authenticate using the secret keyword. Returns JWT token."""
    if not verify_keyword(body.keyword):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access keyword",
        )

    token = create_access_token(data={"sub": "admin", "role": "admin"})
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserInfo)
async def get_me(user: dict = Depends(get_current_user)):
    """Return current authenticated user info."""
    return UserInfo(role=user.get("role", "admin"), authenticated=True)


@router.post("/verify")
async def verify_token(user: dict = Depends(get_current_user)):
    """Verify that the current JWT token is still valid."""
    return {"valid": True, "role": user.get("role", "admin")}
