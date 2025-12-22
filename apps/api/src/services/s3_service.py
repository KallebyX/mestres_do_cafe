"""
AWS S3 Service for Image Storage
Mestres do Cafe - Enterprise API
"""

import os
import uuid
import logging
from typing import Optional, Tuple
from datetime import datetime

import boto3
from botocore.exceptions import ClientError, NoCredentialsError

logger = logging.getLogger(__name__)


class S3Service:
    """Service for handling image uploads to AWS S3"""

    def __init__(self):
        """Initialize S3 client with environment variables"""
        self.bucket_name = os.getenv("AWS_S3_BUCKET", "mestres-do-cafe-images")
        self.region = os.getenv("AWS_REGION", "sa-east-1")
        self.access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")

        # Base URL for public access
        self.base_url = os.getenv(
            "AWS_S3_BASE_URL",
            f"https://{self.bucket_name}.s3.{self.region}.amazonaws.com"
        )

        # Allowed file types and max size
        self.allowed_extensions = {"png", "jpg", "jpeg", "gif", "webp"}
        self.max_file_size = 5 * 1024 * 1024  # 5MB

        # Initialize S3 client
        self._client = None

    @property
    def client(self):
        """Lazy initialization of S3 client"""
        if self._client is None:
            try:
                if self.access_key and self.secret_key:
                    self._client = boto3.client(
                        "s3",
                        region_name=self.region,
                        aws_access_key_id=self.access_key,
                        aws_secret_access_key=self.secret_key
                    )
                else:
                    # Use IAM role or instance profile
                    self._client = boto3.client("s3", region_name=self.region)
                logger.info("S3 client initialized successfully")
            except NoCredentialsError:
                logger.error("AWS credentials not found")
                raise
            except Exception as e:
                logger.error(f"Failed to initialize S3 client: {e}")
                raise
        return self._client

    def _validate_file(self, filename: str, content_length: int) -> Tuple[bool, str]:
        """
        Validate file before upload

        Args:
            filename: Original filename
            content_length: Size of file in bytes

        Returns:
            Tuple of (is_valid, error_message)
        """
        if not filename:
            return False, "Filename is required"

        # Check extension
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in self.allowed_extensions:
            return False, f"File type not allowed. Allowed: {', '.join(self.allowed_extensions)}"

        # Check size
        if content_length > self.max_file_size:
            return False, f"File too large. Max size: {self.max_file_size / 1024 / 1024}MB"

        return True, ""

    def _generate_key(self, filename: str, folder: str = "products") -> str:
        """
        Generate unique S3 key for file

        Args:
            filename: Original filename
            folder: Folder to store file in

        Returns:
            Unique S3 key
        """
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpg"
        timestamp = datetime.now().strftime("%Y/%m/%d")
        unique_id = str(uuid.uuid4())[:8]
        return f"{folder}/{timestamp}/{unique_id}.{ext}"

    def upload_file(
        self,
        file_data: bytes,
        filename: str,
        folder: str = "products",
        content_type: Optional[str] = None
    ) -> dict:
        """
        Upload file to S3

        Args:
            file_data: Binary file data
            filename: Original filename
            folder: Folder to store file in (products, users, blog, etc.)
            content_type: MIME type of file

        Returns:
            Dict with url, key, and success status
        """
        try:
            # Validate file
            is_valid, error = self._validate_file(filename, len(file_data))
            if not is_valid:
                return {"success": False, "error": error}

            # Generate unique key
            key = self._generate_key(filename, folder)

            # Determine content type
            if not content_type:
                ext = filename.rsplit(".", 1)[-1].lower()
                content_types = {
                    "jpg": "image/jpeg",
                    "jpeg": "image/jpeg",
                    "png": "image/png",
                    "gif": "image/gif",
                    "webp": "image/webp"
                }
                content_type = content_types.get(ext, "application/octet-stream")

            # Upload to S3
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=file_data,
                ContentType=content_type,
                ACL="public-read",
                CacheControl="max-age=31536000"  # 1 year cache
            )

            url = f"{self.base_url}/{key}"
            logger.info(f"File uploaded successfully: {key}")

            return {
                "success": True,
                "url": url,
                "key": key,
                "filename": filename,
                "content_type": content_type,
                "size": len(file_data)
            }

        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            error_msg = e.response.get("Error", {}).get("Message", str(e))
            logger.error(f"S3 upload error [{error_code}]: {error_msg}")
            return {"success": False, "error": f"Upload failed: {error_msg}"}
        except Exception as e:
            logger.error(f"Unexpected error during upload: {e}")
            return {"success": False, "error": str(e)}

    def delete_file(self, key: str) -> dict:
        """
        Delete file from S3

        Args:
            key: S3 key of file to delete

        Returns:
            Dict with success status
        """
        try:
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            logger.info(f"File deleted successfully: {key}")
            return {"success": True, "key": key}
        except ClientError as e:
            error_msg = e.response.get("Error", {}).get("Message", str(e))
            logger.error(f"S3 delete error: {error_msg}")
            return {"success": False, "error": error_msg}
        except Exception as e:
            logger.error(f"Unexpected error during delete: {e}")
            return {"success": False, "error": str(e)}

    def get_presigned_url(self, key: str, expires_in: int = 3600) -> dict:
        """
        Generate presigned URL for private file access

        Args:
            key: S3 key of file
            expires_in: URL expiration time in seconds

        Returns:
            Dict with presigned URL
        """
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.bucket_name,
                    "Key": key
                },
                ExpiresIn=expires_in
            )
            return {"success": True, "url": url, "expires_in": expires_in}
        except Exception as e:
            logger.error(f"Error generating presigned URL: {e}")
            return {"success": False, "error": str(e)}

    def list_files(self, prefix: str = "", max_keys: int = 100) -> dict:
        """
        List files in S3 bucket

        Args:
            prefix: Filter by key prefix
            max_keys: Maximum number of files to return

        Returns:
            Dict with list of files
        """
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix,
                MaxKeys=max_keys
            )

            files = []
            for obj in response.get("Contents", []):
                files.append({
                    "key": obj["Key"],
                    "url": f"{self.base_url}/{obj['Key']}",
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"].isoformat()
                })

            return {
                "success": True,
                "files": files,
                "count": len(files),
                "is_truncated": response.get("IsTruncated", False)
            }
        except Exception as e:
            logger.error(f"Error listing files: {e}")
            return {"success": False, "error": str(e), "files": []}

    def check_health(self) -> dict:
        """
        Check S3 service health

        Returns:
            Dict with health status
        """
        try:
            # Try to list bucket (will fail if no access)
            self.client.head_bucket(Bucket=self.bucket_name)
            return {
                "status": "healthy",
                "bucket": self.bucket_name,
                "region": self.region
            }
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code", "Unknown")
            return {
                "status": "unhealthy",
                "error": error_code,
                "bucket": self.bucket_name
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "bucket": self.bucket_name
            }


# Singleton instance
s3_service = S3Service()
