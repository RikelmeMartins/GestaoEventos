from datetime import datetime
from app.extensions import db

STATUS_INSCRICAO = ("ativa", "cancelada")

class Inscricao(db.Model):
    __tablename__ = "inscricoes"
    __table_args__ = (
        db.UniqueConstraint("usuario_id", "evento_id", name="uq_inscricao_usuario_evento"),
    )

    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.String(20), nullable=False, default="ativa")
    criada_em = db.Column(db.DateTime, nullable=False, default=datetime.now)
    cancelada_em = db.Column(db.DateTime)

    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False, index=True)
    evento_id = db.Column(db.Integer, db.ForeignKey("eventos.id"), nullable=False, index=True)

    usuario = db.relationship("Usuario", back_populates="inscricoes")
    evento = db.relationship("Evento", back_populates="inscricoes")