from app.schemas.document import DocumentUpload
from app.utils.document_processing_service import DocumentProcessingService
import os

class DocumentService:
    
    def __init__(self):
        self.embeddings = None  # Initialize embeddings here
        self.db_dir = None  # Initialize database directory here

    def ingest_document(self, document):
        print(f"\n=== ingest document ===")
        print(f"File path: {document.filename}")
        # print(f"User ID: {document.user_id}")
        
        
        docs = DocumentProcessingService.load_document(document.filename)
        print(f"Loaded {len(docs)} documents from {document.filename}")
        
         # 2. Build metadata
        metadata = {
            "user_id": "1",
            "document_id":"1",
            "filename": document.filename,
        }
        docs_with_metadata = DocumentProcessingService.add_metadata(docs, metadata)
        print(f"Added metadata to documents: {metadata}")
        
        chunks = DocumentProcessingService.split_documents(docs_with_metadata, strategy="recursive")
        print(f"Split documents into {len(chunks)} chunks")
        
        chunks_with_metadata = DocumentProcessingService.add_chunk_metadata(chunks)
        print(f"Added chunk metadata to {len(chunks_with_metadata)} chunks")
        
        DocumentProcessingService.store_documents(chunks_with_metadata, store_name=document.filename)
    
    def save_documents(self, documents, metadata):
        pass