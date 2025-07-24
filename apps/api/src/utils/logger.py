"""
Sistema de Logging - Mestres do Café Enterprise
"""

import logging
import os
import sys


def setup_logger(name: str = "mestres_cafe", level: int = logging.INFO):
    """
    Configura e retorna um logger

    Args:
        name: Nome do logger
        level: Nível de logging

    Returns:
        Logger configurado
    """

    # Criar logger
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Evitar duplicação de handlers
    if logger.handlers:
        return logger

    # Criar formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # Handler para console
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # Handler para arquivo (se diretório de logs existir)
    logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    if os.path.exists(logs_dir):
        file_handler = logging.FileHandler(
            os.path.join(logs_dir, f'{name}.log'),
            encoding='utf-8'
        )
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


# Logger padrão da aplicação
logger = setup_logger()
