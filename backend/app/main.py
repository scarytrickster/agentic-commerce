from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.products import router as products_router
from app.api.auth import router as auth_router
from app.api.agent import router as agent_router


app = FastAPI(
    title="Agentic Commerce API",
    description="AI-powered agentic commerce backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(health_router)
app.include_router(products_router)
app.include_router(auth_router)
app.include_router(agent_router)


@app.get("/")
def root():
    return {
        "message": "Agentic Commerce API",
        "version": "0.1.0",
    }