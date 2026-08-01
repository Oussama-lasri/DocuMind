from sqlalchemy.orm import Session
from app.models.document import Document

class DocumentRepository:
    def __init__(self, db_session):
        self.db_session = db_session

    def get_document_by_id(self, document_id: int):
        return self.db_session.query(Document).filter(Document.id == document_id).first()

    def create_document(self, document: Document):
        self.db_session.add(document)
        self.db_session.commit()
        self.db_session.refresh(document)
        return document

    def update_document(self, document_id: int, updated_data: dict):
        document = self.get_document_by_id(document_id)
        if not document:
            return None
        for key, value in updated_data.items():
            setattr(document, key, value)
        self.db_session.commit()
        return document

    def delete_document(self, document_id: int):
        document = self.get_document_by_id(document_id)
        if not document:
            return None
        self.db_session.delete(document)
        self.db_session.commit()
        return document