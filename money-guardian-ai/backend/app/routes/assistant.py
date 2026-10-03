from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.services.ai_assistant import generate_ai_response


router = APIRouter(
    prefix="/api/assistant",
    tags=["AI Assistant"],
)


class AssistantRequest(BaseModel):
    question: str


@router.post("/")
def ask_assistant(
    request: AssistantRequest,
    db: Session = Depends(get_db),
):
    return generate_ai_response(
        request.question,
        db,
    )