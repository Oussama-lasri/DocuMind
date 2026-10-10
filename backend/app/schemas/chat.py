from typing import List, Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    query: str
    user_id: str
    session_id: Optional[str] = None
    temperature: Optional[float] = 0.7
    document_ids: Optional[List[int]] = None
    use_web: Optional[bool] = False
    web_urls: Optional[List[str]] = None


class Source(BaseModel):
    document_name: str
    page: Optional[int] = None
    score: Optional[float] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = []
    agent_used: Optional[str] = None
    processing_time: Optional[float] = None
    download_url: Optional[str] = None
    download_filename: Optional[str] = None
