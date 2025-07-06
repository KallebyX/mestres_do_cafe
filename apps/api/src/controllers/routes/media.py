from flask import Blueprint, request, jsonify, send_from_directory, current_app
from src.models.database import db, MediaFile, Product, BlogPost
from werkzeug.utils import secure_filename
import os
import uuid
from PIL import Image
import mimetypes

media_bp = Blueprint('media', __name__)

# Configurações de upload
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_upload_folders():
    """Criar pastas de upload se não existirem"""
    base_path = os.path.join(current_app.root_path, UPLOAD_FOLDER)
    folders = ['products', 'blog', 'general', 'thumbnails']
    
    for folder in folders:
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)

def generate_filename(original_filename):
    """Gerar nome único para arquivo"""
    ext = original_filename.rsplit('.', 1)[1].lower()
    return f"{uuid.uuid4().hex}.{ext}"

def create_thumbnail(image_path, thumbnail_path, size=(300, 300)):
    """Criar thumbnail da imagem"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(size, Image.Resampling.LANCZOS)
            img.save(thumbnail_path, optimize=True, quality=85)
            return True
    except Exception as e:
        print(f"Erro ao criar thumbnail: {e}")
        return False

# ===========================================
# ENDPOINTS DE UPLOAD
# ===========================================

@media_bp.route('/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de arquivo não permitido'}), 400
        
        # Verificar tamanho do arquivo
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'Arquivo muito grande. Máximo 16MB'}), 400
        
        # Parâmetros opcionais
        category = request.form.get('category', 'general')  # products, blog, general
        product_id = request.form.get('product_id')
        blog_post_id = request.form.get('blog_post_id')
        
        # Criar pastas se não existirem
        create_upload_folders()
        
        # Gerar nome único
        original_filename = secure_filename(file.filename)
        filename = generate_filename(original_filename)
        
        # Definir caminhos
        category_folder = os.path.join(UPLOAD_FOLDER, category)
        file_path = os.path.join(category_folder, filename)
        full_path = os.path.join(current_app.root_path, file_path)
        
        # Salvar arquivo
        file.save(full_path)
        
        # Criar thumbnail se for imagem
        thumbnail_path = None
        if category in ['products', 'blog'] and file.content_type.startswith('image/'):
            thumbnail_filename = f"thumb_{filename}"
            thumbnail_path = os.path.join(UPLOAD_FOLDER, 'thumbnails', thumbnail_filename)
            thumbnail_full_path = os.path.join(current_app.root_path, thumbnail_path)
            
            if create_thumbnail(full_path, thumbnail_full_path):
                thumbnail_path = f"/api/media/thumbnails/{thumbnail_filename}"
        
        # Salvar no banco de dados
        media_file = MediaFile(
            filename=filename,
            original_filename=original_filename,
            file_path=file_path,
            file_url=f"/api/media/{category}/{filename}",
            file_size=file_size,
            file_type=category,
            mime_type=file.content_type,
            product_id=product_id,
            blog_post_id=blog_post_id
        )
        
        db.session.add(media_file)
        db.session.commit()
        
        return jsonify({
            'message': 'Arquivo enviado com sucesso',
            'file': {
                'id': media_file.id,
                'filename': media_file.filename,
                'original_filename': media_file.original_filename,
                'file_url': media_file.file_url,
                'thumbnail_url': thumbnail_path,
                'file_size': media_file.file_size,
                'mime_type': media_file.mime_type,
                'created_at': media_file.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@media_bp.route('/upload/multiple', methods=['POST'])
def upload_multiple_files():
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'Nenhum arquivo enviado'}), 400
        
        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'Nenhum arquivo selecionado'}), 400
        
        category = request.form.get('category', 'general')
        product_id = request.form.get('product_id')
        blog_post_id = request.form.get('blog_post_id')
        
        uploaded_files = []
        errors = []
        
        for file in files:
            try:
                if file.filename == '' or not allowed_file(file.filename):
                    errors.append(f"Arquivo {file.filename}: tipo não permitido")
                    continue
                
                # Verificar tamanho
                file.seek(0, os.SEEK_END)
                file_size = file.tell()
                file.seek(0)
                
                if file_size > MAX_FILE_SIZE:
                    errors.append(f"Arquivo {file.filename}: muito grande")
                    continue
                
                # Processar upload
                create_upload_folders()
                original_filename = secure_filename(file.filename)
                filename = generate_filename(original_filename)
                
                category_folder = os.path.join(UPLOAD_FOLDER, category)
                file_path = os.path.join(category_folder, filename)
                full_path = os.path.join(current_app.root_path, file_path)
                
                file.save(full_path)
                
                # Criar thumbnail
                thumbnail_path = None
                if category in ['products', 'blog'] and file.content_type.startswith('image/'):
                    thumbnail_filename = f"thumb_{filename}"
                    thumbnail_path = os.path.join(UPLOAD_FOLDER, 'thumbnails', thumbnail_filename)
                    thumbnail_full_path = os.path.join(current_app.root_path, thumbnail_path)
                    
                    if create_thumbnail(full_path, thumbnail_full_path):
                        thumbnail_path = f"/api/media/thumbnails/{thumbnail_filename}"
                
                # Salvar no banco
                media_file = MediaFile(
                    filename=filename,
                    original_filename=original_filename,
                    file_path=file_path,
                    file_url=f"/api/media/{category}/{filename}",
                    file_size=file_size,
                    file_type=category,
                    mime_type=file.content_type,
                    product_id=product_id,
                    blog_post_id=blog_post_id
                )
                
                db.session.add(media_file)
                db.session.flush()
                
                uploaded_files.append({
                    'id': media_file.id,
                    'filename': media_file.filename,
                    'original_filename': media_file.original_filename,
                    'file_url': media_file.file_url,
                    'thumbnail_url': thumbnail_path,
                    'file_size': media_file.file_size,
                    'mime_type': media_file.mime_type
                })
                
            except Exception as e:
                errors.append(f"Arquivo {file.filename}: {str(e)}")
        
        db.session.commit()
        
        return jsonify({
            'message': f'{len(uploaded_files)} arquivos enviados com sucesso',
            'uploaded_files': uploaded_files,
            'errors': errors
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE VISUALIZAÇÃO
# ===========================================

@media_bp.route('/<category>/<filename>')
def serve_file(category, filename):
    try:
        file_path = os.path.join(current_app.root_path, UPLOAD_FOLDER, category)
        return send_from_directory(file_path, filename)
    except Exception as e:
        return jsonify({'error': 'Arquivo não encontrado'}), 404

@media_bp.route('/thumbnails/<filename>')
def serve_thumbnail(filename):
    try:
        thumbnail_path = os.path.join(current_app.root_path, UPLOAD_FOLDER, 'thumbnails')
        return send_from_directory(thumbnail_path, filename)
    except Exception as e:
        return jsonify({'error': 'Thumbnail não encontrado'}), 404

# ===========================================
# ENDPOINTS DE GESTÃO
# ===========================================

@media_bp.route('/files', methods=['GET'])
def get_files():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        file_type = request.args.get('type')
        product_id = request.args.get('product_id')
        blog_post_id = request.args.get('blog_post_id')
        
        query = MediaFile.query
        
        if file_type:
            query = query.filter(MediaFile.file_type == file_type)
        if product_id:
            query = query.filter(MediaFile.product_id == product_id)
        if blog_post_id:
            query = query.filter(MediaFile.blog_post_id == blog_post_id)
        
        files = query.order_by(MediaFile.created_at.desc())\
                    .paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'files': [{
                'id': file.id,
                'filename': file.filename,
                'original_filename': file.original_filename,
                'file_url': file.file_url,
                'file_size': file.file_size,
                'file_type': file.file_type,
                'mime_type': file.mime_type,
                'product_id': file.product_id,
                'blog_post_id': file.blog_post_id,
                'created_at': file.created_at.isoformat()
            } for file in files.items],
            'pagination': {
                'page': files.page,
                'pages': files.pages,
                'total': files.total
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_bp.route('/files/<file_id>', methods=['DELETE'])
def delete_file(file_id):
    try:
        media_file = MediaFile.query.get(file_id)
        if not media_file:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        # Remover arquivo físico
        file_full_path = os.path.join(current_app.root_path, media_file.file_path)
        if os.path.exists(file_full_path):
            os.remove(file_full_path)
        
        # Remover thumbnail se existir
        if media_file.file_type in ['products', 'blog']:
            thumbnail_filename = f"thumb_{media_file.filename}"
            thumbnail_path = os.path.join(current_app.root_path, UPLOAD_FOLDER, 'thumbnails', thumbnail_filename)
            if os.path.exists(thumbnail_path):
                os.remove(thumbnail_path)
        
        # Remover do banco
        db.session.delete(media_file)
        db.session.commit()
        
        return jsonify({'message': 'Arquivo deletado com sucesso'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@media_bp.route('/files/<file_id>/update', methods=['PUT'])
def update_file_metadata(file_id):
    try:
        media_file = MediaFile.query.get(file_id)
        if not media_file:
            return jsonify({'error': 'Arquivo não encontrado'}), 404
        
        data = request.get_json()
        
        # Atualizar metadados
        if 'product_id' in data:
            media_file.product_id = data['product_id']
        if 'blog_post_id' in data:
            media_file.blog_post_id = data['blog_post_id']
        if 'file_type' in data:
            media_file.file_type = data['file_type']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Metadados atualizados com sucesso',
            'file': {
                'id': media_file.id,
                'filename': media_file.filename,
                'file_url': media_file.file_url,
                'file_type': media_file.file_type,
                'product_id': media_file.product_id,
                'blog_post_id': media_file.blog_post_id
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ===========================================
# ENDPOINTS DE ESTATÍSTICAS
# ===========================================

@media_bp.route('/stats', methods=['GET'])
def get_media_stats():
    try:
        # Estatísticas gerais
        total_files = MediaFile.query.count()
        total_size = db.session.query(db.func.sum(MediaFile.file_size)).scalar() or 0
        
        # Arquivos por tipo
        files_by_type = db.session.query(
            MediaFile.file_type,
            db.func.count(MediaFile.id),
            db.func.sum(MediaFile.file_size)
        ).group_by(MediaFile.file_type).all()
        
        # Arquivos por tipo MIME
        files_by_mime = db.session.query(
            MediaFile.mime_type,
            db.func.count(MediaFile.id)
        ).group_by(MediaFile.mime_type).all()
        
        return jsonify({
            'stats': {
                'total_files': total_files,
                'total_size_bytes': int(total_size),
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'files_by_type': {
                    file_type: {
                        'count': count,
                        'size_mb': round(size / (1024 * 1024), 2) if size else 0
                    } for file_type, count, size in files_by_type
                },
                'files_by_mime': {
                    mime_type: count for mime_type, count in files_by_mime
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 