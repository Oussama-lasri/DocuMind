from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, UnstructuredHTMLLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma
from typing import List
import os

class DocumentProcessingService:
    db_dir = "chroma_db"
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    def __init__(self , embeddings=None, db_dir=None):
        self.embeddings = embeddings or HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        db_dir = db_dir or "chroma_db"

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

    @staticmethod
    def add_chunk_metadata(chunks: list[Document]) -> list[Document]:

        total_chunks = len(chunks)

        for index, chunk in enumerate(chunks):

            chunk.metadata.update({
                "chunk_index": index,
                "chunk_count": total_chunks,
                "chunk_size": len(chunk.page_content),
            })

        return chunks
        

    def get_strategy(self, strategy: str):
        if strategy == "recursive":
             return RecursiveCharacterTextSplitter
        #  add more strateges in future 
        else:
            raise ValueError(f"Unsupported splitting strategy: {strategy}")
        
    @staticmethod
    def split_documents(documents: list[Document], chunk_size: int = 1000, chunk_overlap: int = 100, strategy: str = "recursive") -> list[Document]:
        splitter = DocumentProcessingService().get_strategy(strategy)(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
        chunks = []
        for doc in documents:
            doc_chunks = splitter.split_documents([doc])
            chunks.extend(doc_chunks)
        return chunks

    @classmethod
    def store_documents(cls,docs, store_name):  
        # store_name = store_name.split("/")[-1].split(".")[0]  # Extract the base name without extension
        print(f"\n=== store documents ===")
        persistent_directory = os.path.join(cls.db_dir, store_name)
        if persistent_directory is None:
            os.makedirs(cls.db_dir, exist_ok=True)
        if not docs:
            print("ERROR: No documents provided to store!")
            return
        try :
            if not os.path.exists(persistent_directory):
                print(f"\n--- Creating vector store {store_name} ---")
                # db = Chroma.from_documents(
                #     documents = docs, 
                #     embedding = cls.embeddings, 
                #     persist_directory=persistent_directory,
                #     collection_name=store_name
                # )
                
                db = Chroma.from_documents(
                    documents=docs,
                    embedding=cls.embeddings,
                    collection_name=store_name,          # filename as collection name, NOT as path
                    persist_directory="./chroma_db",     # same fixed dir every time
                )
                collection = db._collection
                verification = collection.get(include=['metadatas', 'documents'])
                print(f"Documents stored: {len(verification['documents'])}")
                print(f"--- Finished creating vector store {store_name} ---")
            else:
                print(
                    f"Vector store {store_name} already exists. No need to initialize.")
        except Exception as e:
            print(f"ERROR storing documents: {str(e)}")
            raise e