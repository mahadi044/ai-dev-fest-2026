from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.init_db import init_db
from app.database.migration import migrate_database

from app.routes.transactions import router as transactions_router
from app.routes.risk import router as risk_router
from app.routes.insights import router as insights_router
from app.routes.assistant import router as assistant_router
from app.routes.auth import router as auth_router
from app.routes.prediction import router as prediction_router


# ==================== APP ====================

app = FastAPI(
    title="Money Guardian AI",
    description="Intelligent personal financial management and risk detection API",
    version="1.0.0",
)


# ==================== CORS ====================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Vite development ports
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",

        # 127.0.0.1 development ports
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5177",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== DATABASE ====================

@app.on_event("startup")
def startup():
    init_db()
    migrate_database()


# ==================== HEALTH CHECK ====================

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "Money Guardian AI API",
    }


# ==================== ROUTES ====================

app.include_router(transactions_router)
app.include_router(risk_router)
app.include_router(insights_router)
app.include_router(assistant_router)
app.include_router(auth_router)
app.include_router(prediction_router)
