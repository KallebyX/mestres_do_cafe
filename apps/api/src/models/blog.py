"""
Modelos de blog e conteúdo
"""

import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import db


class BlogCategory(db.Model):
    __tablename__ = "blog_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    color = Column(String(7))  # Para cores hex
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    # Relacionamentos removidos - sem chave estrangeira

    def __repr__(self):
        return f"<BlogCategory(id={self.id}, name={self.name}, slug={self.slug})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "color": self.color,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class BlogTag(db.Model):
    __tablename__ = "blog_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    color = Column(String(7))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<BlogTag(id={self.id}, name={self.name}, slug={self.slug})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "color": self.color,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }


class BlogPostTag(db.Model):
    __tablename__ = "blog_post_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("blog_posts.id", ondelete="CASCADE"))
    tag_id = Column(UUID(as_uuid=True), ForeignKey("blog_tags.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<BlogPostTag(id={self.id}, post_id={self.post_id}, tag_id={self.tag_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "post_id": str(self.post_id),
            "tag_id": str(self.tag_id),
            "created_at": self.created_at.isoformat(),
        }


class BlogPostView(db.Model):
    __tablename__ = "blog_post_views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("blog_posts.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    ip_address = Column(String(45))  # IPv4/IPv6 para compatibilidade SQLite
    view_date = Column(Date, default=func.current_date())
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<BlogPostView(id={self.id}, post_id={self.post_id}, user_id={self.user_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "post_id": str(self.post_id),
            "user_id": str(self.user_id) if self.user_id else None,
            "ip_address": str(self.ip_address) if self.ip_address else None,
            "view_date": self.view_date.isoformat() if self.view_date else None,
            "created_at": self.created_at.isoformat(),
        }


class BlogPostLike(db.Model):
    __tablename__ = "blog_post_likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("blog_posts.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=func.now())

    def __repr__(self):
        return f"<BlogPostLike(id={self.id}, post_id={self.post_id}, user_id={self.user_id})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "post_id": str(self.post_id),
            "user_id": str(self.user_id),
            "created_at": self.created_at.isoformat(),
        }


class BlogPost(db.Model):
    __tablename__ = "blog_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(Text)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    category = Column(String(100))  # Campo principal de categoria
    tags = Column(Text)  # JSON string para compatibilidade SQLite
    image_url = Column(Text)

    # SEO
    meta_title = Column(String(255))
    meta_description = Column(Text)

    # Status
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)

    # Timestamps
    published_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # Relacionamentos
    comments = relationship("BlogComment", back_populates="post")
    tags_rel = relationship("BlogPostTag", cascade="all, delete-orphan")
    views = relationship("BlogPostView", cascade="all, delete-orphan")
    likes = relationship("BlogPostLike", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BlogPost(id={self.id}, title={self.title}, slug={self.slug})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "slug": self.slug,
            "content": self.content,
            "excerpt": self.excerpt,
            "author_id": str(self.author_id) if self.author_id else None,
            "category": self.category,
            "tags": self.tags,
            "image_url": self.image_url,
            "meta_title": self.meta_title,
            "meta_description": self.meta_description,
            "is_published": self.is_published,
            "is_featured": self.is_featured,
            "published_at": (
                self.published_at.isoformat() if self.published_at else None
            ),
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }


class BlogComment(db.Model):
    __tablename__ = "blog_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(
        UUID(as_uuid=True), ForeignKey("blog_posts.id", ondelete="CASCADE")
    )
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    author_name = Column(String(255))
    author_email = Column(String(255))
    content = Column(Text, nullable=False)
    parent_id = Column(
        UUID(as_uuid=True), ForeignKey("blog_comments.id", ondelete="CASCADE")
    )
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

    # Relacionamentos
    post = relationship("BlogPost", back_populates="comments")
    parent = relationship("BlogComment", remote_side=[id])
    replies = relationship("BlogComment")

    def __repr__(self):
        return f"<BlogComment(id={self.id}, post_id={self.post_id}, author_name={self.author_name})>"

    def to_dict(self):
        return {
            "id": str(self.id),
            "post_id": str(self.post_id),
            "user_id": str(self.user_id) if self.user_id else None,
            "author_name": self.author_name,
            "author_email": self.author_email,
            "content": self.content,
            "parent_id": str(self.parent_id) if self.parent_id else None,
            "is_approved": self.is_approved,
            "created_at": self.created_at.isoformat(),
        }
