import os
from datetime import datetime
from uuid import uuid4

from flask import Blueprint, jsonify, request, send_file
from sqlalchemy import desc
from werkzeug.utils import secure_filename

from ...database import db
from ...models.media import MediaFile

media_bp = Blueprint("media", __name__, url_prefix="/api/media")

# Configurações de upload
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {
    "images": {"jpg", "jpeg", "png", "gif", "webp", "svg"},
    "documents": {"pdf", "doc", "docx", "txt", "rtf"},
    "videos": {"mp4", "avi", "mov", "mkv", "wmv"},
    "audio": {"mp3", "wav", "flac", "ogg"}
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def allowed_file(filename, file_type=None):
    """Verificar se arquivo é permitido"""
    if "." not in filename:
        return False
    
    extension = filename.rsplit(".", 1)[1].lower()
    
    if file_type and file_type in ALLOWED_EXTENSIONS:
        return extension in ALLOWED_EXTENSIONS[file_type]
    
    # Verificar em todos os tipos se não especificado
    all_extensions = set()
    for exts in ALLOWED_EXTENSIONS.values():
        all_extensions.update(exts)
    
    return extension in all_extensions


def get_file_type(filename):
    """Determinar tipo do arquivo"""
    if "." not in filename:
        return "unknown"
    
    extension = filename.rsplit(".", 1)[1].lower()
    
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if extension in extensions:
            return file_type
    
    return "unknown"


@media_bp.route("/upload", methods=["POST"])
def upload_file():
    """Upload de arquivo"""
    try:
        if "file" not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400
        
        file = request.files["file"]
        
        if file.filename == "":
            return jsonify({"error": "Nenhum arquivo selecionado"}), 400
        
        # Verificar tamanho do arquivo
        file.seek(0, 2)  # Mover para o final do arquivo
        file_size = file.tell()
        file.seek(0)  # Voltar ao início
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "Arquivo muito grande"}), 400
        
        # Verificar tipo do arquivo
        file_type = request.form.get("type")
        if not allowed_file(file.filename, file_type):
            return jsonify({"error": "Tipo de arquivo não permitido"}), 400
        
        # Gerar nome único para o arquivo
        original_filename = secure_filename(file.filename or "")
        file_extension = original_filename.rsplit(".", 1)[1].lower()
        unique_filename = f"{uuid4()}.{file_extension}"
        
        # Determinar tipo automaticamente se não fornecido
        if not file_type:
            file_type = get_file_type(original_filename)
        
        # Criar diretório se não existir
        upload_dir = os.path.join(UPLOAD_FOLDER, file_type)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Salvar arquivo
        file_path = os.path.join(upload_dir, unique_filename)
        file.save(file_path)
        
        # Salvar informações no banco
        media_file = MediaFile(
            filename=unique_filename,
            original_filename=original_filename,
            file_path=file_path,
            file_type=file_type,
            file_size=file_size,
            mime_type=file.content_type or "application/octet-stream",
            uploaded_by=request.form.get("uploaded_by"),
            alt_text=request.form.get("alt_text"),
            caption=request.form.get("caption"),
            is_public=request.form.get("is_public", "true").lower() == "true"
        )
        
        db.session.add(media_file)
        db.session.commit()
        
        return jsonify({
            "message": "Arquivo enviado com sucesso",
            "file": media_file.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@media_bp.route("/", methods=["GET"])
def get_files():
    """Listar arquivos de mídia"""
    try:
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        file_type = request.args.get("type")
        search = request.args.get("search")
        
        query = MediaFile.query
        
        # Filtros
        if file_type:
            query = query.filter(MediaFile.file_type == file_type)
        
        if search:
            query = query.filter(
                MediaFile.original_filename.ilike(f"%{search}%") |
                MediaFile.alt_text.ilike(f"%{search}%") |
                MediaFile.caption.ilike(f"%{search}%")
            )
        
        files = query.order_by(desc(MediaFile.created_at)).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "files": [file.to_dict() for file in files.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": files.total,
                "pages": files.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@media_bp.route("/<file_id>", methods=["GET"])
def get_file(file_id):
    """Obter arquivo específico"""
    try:
        media_file = MediaFile.query.get_or_404(file_id)
        return jsonify({"file": media_file.to_dict()})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@media_bp.route("/<file_id>", methods=["PUT"])
def update_file(file_id):
    """Atualizar metadados do arquivo"""
    try:
        media_file = MediaFile.query.get_or_404(file_id)
        data = request.get_json()
        
        # Campos permitidos para atualização
        allowed_fields = [
            "original_filename", "alt_text", "caption", "is_public"
        ]
        
        for field in allowed_fields:
            if field in data:
                setattr(media_file, field, data[field])
        
        media_file.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "Arquivo atualizado com sucesso",
            "file": media_file.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@media_bp.route("/<file_id>", methods=["DELETE"])
def delete_file(file_id):
    """Deletar arquivo"""
    try:
        media_file = MediaFile.query.get_or_404(file_id)
        
        # Deletar arquivo físico
        if os.path.exists(media_file.file_path):
            os.remove(media_file.file_path)
        
        # Deletar do banco
        db.session.delete(media_file)
        db.session.commit()
        
        return jsonify({"message": "Arquivo deletado com sucesso"})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@media_bp.route("/<file_id>/download", methods=["GET"])
def download_file(file_id):
    """Download do arquivo"""
    try:
        media_file = MediaFile.query.get_or_404(file_id)
        
        if not os.path.exists(media_file.file_path):
            return jsonify({"error": "Arquivo não encontrado"}), 404
        
        return send_file(
            media_file.file_path,
            as_attachment=True,
            download_name=media_file.original_filename
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@media_bp.route("/<file_id>/view", methods=["GET"])
def view_file(file_id):
    """Visualizar arquivo no navegador"""
    try:
        media_file = MediaFile.query.get_or_404(file_id)
        
        if not media_file.is_public:
            return jsonify({"error": "Arquivo não é público"}), 403
        
        if not os.path.exists(media_file.file_path):
            return jsonify({"error": "Arquivo não encontrado"}), 404
        
        return send_file(
            media_file.file_path,
            mimetype=media_file.mime_type
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@media_bp.route("/types", methods=["GET"])
def get_file_types():
    """Listar tipos de arquivo permitidos"""
    try:
        return jsonify({
            "allowed_types": ALLOWED_EXTENSIONS,
            "max_file_size": MAX_FILE_SIZE
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@media_bp.route("/stats", methods=["GET"])
def get_media_stats():
    """Estatísticas de mídia"""
    try:
        total_files = MediaFile.query.count()
        
        # Estatísticas por tipo
        type_stats = {}
        for file_type in ALLOWED_EXTENSIONS.keys():
            count = MediaFile.query.filter_by(file_type=file_type).count()
            type_stats[file_type] = count
        
        # Tamanho total dos arquivos
        total_size = db.session.query(
            db.func.sum(MediaFile.file_size)
        ).scalar() or 0
        
        # Arquivos públicos vs privados
        public_files = MediaFile.query.filter_by(is_public=True).count()
        private_files = total_files - public_files
        
        return jsonify({
            "stats": {
                "total_files": total_files,
                "by_type": type_stats,
                "total_size": total_size,
                "public_files": public_files,
                "private_files": private_files
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@media_bp.route("/cleanup", methods=["POST"])
def cleanup_orphaned_files():
    """Limpar arquivos órfãos (sem referência no banco)"""
    try:
        orphaned_count = 0
        
        # Verificar cada tipo de arquivo
        for file_type in ALLOWED_EXTENSIONS.keys():
            type_dir = os.path.join(UPLOAD_FOLDER, file_type)
            
            if not os.path.exists(type_dir):
                continue
            
            # Listar arquivos no diretório
            for filename in os.listdir(type_dir):
                file_path = os.path.join(type_dir, filename)
                
                # Verificar se arquivo existe no banco
                media_file = MediaFile.query.filter_by(
                    filename=filename,
                    file_type=file_type
                ).first()
                
                if not media_file:
                    # Arquivo órfão, deletar
                    os.remove(file_path)
                    orphaned_count += 1
        
        return jsonify({
            "message": f"{orphaned_count} arquivos órfãos removidos"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@media_bp.route("/bulk-delete", methods=["POST"])
def bulk_delete():
    """Deletar múltiplos arquivos"""
    try:
        data = request.get_json()
        file_ids = data.get("file_ids", [])
        
        if not file_ids:
            return jsonify({"error": "Nenhum arquivo especificado"}), 400
        
        deleted_count = 0
        errors = []
        
        for file_id in file_ids:
            try:
                media_file = MediaFile.query.get(file_id)
                if not media_file:
                    errors.append(f"Arquivo {file_id} não encontrado")
                    continue
                
                # Deletar arquivo físico
                if os.path.exists(media_file.file_path):
                    os.remove(media_file.file_path)
                
                # Deletar do banco
                db.session.delete(media_file)
                deleted_count += 1
                
            except Exception as e:
                errors.append(f"Erro ao deletar {file_id}: {str(e)}")
        
        db.session.commit()
        
        result = {
            "message": f"{deleted_count} arquivos deletados com sucesso"
        }
        
        if errors:
            result["errors"] = errors
        
        return jsonify(result)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@media_bp.route("/search", methods=["GET"])
def search_files():
    """Buscar arquivos por nome ou metadados"""
    try:
        query = request.args.get("q", "")
        file_type = request.args.get("type")
        page = request.args.get("page", 1, type=int)
        per_page = request.args.get("per_page", 20, type=int)
        
        if not query:
            return jsonify({"error": "Termo de busca obrigatório"}), 400
        
        search_query = MediaFile.query.filter(
            MediaFile.original_filename.ilike(f"%{query}%") |
            MediaFile.alt_text.ilike(f"%{query}%") |
            MediaFile.caption.ilike(f"%{query}%")
        )
        
        if file_type:
            search_query = search_query.filter(
                MediaFile.file_type == file_type
            )
        
        results = search_query.order_by(
            desc(MediaFile.created_at)
        ).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            "results": [file.to_dict() for file in results.items],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": results.total,
                "pages": results.pages
            }
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500