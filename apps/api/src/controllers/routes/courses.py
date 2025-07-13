import uuid
from datetime import datetime

from flask import Blueprint, current_app, jsonify, request
from sqlalchemy.exc import IntegrityError

from ...database import db
from ...models import Course, CoursePurchase, User

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")

# ========== ADMIN CRUD ========== #


@courses_bp.route("/", methods=["GET"])
def list_courses():
    """Listar todos os cursos (admin e cliente)"""
    courses = Course.query.order_by(Course.created_at.desc()).all()
    return jsonify(
        [
            {
                "id": c.id,
                "title": c.title,
                "description": c.description,
                "price": float(c.price),
                "instructor": c.instructor,
                "image_url": c.image_url,
                "status": c.status,
                "start_date": c.start_date.isoformat() if c.start_date else None,
                "end_date": c.end_date.isoformat() if c.end_date else None,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat(),
            }
            for c in courses
        ]
    )


@courses_bp.route("/", methods=["POST"])
def create_course():
    """Criar novo curso (admin)"""
    data = request.get_json()
    try:
        course = Course()
        course.title = data["title"]
        course.description = data.get("description")
        course.price = data["price"]
        course.instructor = data.get("instructor")
        course.image_url = data.get("image_url")
        course.status = data.get("status", "active")
        course.start_date = (
            datetime.fromisoformat(data["start_date"])
            if data.get("start_date")
            else None
        )
        course.end_date = (
            datetime.fromisoformat(data["end_date"]) if data.get("end_date") else None
        )
        db.session.add(course)
        db.session.commit()
        return jsonify({"message": "Curso criado com sucesso", "id": course.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@courses_bp.route("/<course_id>", methods=["GET"])
def get_course(course_id):
    """Obter detalhes de um curso"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Curso não encontrado"}), 404
    return jsonify(
        {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "price": float(course.price),
            "instructor": course.instructor,
            "image_url": course.image_url,
            "status": course.status,
            "start_date": course.start_date.isoformat() if course.start_date else None,
            "end_date": course.end_date.isoformat() if course.end_date else None,
            "created_at": course.created_at.isoformat(),
            "updated_at": course.updated_at.isoformat(),
        }
    )


@courses_bp.route("/<course_id>", methods=["PUT"])
def update_course(course_id):
    """Editar curso (admin)"""
    data = request.get_json()
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Curso não encontrado"}), 404
    try:
        course.title = data.get("title", course.title)
        course.description = data.get("description", course.description)
        course.price = data.get("price", course.price)
        course.instructor = data.get("instructor", course.instructor)
        course.image_url = data.get("image_url", course.image_url)
        course.status = data.get("status", course.status)
        course.start_date = (
            datetime.fromisoformat(data["start_date"])
            if data.get("start_date")
            else course.start_date
        )
        course.end_date = (
            datetime.fromisoformat(data["end_date"])
            if data.get("end_date")
            else course.end_date
        )
        db.session.commit()
        return jsonify({"message": "Curso atualizado com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@courses_bp.route("/<course_id>", methods=["DELETE"])
def delete_course(course_id):
    """Excluir curso (admin)"""
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error": "Curso não encontrado"}), 404
    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({"message": "Curso excluído com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ========== CLIENTE: Comprar e listar cursos comprados ========== #


@courses_bp.route("/<course_id>/buy", methods=["POST"])
def buy_course(course_id):
    """Comprar curso (cliente)"""
    data = request.get_json()
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id é obrigatório"}), 400
    course = Course.query.get(course_id)
    if not course or course.status != "active":
        return jsonify({"error": "Curso não disponível"}), 404
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404
    # Verificar se já comprou
    existing = CoursePurchase.query.filter_by(
        user_id=user_id, course_id=course_id
    ).first()
    if existing:
        return jsonify({"error": "Curso já comprado"}), 400
    try:
        purchase = CoursePurchase()
        purchase.user_id = user_id
        purchase.course_id = course_id
        purchase.price_paid = course.price
        db.session.add(purchase)
        db.session.commit()
        return jsonify({"message": "Curso comprado com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@courses_bp.route("/purchased/<user_id>", methods=["GET"])
def list_purchased_courses(user_id):
    """Listar cursos comprados pelo usuário"""
    purchases = CoursePurchase.query.filter_by(user_id=user_id).all()
    return jsonify(
        [
            {
                "id": p.course.id,
                "title": p.course.title,
                "description": p.course.description,
                "price_paid": float(p.price_paid),
                "instructor": p.course.instructor,
                "image_url": p.course.image_url,
                "purchase_date": p.purchase_date.isoformat(),
            }
            for p in purchases
        ]
    )
