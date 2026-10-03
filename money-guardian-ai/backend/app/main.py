from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.init_db import init_db
from app.database.migration import migrate_database

from app.routes.transactions import router as transactions_router
from app.routes.risk import router as risk_router
from app.routes.insights import router as insights_router
from app.routes.assistant import router as assistant_router
from app.routes.auth import router as auth_router


app = FastAPI(
    title="Money Guardian AI",
    description="Intelligent personal financial management and risk detection API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    init_db()
    migrate_database()


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Money Guardian AI API",
    }


app.include_router(transactions_router)
app.include_router(risk_router)
app.include_router(insights_router)
app.include_router(assistant_router)
app.include_router(auth_router)