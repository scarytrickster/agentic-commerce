from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.agent import run_agent
from app.database.session import get_db
from app.schemas.agent import AgentRequest, AgentResponse


router = APIRouter(prefix="/agent", tags=["Agent"])


@router.post("", response_model=AgentResponse)
async def agent(
    payload: AgentRequest,
    db: AsyncSession = Depends(get_db),
):
    response = await run_agent(
        db=db,
        user_message=payload.message,
    )

    return AgentResponse(**response)