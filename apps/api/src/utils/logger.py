import logging
import os
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from flask import current_app, request, g

class RequestFormatter(logging.Formatter):
    """Custom formatter to include request context in logs"""
    
    def format(self, record):
        # Add request context if available
        if request:
            record.url = request.url
            record.method = request.method
            record.remote_addr = request.remote_addr
            record.user_agent = request.user_agent.string if request.user_agent else 'Unknown'
            record.user_id = getattr(g, 'user_id', 'Anonymous')
        else:
            record.url = 'N/A'
            record.method = 'N/A'
            record.remote_addr = 'N/A'
            record.user_agent = 'N/A'
            record.user_id = 'N/A'
        
        return super().format(record)

def setup_logging(app):
    """Configure logging for the application"""
    
    # Create logs directory if it doesn't exist
    log_dir = os.path.join(os.path.dirname(app.root_path), 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Configure different log levels and handlers
    log_level = logging.DEBUG if app.debug else logging.INFO
    
    # Create formatters
    detailed_formatter = RequestFormatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s\n'
        'Request: %(method)s %(url)s - IP: %(remote_addr)s - User: %(user_id)s\n'
        'User-Agent: %(user_agent)s\n'
        '---'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # File handler for all logs
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'mestres_cafe.log'),
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(detailed_formatter)
    file_handler.setLevel(log_level)
    
    # Error file handler
    error_handler = RotatingFileHandler(
        os.path.join(log_dir, 'errors.log'),
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    error_handler.setFormatter(detailed_formatter)
    error_handler.setLevel(logging.ERROR)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(simple_formatter)
    console_handler.setLevel(log_level)
    
    # Performance log handler
    performance_handler = TimedRotatingFileHandler(
        os.path.join(log_dir, 'performance.log'),
        when='midnight',
        interval=1,
        backupCount=30
    )
    performance_handler.setFormatter(simple_formatter)
    performance_handler.setLevel(logging.INFO)
    
    # Access log handler
    access_handler = TimedRotatingFileHandler(
        os.path.join(log_dir, 'access.log'),
        when='midnight',
        interval=1,
        backupCount=30
    )
    access_handler.setFormatter(RequestFormatter(
        '%(asctime)s - %(remote_addr)s - %(method)s %(url)s - %(user_id)s - %(user_agent)s'
    ))
    access_handler.setLevel(logging.INFO)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Add handlers
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)
    root_logger.addHandler(console_handler)
    
    # Configure Flask app logger
    app.logger.setLevel(log_level)
    app.logger.addHandler(file_handler)
    app.logger.addHandler(error_handler)
    app.logger.addHandler(console_handler)
    
    # Configure performance logger
    performance_logger = logging.getLogger('performance')
    performance_logger.addHandler(performance_handler)
    performance_logger.setLevel(logging.INFO)
    
    # Configure access logger
    access_logger = logging.getLogger('access')
    access_logger.addHandler(access_handler)
    access_logger.setLevel(logging.INFO)
    
    # Silence noisy loggers
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    logging.getLogger('urllib3').setLevel(logging.WARNING)
    
    app.logger.info('Logging system initialized')

def get_logger(name=None):
    """Get a logger instance"""
    return logging.getLogger(name)

def log_performance(func_name, execution_time, **kwargs):
    """Log performance metrics"""
    logger = logging.getLogger('performance')
    logger.info(f'{func_name} executed in {execution_time:.4f}s - {kwargs}')

def log_access(method, url, status_code, user_id=None):
    """Log access information"""
    logger = logging.getLogger('access')
    logger.info(f'{method} {url} - Status: {status_code} - User: {user_id or "Anonymous"}')

def log_security_event(event_type, details, severity='WARNING'):
    """Log security events"""
    logger = logging.getLogger('security')
    log_method = getattr(logger, severity.lower(), logger.warning)
    log_method(f'SECURITY EVENT: {event_type} - {details}')

def log_business_event(event_type, details, user_id=None):
    """Log business events"""
    logger = logging.getLogger('business')
    logger.info(f'BUSINESS EVENT: {event_type} - User: {user_id or "System"} - {details}')

# Decorador para logging automático
def log_function_call(logger_name=None):
    """Decorator to automatically log function calls"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(logger_name or func.__module__)
            
            start_time = datetime.now()
            try:
                result = func(*args, **kwargs)
                end_time = datetime.now()
                execution_time = (end_time - start_time).total_seconds()
                
                logger.info(f'{func.__name__} executed successfully in {execution_time:.4f}s')
                return result
            except Exception as e:
                end_time = datetime.now()
                execution_time = (end_time - start_time).total_seconds()
                
                logger.error(f'{func.__name__} failed after {execution_time:.4f}s: {str(e)}')
                raise
        
        return wrapper
    return decorator