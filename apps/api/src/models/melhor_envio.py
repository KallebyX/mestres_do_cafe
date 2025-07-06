"""
Modelos para integração com API do Melhor Envio
"""
from datetime import datetime
from src.models.database import db

class MelhorEnvioConfig(db.Model):
    """Configurações OAuth2 do Melhor Envio"""
    __tablename__ = 'melhor_envio_config'
    
    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.String(255), nullable=False)
    client_secret = db.Column(db.String(255), nullable=False)
    access_token = db.Column(db.Text)
    refresh_token = db.Column(db.Text)
    token_expires_at = db.Column(db.DateTime)
    environment = db.Column(db.String(20), default='sandbox')  # sandbox ou production
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class FreteCalculado(db.Model):
    """Histórico de fretes calculados"""
    __tablename__ = 'fretes_calculados'
    
    id = db.Column(db.Integer, primary_key=True)
    cep_origem = db.Column(db.String(8), nullable=False)
    cep_destino = db.Column(db.String(8), nullable=False)
    peso = db.Column(db.Float, nullable=False)
    altura = db.Column(db.Float, nullable=False)
    largura = db.Column(db.Float, nullable=False)
    comprimento = db.Column(db.Float, nullable=False)
    valor_declarado = db.Column(db.Float, nullable=False)
    resultado_json = db.Column(db.Text)  # JSON com todas as opções retornadas
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class EnvioMelhorEnvio(db.Model):
    """Envios criados via Melhor Envio"""
    __tablename__ = 'envios_melhor_envio'
    
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    melhor_envio_id = db.Column(db.String(100))  # ID do envio no Melhor Envio
    protocol = db.Column(db.String(100))  # Protocolo do Melhor Envio
    service_id = db.Column(db.Integer)  # ID do serviço escolhido
    service_name = db.Column(db.String(100))  # Nome do serviço (PAC, SEDEX, etc)
    transportadora = db.Column(db.String(100))  # Nome da transportadora
    preco = db.Column(db.Float)
    prazo_entrega = db.Column(db.Integer)  # Prazo em dias úteis
    codigo_rastreamento = db.Column(db.String(100))
    status = db.Column(db.String(50), default='pending')  # pending, paid, posted, delivered, etc
    etiqueta_url = db.Column(db.String(500))  # URL da etiqueta PDF
    dados_envio_json = db.Column(db.Text)  # JSON completo do envio
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RastreamentoEnvio(db.Model):
    """Histórico de rastreamento dos envios"""
    __tablename__ = 'rastreamento_envios'
    
    id = db.Column(db.Integer, primary_key=True)
    envio_id = db.Column(db.Integer, db.ForeignKey('envios_melhor_envio.id'), nullable=False)
    status = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text)
    localizacao = db.Column(db.String(200))
    data_evento = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento
    envio = db.relationship('EnvioMelhorEnvio', backref='rastreamentos')

