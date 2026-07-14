"""Pydantic schemas for authentication."""

from pydantic import BaseModel


class KeywordLogin(BaseModel):
    """Request body for keyword-based authentication."""
    keyword: str


class TokenResponse(BaseModel):
    """Response with JWT access token."""
    access_token: str
    token_type: str = "bearer"


class UserInfo(BaseModel):
    """Current user information."""
    role: str = "admin"
    authenticated: bool = True
