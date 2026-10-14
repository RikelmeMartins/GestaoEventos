from app.extensions import db

STATUS_EVENTO = ("ativo", "cancelado")

class Evento(db.Model):
    __tablename__ = "eventos"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text)
    categoria = db.Column(db.String(50), nullable=False, index=True)
    data_inicial = db.Column(db.DateTime, nullable=False, index=True)
    data_fim = db.Column(db.DateTime, nullable=False)
    local = db.Column(db.String(200), nullable=False)
    vagas = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="ativo")

