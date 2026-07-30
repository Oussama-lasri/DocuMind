from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DocumentUpload(BaseModel):
    filename: str
    content_type: str

class DocumentResponse(BaseModel):
    id: str
    filename: str
    upload_date: datetime
    file_size: int
    status: str = "processed"

class DocumentList(BaseModel):
    documents: List[DocumentResponse]
    total: int