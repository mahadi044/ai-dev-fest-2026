from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
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
    current_user: User = Depends(get_current_user),
):
    return generate_ai_response(
        request.question,
        db,
        current_user.id,
    )
