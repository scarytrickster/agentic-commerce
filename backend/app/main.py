from fastapi import FastAPI

from app.api.health import router as health_router
from app.api.products import router as products_router


app = FastAPI(
    title="Agentic Commerce API",
    description="AI-powered agentic commerce backend",
    version="0.1.0",
)

app.include_router(health_router)
app.include_router(products_router)


@app.get("/")
def root():
    return {
        "message": "Agentic Commerce API",
        "version": "0.1.0",
    }