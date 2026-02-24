from fastapi import APIRouter, Request, HTTPException

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok"}

@router.get("/ready")
def ready(request: Request):
    client = getattr(request.app.state, "mongo_client", None)
    if client is None:
        raise HTTPException(status_code=503, detail="DB disabled")

    try:
        client.admin.command("ping")
    except Exception:
        raise HTTPException(status_code=503, detail="DB not ready")

    return {"status": "ready"}