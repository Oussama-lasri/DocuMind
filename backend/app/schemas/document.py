from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel , ConfigDict


class DocumentUpload(BaseModel):
    filename: str
    content_type: str
    file_path: Optional[str] = None


class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    status: str
    user_id : int
    created_at : datetime
    updated_at : Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class DocumentList(BaseModel):
    documents: List[DocumentResponse]
    total: int
