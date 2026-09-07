import os
import pprint
import shutil
import tempfile
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordBearer

from app.ai.rag.chain import get_documents_from_retriever
from app.core.database import DbSession
from app.schemas.document import DocumentList, DocumentResponse, DocumentUpload
from app.services.document_service import DocumentService
from app.utils.dependencies import get_current_user

router = APIRouter()
document_service = DocumentService()
# token: Annotated[
#     str,
#     Depends(OAuth2PasswordBearer(...))
# ]

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_documents(
                            db: DbSession,
                            current_user = Depends(get_current_user),
                            file: UploadFile = File(...)):

        UPLOAD_DIR = "temp"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
   
        print(f"Received document upload request: {file}")
        pprint.pprint(file)
        extension = os.path.splitext(file.filename)[1].lower()
        safe_filename = os.path.basename(file.filename)
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        document = document_service.ingest_document(file_path=file_path, document=file, db=db, user=current_user)

        return {
            "message": "Document uploaded successfully",
            "filename": file.filename,
            "document_id": document.id,
            "status": document.status,
        }



@router.get("/list", response_model=DocumentList)
async def list_documents():
    try:
        # Here you would fetch the list of documents from the database
        documents = [
            DocumentResponse(
                id="1",
                filename="example.pdf",
                upload_date=datetime.now(),
                file_size=1024,
                status="processed",
            )
        ]
        return DocumentList(documents=documents, total=len(documents))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{document_id}")
async def download_document(document_id: str):
    try:
        # Here you would implement the logic to retrieve and return the document file
        return {"message": f"Document {document_id} download initiated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/delete/{document_id}")
async def delete_document(document_id: str):
    try:
        # Here you would implement the logic to delete the document from the database and storage
        return {"message": f"Document {document_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# @router.get("/{document_id}")
# async def get_document(document_id: str):
#     try:
#         # Here you would implement the logic to retrieve the document details from the database
#         document = DocumentResponse(
#             id=document_id,
#             filename="example.pdf",
#             upload_date=datetime.now(),
#             file_size=1024,
#             status="processed"
#         )
#         return document
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_documents(query: str):
    try:

        return get_documents_from_retriever(question=query)["answer"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
