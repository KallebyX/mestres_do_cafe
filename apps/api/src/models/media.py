"""
Modelos de mídia e arquivos
"""

import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from ..database import db


class MediaFile(db.Model):
    __tablename__ = "media_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_url = Column(Text, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_type = Column(String(50), nullable=False)
    mime_type = Column(String(100), nullable=False)

    # Associações
    product_id = Column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL")
    )
    blog_post_id = Column(
        UUID(as_uuid=True), ForeignKey("blog_posts.id", ondelete="SET NULL")
    )

    # Metadados
    alt_text = Column(Text)
    description = Column(Text)

    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<MediaFile(id={self.id}, filename={self.filename}, file_type={self.file_type})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "filename": self.filename,
            "original_filename": self.original_filename,
            "file_path": self.file_path,
            "file_url": self.file_url,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "mime_type": self.mime_type,
            "product_id": str(self.product_id) if self.product_id else None,
            "blog_post_id": str(self.blog_post_id) if self.blog_post_id else None,
            "alt_text": self.alt_text,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
        }
