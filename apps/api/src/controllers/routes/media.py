"""
Media Routes - Image Upload to S3
Mestres do Cafe - Enterprise API
"""

import logging
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from services.s3_service import s3_service

logger = logging.getLogger(__name__)

media_bp = Blueprint("media", __name__)


@media_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_image():
    """
    Upload image to S3

    Expects multipart/form-data with:
    - file: Image file
    - folder: Optional folder name (default: products)

    Returns:
        JSON with url and file info
    """
    try:
        # Check if file is present
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        if not file or file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Get folder from form data
        folder = request.form.get("folder", "products")
        allowed_folders = ["products", "users", "blog", "categories", "general"]
        if folder not in allowed_folders:
            folder = "general"

        # Read file data
        file_data = file.read()
        filename = file.filename
        content_type = file.content_type

        # Upload to S3
        result = s3_service.upload_file(
            file_data=file_data,
            filename=filename,
            folder=folder,
            content_type=content_type
        )

        if result["success"]:
            logger.info(f"Image uploaded: {result['key']} by user {get_jwt_identity()}")
            return jsonify({
                "success": True,
                "url": result["url"],
                "key": result["key"],
                "filename": result["filename"],
                "size": result["size"]
            }), 201
        else:
            return jsonify({"error": result["error"]}), 400

    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify({"error": "Upload failed", "details": str(e)}), 500


@media_bp.route("/upload/multiple", methods=["POST"])
@jwt_required()
def upload_multiple_images():
    """
    Upload multiple images to S3

    Expects multipart/form-data with:
    - files: Multiple image files
    - folder: Optional folder name (default: products)

    Returns:
        JSON with list of uploaded files
    """
    try:
        files = request.files.getlist("files")

        if not files or len(files) == 0:
            return jsonify({"error": "No files provided"}), 400

        folder = request.form.get("folder", "products")
        allowed_folders = ["products", "users", "blog", "categories", "general"]
        if folder not in allowed_folders:
            folder = "general"

        # Limit number of files
        max_files = 10
        if len(files) > max_files:
            return jsonify({"error": f"Maximum {max_files} files allowed"}), 400

        results = []
        errors = []

        for file in files:
            if not file or file.filename == "":
                continue

            file_data = file.read()
            filename = file.filename
            content_type = file.content_type

            result = s3_service.upload_file(
                file_data=file_data,
                filename=filename,
                folder=folder,
                content_type=content_type
            )

            if result["success"]:
                results.append({
                    "url": result["url"],
                    "key": result["key"],
                    "filename": result["filename"]
                })
            else:
                errors.append({
                    "filename": filename,
                    "error": result["error"]
                })

        return jsonify({
            "success": True,
            "uploaded": results,
            "errors": errors,
            "total_uploaded": len(results),
            "total_errors": len(errors)
        }), 201 if results else 400

    except Exception as e:
        logger.error(f"Multiple upload error: {e}")
        return jsonify({"error": "Upload failed", "details": str(e)}), 500


@media_bp.route("/delete", methods=["DELETE"])
@jwt_required()
def delete_image():
    """
    Delete image from S3

    Expects JSON with:
    - key: S3 key of file to delete

    Returns:
        JSON with success status
    """
    try:
        data = request.get_json()

        if not data or "key" not in data:
            return jsonify({"error": "Key is required"}), 400

        key = data["key"]

        # Security: prevent directory traversal
        if ".." in key or key.startswith("/"):
            return jsonify({"error": "Invalid key"}), 400

        result = s3_service.delete_file(key)

        if result["success"]:
            logger.info(f"Image deleted: {key} by user {get_jwt_identity()}")
            return jsonify({"success": True, "message": "File deleted"}), 200
        else:
            return jsonify({"error": result["error"]}), 400

    except Exception as e:
        logger.error(f"Delete error: {e}")
        return jsonify({"error": "Delete failed", "details": str(e)}), 500


@media_bp.route("/list", methods=["GET"])
@jwt_required()
def list_images():
    """
    List images from S3

    Query params:
    - prefix: Filter by key prefix
    - limit: Max number of files (default: 50)

    Returns:
        JSON with list of files
    """
    try:
        prefix = request.args.get("prefix", "")
        limit = min(int(request.args.get("limit", 50)), 100)

        result = s3_service.list_files(prefix=prefix, max_keys=limit)

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"List error: {e}")
        return jsonify({"error": "List failed", "details": str(e)}), 500


@media_bp.route("/health", methods=["GET"])
def media_health():
    """
    Check S3 service health

    Returns:
        JSON with health status
    """
    try:
        result = s3_service.check_health()
        status_code = 200 if result["status"] == "healthy" else 503
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 503
