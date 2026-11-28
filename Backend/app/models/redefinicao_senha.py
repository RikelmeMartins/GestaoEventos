from datetime import datetime
from app.extensions import db

class RedefinicaoSenha(db.Model):
    __tablename__ = "redifinicoes_senha"

    id = db.Column(db.Integer, primary_key=True)
    token_hash = db.Column(db.String(64), nullable=False, unique=True)
    criado_em = db.Column(db.DateTime, nullable=False, default=datetime.now)
    expira_em = db.Column(db.DateTime, nullable=False)
    usado_em = db.Column(db.DateTime)

    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False, index=True)
    usuario = db.relationship("Usuario")