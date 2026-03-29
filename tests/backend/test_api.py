"""Backend API tests."""
import pytest
from unittest.mock import patch, AsyncMock
from src.config import settings


def test_settings_minimalism_constraints():
    """Ensure minimalism constraints are properly set."""
    assert settings.DAILY_FEED_LIMIT == 20
    assert settings.DAILY_USAGE_CAP_MINUTES == 15
    assert settings.AI_MAX_NOTIFICATIONS_PER_DAY == 1


def test_settings_pomodoro_defaults():
    """Check Pomodoro timer defaults."""
    assert settings.POMODORO_DEFAULT_MINUTES == 25
    assert settings.POMODORO_BREAK_MINUTES == 5


def test_settings_jwt_config():
    """JWT config should be set."""
    assert settings.ALGORITHM == "HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0


def test_password_hashing():
    """Test password hash and verify."""
    from src.auth.security import hash_password, verify_password
    hashed = hash_password("testpass123")
    assert hashed != "testpass123"
    assert verify_password("testpass123", hashed)
    assert not verify_password("wrongpass", hashed)


def test_create_access_token():
    """Test JWT token creation."""
    from src.auth.security import create_access_token
    from jose import jwt
    token = create_access_token(data={"sub": "test-user-id"})
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert payload["sub"] == "test-user-id"
    assert "exp" in payload
