from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, UnstructuredHTMLLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List

class DocumentProcessingService:
    def __init__(self , embeddings=None, db_dir=None):
        self.embeddings = embeddings or HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.db_dir = db_dir or "chroma_db"

    def process_document(self, document_path: str) -> dict:
        pass

    @staticmethod
    def load_document(file_path: str) -> list[Document]:
        if file_path.endswith('.pdf'):
            loader = PyPDFLoader(file_path)
        elif file_path.endswith('.docx'):
            loader = Docx2txtLoader(file_path)
        elif file_path.endswith('.html'):
            loader = UnstructuredHTMLLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
        return loader.load()

    @staticmethod
    def add_metadata(documents: List[Document], metadata: dict) -> List[Document]:
        for doc in documents:
            doc.metadata.update(metadata)
        return documents
    

    def get_strategy(self, strategy: str):
        if strategy == "recursive":
             return RecursiveCharacterTextSplitter
        #  add more strateges in future 
        else:
            raise ValueError(f"Unsupported splitting strategy: {strategy}")