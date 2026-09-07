import logging
import os
from typing import List

from langchain_community.document_loaders import (
    Docx2txtLoader,
    PyPDFLoader,
    UnstructuredHTMLLoader,
)
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.exceptions import (
    DocumentLoadError,
    DocumentProcessingError,
    DocumentRetrievalError,
    DocumentStorageError,
    UnsupportedFileTypeError,
)


logger = logging.getLogger(__name__)


class DocumentProcessingService:

    DB_DIR = "chroma_db"
    COLLECTION_NAME = "documents"

    def __init__(self, embeddings=None, db_dir=None):

        try:
            self.embeddings = embeddings or HuggingFaceEmbeddings(
                model_name="sentence-transformers/all-MiniLM-L6-v2"
            )

            self.db_dir = db_dir or self.DB_DIR
            self._store = None

        except Exception as e:
            logger.exception("Failed to initialize document processing service")

            raise DocumentProcessingError(
                "Failed to initialize document processing service."
            ) from e



    def get_store(self) -> Chroma:

        if self._store is None:

            try:
                os.makedirs(self.db_dir, exist_ok=True)

                self._store = Chroma(
                    collection_name=self.COLLECTION_NAME,
                    embedding_function=self.embeddings,
                    persist_directory=self.db_dir,
                )

            except Exception as e:

                logger.exception(
                    "Failed to initialize Chroma vector store"
                )

                raise DocumentStorageError(
                    "Failed to initialize vector store."
                ) from e

        return self._store

 

    @staticmethod
    def load_document(file_path: str) -> List[Document]:

        try:

            if not os.path.exists(file_path):
                raise DocumentLoadError(
                    f"File does not exist: {file_path}"
                )

            extension = os.path.splitext(file_path)[1].lower()

            if extension == ".pdf":
                loader = PyPDFLoader(file_path)

            elif extension == ".docx":
                loader = Docx2txtLoader(file_path)

            elif extension == ".html":
                loader = UnstructuredHTMLLoader(file_path)

            else:
                raise UnsupportedFileTypeError(
                    f"Unsupported file type: {extension}"
                )

            documents = loader.load()

            if not documents:
                raise DocumentLoadError(
                    "The document contains no readable content."
                )

            return documents

        except UnsupportedFileTypeError:
            raise

        except DocumentLoadError:
            raise

        except Exception as e:

            logger.exception(
                "Failed to load document: %s",
                file_path
            )

            raise DocumentLoadError(
                "Failed to load document."
            ) from e



    @staticmethod
    def add_metadata(
        documents: List[Document],
        metadata: dict
    ) -> List[Document]:

        try:

            for doc in documents:
                doc.metadata.update(metadata)

            return documents

        except Exception as e:

            logger.exception("Failed to add document metadata")

            raise DocumentProcessingError(
                "Failed to add document metadata."
            ) from e

  

    @staticmethod
    def add_chunk_metadata(
        chunks: List[Document]
    ) -> List[Document]:

        try:

            total_chunks = len(chunks)

            for index, chunk in enumerate(chunks):

                chunk.metadata.update({
                    "chunk_index": index,
                    "chunk_count": total_chunks,
                    "chunk_size": len(chunk.page_content),
                })

            return chunks

        except Exception as e:

            logger.exception("Failed to add chunk metadata")

            raise DocumentProcessingError(
                "Failed to add chunk metadata."
            ) from e

    # ---------------------------------------------------------
    # Splitting strategy
    # ---------------------------------------------------------

    @staticmethod
    def get_strategy(strategy: str):

        if strategy == "recursive":
            return RecursiveCharacterTextSplitter

        raise DocumentProcessingError(
            f"Unsupported splitting strategy: {strategy}"
        )



    def split_documents(
        self,
        documents: List[Document],
        chunk_size: int = 1000,
        chunk_overlap: int = 100,
        strategy: str = "recursive",
    ) -> List[Document]:

        try:

            if not documents:
                raise DocumentProcessingError(
                    "No documents provided for splitting."
                )

            if chunk_size <= 0:
                raise DocumentProcessingError(
                    "chunk_size must be greater than 0."
                )

            if chunk_overlap < 0:
                raise DocumentProcessingError(
                    "chunk_overlap cannot be negative."
                )

            if chunk_overlap >= chunk_size:
                raise DocumentProcessingError(
                    "chunk_overlap must be smaller than chunk_size."
                )

            splitter_class = self.get_strategy(strategy)

            splitter = splitter_class(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
            )

            chunks = []

            for doc in documents:

                chunks.extend(
                    splitter.split_documents([doc])
                )

            if not chunks:
                raise DocumentProcessingError(
                    "Document splitting produced no chunks."
                )

            return chunks

        except DocumentProcessingError:
            raise

        except Exception as e:

            logger.exception("Failed to split documents")

            raise DocumentProcessingError(
                "Failed to split document."
            ) from e

   

    def store_documents(
        self,
        docs: List[Document],
        document_id: int
    ):

        if not docs:
            raise DocumentStorageError(
                "No documents provided to store."
            )

        try:

            store = self.get_store()

            # Remove old chunks
            self.delete_document(document_id)

            ids = [
                f"{document_id}_{i}"
                for i in range(len(docs))
            ]

            store.add_documents(
                documents=docs,
                ids=ids,
            )

            logger.info(
                "Stored %s chunks for document_id=%s",
                len(docs),
                document_id,
            )

        except DocumentStorageError:
            raise

        except Exception as e:

            logger.exception(
                "Failed to store document_id=%s",
                document_id,
            )

            raise DocumentStorageError(
                "Failed to store document."
            ) from e

 

    def delete_document(self, document_id: int):

        try:

            store = self.get_store()

            store.delete(
                where={
                    "document_id": document_id
                }
            )

            logger.info(
                "Deleted chunks for document_id=%s",
                document_id
            )

        except DocumentStorageError:
            raise

        except Exception as e:

            logger.exception(
                "Failed to delete document_id=%s",
                document_id
            )

            raise DocumentStorageError(
                "Failed to delete document."
            ) from e



    def query(
        self,
        query_text: str,
        user_id: int,
        document_id: int = None,
        k: int = 5
    ):

        try:

            if not query_text.strip():
                raise DocumentRetrievalError(
                    "Search query cannot be empty."
                )

            if k <= 0:
                raise DocumentRetrievalError(
                    "k must be greater than 0."
                )

            store = self.get_store()

            filters = {
                "user_id": user_id
            }

            if document_id is not None:
                filters["document_id"] = document_id

            documents = store.similarity_search(
                query_text,
                k=k,
                filter=filters,
            )

            return documents

        except DocumentRetrievalError:
            raise

        except Exception as e:

            logger.exception(
                "Document retrieval failed for user_id=%s",
                user_id
            )

            raise DocumentRetrievalError(
                "Failed to search documents."
            ) from e