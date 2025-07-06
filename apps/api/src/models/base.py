"""
Modelos base para o sistema Mestres do Café
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

# Instância global do SQLAlchemy
db = SQLAlchemy()

class BaseModel(db.Model):
    """Modelo base com campos comuns"""
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Converte o modelo para dicionário"""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
    
    def save(self):
        """Salva o modelo no banco"""
        db.session.add(self)
        db.session.commit()
        return self
    
    def delete(self):
        """Remove o modelo do banco"""
        db.session.delete(self)
        db.session.commit()
        return True

