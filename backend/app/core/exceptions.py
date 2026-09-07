class DocumentError(Exception):
    """Base exception for document-related errors."""
    pass


class UnsupportedFileTypeError(DocumentError):
    """Raised when the uploaded file type is not supported."""
    pass


class DocumentLoadError(DocumentError):
    """Raised when a document cannot be loaded."""
    pass


class DocumentProcessingError(DocumentError):
    """Raised when document processing fails."""
    pass


class DocumentStorageError(DocumentError):
    """Raised when storing/deleting documents fails."""
    pass


class DocumentRetrievalError(DocumentError):
    """Raised when document search fails."""
    pass