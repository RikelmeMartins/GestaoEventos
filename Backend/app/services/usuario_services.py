from flask import abort, current_app
from flask_jwt_extended import create_access_token
import hashlib
import secrets
from datetime import datetime, timedelta
from app.extensions import db
from app.models.usuario import Usuario
from app.auth import usuario_atual
from app.models.redefinicao_senha import RedefinicaoSenha
from app.services.email_service import enviar_email
from app.schemas.usuario_schemas import UsuarioSchema, LoginSchema, AlterarPerfilSchema, EsqueciSenhaSchema, RedefinirSenhaSchema

usuario_schema = UsuarioSchema()
login_schema = LoginSchema()
alterar_perfil_schema = AlterarPerfilSchema()
esqueci_senha_schema = EsqueciSenhaSchema()
redefinir_senha_schema = RedefinirSenhaSchema()

VALIDADE_REDEFINICAO = timedelta(minutes=30)

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

    token = create_access_token(identity=str(usuario.id), additional_claims={"perfil": usuario.perfil, "versao": usuario.token_versao})
    return usuario, token

def listar_usuarios():
    return db.session.scalars(db.select(Usuario).order_by(Usuario.nome)).all()

def alterar_perfil(id, dados):
    perfil = alterar_perfil_schema.load(dados)["perfil"]    
    usuario = buscar_usuario(id)

    if usuario.id == usuario_atual() and perfil != "administrador":
        abort(400, description="Você não pode remover seu próprio perfil de administrador.")

    usuario.perfil = perfil
    usuario.encerrar_sessoes()
    db.session.commit()
    return usuario

def hash_token(token):
    return hashlib.sha256(token.encode()).hexdigest()

def solicitar_redefinicao(dados):
    email = esqueci_senha_schema.load(dados)["email"].strip().lower()
    usuario = buscar_usuario_email(email)
    if usuario is None:
        return

    agora = datetime.now()
    pendentes = db.select(RedefinicaoSenha).filter_by(usuario_id=usuario.id, usado_em=None)
    for pedido in db.session.scalars(pendentes):
        pedido.usado_em = agora

    token = secrets.token_urlsafe(32)
    db.session.add(RedefinicaoSenha(
        usuario_id = usuario.id,
        token_hash = hash_token(token),
        expira_em = agora + VALIDADE_REDEFINICAO,
    ))
    db.session.commit()

    link = f"{current_app.config['FRONTEND_URL']}/redefinir-senha?token={token}"
    enviar_email(
        usuario.email,
        "Redefinição de senha - Pauta",
        f"Olá, {usuario.nome}!\n\n"
        "Recebemos um pedido para redefinir a senha da sua conta no Pauta.\n"
        "Para criar uma nova senha, acesse o link abaixo (válido por 30 minutos):\n\n"
        f"{link}\n\n"
        "Se não foi você, ignore este e-mail: sua senha continua a mesma.",
    )

def redefinir_senha(dados):
    dados = redefinir_senha_schema.load(dados)
    pedido = db.session.scalar(db.select(RedefinicaoSenha).filter_by(token_hash=hash_token(dados["token"])))

    if pedido is None or pedido.usado_em is not None or pedido.expira_em < datetime.now():
        abort(400, description="Este link é inválido ou expirou. Peça um novo.")

    usuario = pedido.usuario
    usuario.definir_senha(dados["senha"])
    usuario.encerrar_sessoes()
    pedido.usado_em = datetime.now()
    db.session.commit()