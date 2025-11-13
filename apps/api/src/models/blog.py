"""
Modelos para o sistema de Blog
"""

from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, DateTime, ForeignKey,
    CheckConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from database import db


class BlogPost(db.Model):
    """Postagens do blog"""
    __tablename__ = 'blog_posts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Conteúdo
    title = Column(String(200), nullable=False, index=True)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    excerpt = Column(Text)  # Resumo/preview
    content = Column(Text, nullable=False)

    # Metadados
    author_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    category = Column(String(50), index=True)  # Receitas, Dicas, Notícias, etc.
    tags = Column(String(500))  # Tags separadas por vírgula

    # Status
    status = Column(String(20), default='draft', nullable=False)  # draft, published, archived
    published_at = Column(DateTime(timezone=True))

    # SEO
    meta_title = Column(String(200))
    meta_description = Column(String(500))
    meta_keywords = Column(String(500))

    # Mídia
    featured_image = Column(String(500))
    featured_image_alt = Column(String(200))

    # Estatísticas
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)

    # Configurações
    allow_comments = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    author = relationship('User', backref='blog_posts')
    comments = relationship('BlogComment', back_populates='post', cascade='all, delete-orphan')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('draft', 'published', 'archived')",
            name='check_blog_post_status'
        ),
        Index('idx_blog_post_status_published', 'status', 'published_at'),
        Index('idx_blog_post_category', 'category'),
    )

    def __repr__(self):
        return f'<BlogPost {self.title}>'

    def to_dict(self):
        """Serializar para JSON"""
        return {
            'id': str(self.id),
            'title': self.title,
            'slug': self.slug,
            'excerpt': self.excerpt,
            'content': self.content,
            'author_id': str(self.author_id),
            'author_name': self.author.full_name if self.author else None,
            'category': self.category,
            'tags': self.tags.split(',') if self.tags else [],
            'status': self.status,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'meta_title': self.meta_title,
            'meta_description': self.meta_description,
            'meta_keywords': self.meta_keywords,
            'featured_image': self.featured_image,
            'featured_image_alt': self.featured_image_alt,
            'views_count': self.views_count,
            'likes_count': self.likes_count,
            'comments_count': self.comments_count,
            'allow_comments': self.allow_comments,
            'is_featured': self.is_featured,
            'is_pinned': self.is_pinned,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class BlogComment(db.Model):
    """Comentários em postagens do blog"""
    __tablename__ = 'blog_comments'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Relacionamentos
    post_id = Column(UUID(as_uuid=True), ForeignKey('blog_posts.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('blog_comments.id'))  # Para respostas

    # Conteúdo
    content = Column(Text, nullable=False)

    # Status
    status = Column(String(20), default='pending', nullable=False)  # pending, approved, spam, deleted

    # Estatísticas
    likes_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    post = relationship('BlogPost', back_populates='comments')
    user = relationship('User', backref='blog_comments')
    parent = relationship('BlogComment', remote_side=[id], backref='replies')

    # Constraints
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'approved', 'spam', 'deleted')",
            name='check_blog_comment_status'
        ),
        Index('idx_blog_comment_post', 'post_id', 'status'),
    )

    def __repr__(self):
        return f'<BlogComment on {self.post_id} by {self.user_id}>'

    def to_dict(self):
        """Serializar para JSON"""
        return {
            'id': str(self.id),
            'post_id': str(self.post_id),
            'user_id': str(self.user_id),
            'user_name': self.user.full_name if self.user else 'Anônimo',
            'parent_id': str(self.parent_id) if self.parent_id else None,
            'content': self.content,
            'status': self.status,
            'likes_count': self.likes_count,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'replies': [reply.to_dict() for reply in self.replies] if hasattr(self, 'replies') else []
        }
