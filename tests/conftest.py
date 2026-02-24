import os
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(autouse=True)
def _default_unit_env():
    os.environ.setdefault("DB_ENABLED", "0")
    yield
    os.environ.pop("DB_ENABLED", None)


@pytest.fixture()
def client():
    with TestClient(app) as c:
        yield c