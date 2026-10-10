from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from app.api.v1.router import api_router
from app.utils.init_db import create_tables
from app.core.middleware import AuthMiddleware
from app.core.exceptions import (
    DocumentError,
    DocumentLoadError,
    DocumentProcessingError,
    DocumentRetrievalError,
    DocumentStorageError,
    UnsupportedFileTypeError,
)


from app.core.exception_handlers import (
    document_error_handler,
    document_load_handler,
    document_processing_handler,
    document_retrieval_handler,
    document_storage_handler,
    unsupported_file_type_handler,
)

app = FastAPI()

# origins = [
#     # "http://localhost.tiangolo.com",
#     # "https://localhost.tiangolo.com",
#     # "http://localhost",
#     "http://localhost:3000",
#     # "http://localhost:8080",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

# create_tables()


@app.get("/")
async def root():
    return "Hello from back-end!"


app.include_router(api_router, prefix="/api/v1")

app.add_exception_handler(
    UnsupportedFileTypeError,
    unsupported_file_type_handler,
)

app.add_exception_handler(
    DocumentLoadError,
    document_load_handler,
)

app.add_exception_handler(
    DocumentStorageError,
    document_storage_handler,
)

app.add_exception_handler(
    DocumentRetrievalError,
    document_retrieval_handler,
)

app.add_exception_handler(
    DocumentProcessingError,
    document_processing_handler,
)

app.add_exception_handler(
    DocumentError,
    document_error_handler,
)
