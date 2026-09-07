import logging

from fastapi import UploadFile

from app.core.database import DbSession
from app.models.document import Document
from app.repositories.document_repository import DocumentRepository
from app.schemas.user import UserResponse
from app.utils.document_processing_service import (
    DocumentProcessingService,
)
from app.core.exceptions import (
    DocumentError,
    DocumentProcessingError,
)


logger = logging.getLogger(__name__)


class DocumentService:

    def __init__(self):

        self.embeddings = None
        self.db_dir = None

        self.processing_service = DocumentProcessingService(
            embeddings=self.embeddings,
            db_dir=self.db_dir,
        )

    def ingest_document(
        self,
        file_path: str,
        document: UploadFile,
        db: DbSession,
        user: UserResponse,
    ):

        document_saved = None

        try:

            logger.info(
                "Starting ingestion: filename=%s user_id=%s",
                document.filename,
                user.id,
            )

            # -----------------------------------------
            # 1. Load document
            # -----------------------------------------

            docs = self.processing_service.load_document(
                file_path
            )

            logger.info(
                "Loaded %s documents",
                len(docs)
            )

            # -----------------------------------------
            # 2. Save document metadata in PostgreSQL
            # -----------------------------------------

            document_saved = self.create_document(
                document=document,
                user_id=user.id,
                file_path=file_path,
                db=db,
            )

            logger.info(
                "Created document database record: id=%s",
                document_saved.id,
            )

            # -----------------------------------------
            # 3. Add metadata
            # -----------------------------------------

            metadata = {
                "user_id": user.id,
                "document_id": document_saved.id,
                "filename": document.filename,
            }

            docs = self.processing_service.add_metadata(
                docs,
                metadata,
            )

            # -----------------------------------------
            # 4. Split
            # -----------------------------------------

            chunks = self.processing_service.split_documents(
                docs,
                chunk_size=1000,
                chunk_overlap=100,
                strategy="recursive",
            )

            logger.info(
                "Created %s chunks",
                len(chunks)
            )

            # -----------------------------------------
            # 5. Add chunk metadata
            # -----------------------------------------

            chunks = self.processing_service.add_chunk_metadata(
                chunks
            )

            # -----------------------------------------
            # 6. Store in Chroma
            # -----------------------------------------

            self.processing_service.store_documents(
                chunks,
                document_id=document_saved.id,
            )

            # -----------------------------------------
            # 7. Update status
            # -----------------------------------------

            document_saved.status = "completed"

            db.commit()
            db.refresh(document_saved)

            logger.info(
                "Document ingestion completed: id=%s",
                document_saved.id,
            )

            return document_saved

        except DocumentError:

            logger.exception(
                "Document processing failed: filename=%s",
                document.filename,
            )

            if document_saved is not None:
                document_saved.status = "failed"
                db.commit()

            raise

        except Exception as e:

            logger.exception(
                "Unexpected document ingestion error"
            )

            if document_saved is not None:
                document_saved.status = "failed"
                db.commit()

            raise DocumentProcessingError(
                "Unexpected error while processing document."
            ) from e

    def create_document(
        self,
        document: UploadFile,
        user_id: int,
        file_path: str,
        db: DbSession,
    ):

        try:

            repository = DocumentRepository(db)

            document_entity = Document(
                user_id=user_id,
                filename=document.filename,
                file_path=file_path,
                file_size=document.size,
                status="processing",
                extracted_text=None,
            )

            return repository.create_document(
                document_entity
            )

        except Exception as e:

            logger.exception(
                "Failed to create document database record"
            )

            raise DocumentProcessingError(
                "Failed to create document."
            ) from e