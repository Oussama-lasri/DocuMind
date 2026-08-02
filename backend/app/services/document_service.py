from app.schemas.document import DocumentUpload
from app.utils.document_processing_service import DocumentProcessingService
import os
from app.core.database import DbSession
from app.models.document import Document
from app.repositories.document_repository import DocumentRepository

class DocumentService:
    
    def __init__(self):
        self.embeddings = None  # Initialize embeddings here
        self.db_dir = None  # Initialize database directory here

    def ingest_document(self, document , db: DbSession):
        print(f"\n=== ingest document ===")
        print(f"File path: {document.filename}")
        # print(f"User ID: {document.user_id}")
        
        
        docs = DocumentProcessingService.load_document(document.filename)
        print(f"Loaded {len(docs)} documents from {document.filename}")
        
         
        print(f"Storing documents in persistent storage for {document.filename}")
        document_saved: Document = self.create_document(document, user_id="1", db=db)
        
        # 2. Build metadata
        metadata = {
            "user_id": "1",
            "document_id": document_saved.id,
            "filename": document.filename,
        }
        print(f"Built metadata: {metadata}")
        docs_with_metadata = DocumentProcessingService.add_metadata(docs, metadata)
        print(f"Added metadata to documents: {metadata}")
        
        chunks = DocumentProcessingService.split_documents(docs_with_metadata, strategy="recursive")
        print(f"Split documents into {len(chunks)} chunks")
        
        chunks_with_metadata = DocumentProcessingService.add_chunk_metadata(chunks)
        print(f"Added chunk metadata to {len(chunks_with_metadata)} chunks")
        print(f" chunk metadata to {chunks_with_metadata} chunks")
        
        DocumentProcessingService.store_documents(chunks_with_metadata, store_name=document.filename)
        print(f"Stored documents in persistent storage for {document.filename}")
    
    def create_document(self, document: Document , user_id, db: DbSession):
        repository = DocumentRepository(db)
        document = Document(
            user_id=user_id,
            filename=document.filename,
            file_path=document.filename,
            content_type=document.content_type,
            # file_size=document.file_size,
            status="processing",
            extracted_text=None
        )
        return repository.create_document(document)