from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

PERFIL = ("administrador", "organizador", "participante")

class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), nullable=False, unique=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    perfil = db.Column(db.String(200), nullable=False, default="participante")
    inscricoes = db.relationship("Inscricao", back_populates="usuario")

    eventos_organizados = db.relationship("Evento", back_populates="organizador")

    def definir_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def verificar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)