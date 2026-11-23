from datetime import datetime
from app.extensions import db

class Presenca(db.Model):
    __tablename__ = "presencas"
    __table_args__ = (
        db.UniqueConstraint("inscricao_id", "atividade_id", name="uq_presenca_inscricao_atividade"),
    )

    id = db.Column(db.Integer, primary_key=True)
    registrado_em = db.Column(db.DateTime, nullable=False, default=datetime.now)

    inscricao_id = db.Column(db.Integer, db.ForeignKey("inscricoes.id"), nullable=False, index=True)
    atividade_id = db.Column(db.Integer, db.ForeignKey("atividades.id"), nullable=False, index=True)

    inscricao = db.relationship("Incricao", back_populates="presencas")
    atividade = db.relationship("Atividade", back_populates="presencas")