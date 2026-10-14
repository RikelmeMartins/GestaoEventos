from flask import abort
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.usuario import Usuario
from app.schemas.usuario_schemas import UsuarioSchema, LoginSchema

usuario_schema = UsuarioSchema()
login_schema = LoginSchema()

def buscar_usuario(id):
    return db.get_or_404(Usuario, id, description="Usuário não encontrado.")

def buscar_usuario_email(email):
    return db.session.scalar(db.select(Usuario).filter_by(email=email))

def cadastrar_usuario(dados):
    dados = usuario_schema.load(dados)
    email = dados["email"].strip().lower()
    if buscar_usuario_email(email):
        abort(409, description="E-mail já cadastrado.")  

    usuario = Usuario(nome=dados["nome"], email=email)
    usuario.definir_senha(dados["senha"])
    db.session.add(usuario)
    db.session.commit()
    return usuario

def autenticar(dados):
    dados = login_schema.load(dados)
    usuario = buscar_usuario_email(dados["email"].strip().lower())

    if not usuario or not usuario.verificar_senha(dados["senha"]):
        abort(401, description="E-mail ou senha invalidos.")

    token = create_access_token(identity=str(usuario.id), additional_claims={"perfil": usuario.perfil})
    return usuario, token