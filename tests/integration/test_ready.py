import os
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.mark.integration
def test_ready_with_db():
    os.environ["DB_ENABLED"] = "1"

    with TestClient(app) as client:
        r = client.get("/api/ready")
        assert r.status_code == 200
        assert r.json() == {"status": "ready"}