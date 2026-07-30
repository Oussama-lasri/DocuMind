from pydantic import BaseModel
from typing import List, Optional

class ChatRequest(BaseModel):
    query: str
    user_id: str
    session_id: Optional[str] = None
    temperature: Optional[float] = 0.7

class Source(BaseModel):
    document_name: str
    page: Optional[int] = None
    score: Optional[float] = None

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = []
    agent_used: Optional[str] = None
    processing_time: Optional[float] = None