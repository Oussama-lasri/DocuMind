from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.exceptions import (
    DocumentError,
    DocumentLoadError,
    DocumentProcessingError,
    DocumentRetrievalError,
    DocumentStorageError,
    UnsupportedFileTypeError,
)


async def unsupported_file_type_handler(
    request: Request,
    exc: UnsupportedFileTypeError,
):
    return JSONResponse(
        status_code=400,
        content={
            "detail": str(exc)
        },
    )


async def document_load_handler(
    request: Request,
    exc: DocumentLoadError,
):
    return JSONResponse(
        status_code=422,
        content={
            "detail": str(exc)
        },
    )


async def document_storage_handler(
    request: Request,
    exc: DocumentStorageError,
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Failed to store document."
        },
    )


async def document_retrieval_handler(
    request: Request,
    exc: DocumentRetrievalError,
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Failed to search documents."
        },
    )


async def document_processing_handler(
    request: Request,
    exc: DocumentProcessingError,
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc)
        },
    )


async def document_error_handler(
    request: Request,
    exc: DocumentError,
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Document operation failed."
        },
    )