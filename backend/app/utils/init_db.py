from ..core.database import Base, engine
from ..models.document import Document
from ..models.user import User

def create_tables():
    """
    Initialize the database by creating all tables.
    This function should be called at the start of the application.
    """
 
    User.__table__.create(bind=engine, checkfirst=True)
    Document.__table__.create(bind=engine, checkfirst=True)
    
  
    
   
    Base.metadata.create_all(bind=engine)
    print("Database initialized and tables created.")