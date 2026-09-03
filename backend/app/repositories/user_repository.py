from app.models.user import User

class UserRepository:
    def __init__(self, db_session):
        self.db = db_session
        
        
    def create_user(self, user: User) -> User:
        db_user = user
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_all_users(self):
        return self.db.query(User).all() 