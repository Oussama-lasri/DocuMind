import shutil
import tempfile

from fastapi import APIRouter, HTTPException , UploadFile, File , status
from app.schemas.document import DocumentUpload, DocumentList, DocumentResponse
from app.services.document_service import DocumentService
from app.core.database import DbSession
import os
import pprint


router = APIRouter()
document_service = DocumentService()

@router.post("/upload" , status_code=status.HTTP_201_CREATED)
async def upload_documents(
    db: DbSession,
    file: UploadFile = File(...)):
    try:
        UPLOAD_DIR = "temp"
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        try:
            print(f"Received document upload request: {file}")
            pprint.pprint(file)
            extension = os.path.splitext(
                        file.filename
                    )[1].lower()
            file_path = f"temp/{file.filename}"
            with open(file_path, "wb") as f:
                f.write(await file.read())
            document_service.ingest_document(file_path=file_path, document=file, db=db)
        except Exception as e:
            print(f"Error occurred while processing file {file.filename}: {e}")

            
            

        return {"message": "Document uploaded successfully", "filename": file}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
                status="processed"
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

@router.get("/{document_id}")
async def get_document(document_id: str):
    try:
        # Here you would implement the logic to retrieve the document details from the database
        document = DocumentResponse(
            id=document_id,
            filename="example.pdf",
            upload_date=datetime.now(),
            file_size=1024,
            status="processed"
        )
        return document
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))