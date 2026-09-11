from fastapi import APIRouter, FastAPI

router= APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "Agentic Commerce API",
    }