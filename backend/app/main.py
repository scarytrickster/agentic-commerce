from fastapi import FastAPI

from app.api.health import router as health_router

app= FastAPI(
    title="Agentic Commerce API",
    description="AI-powered agentic commerce backend",
)
app.include_router(health_router)



@app.get("/")
def root():
    return {"message": "Hello from backend!"}