from flask import Flask, jsonify
from .extensions import db, cors, migrate, jwt, limiter
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv
from .models.usuario import Usuario

def create_app(config_class=None):
    load_dotenv()
    if config_class is None:
        from .config import Config as config_class

    app = Flask(__name__)
    app.config.from_object(config_class)
    app.json.ensure_ascii = False
    validar_config(app)

    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_URL"]}})

    from . import models
    from .routes.eventos import bp as eventos_bp
    from .routes.usuarios import bp as usuarios_bp
    from .commands import registrar_comandos
    from .routes.atividades import bp as atividades_bp
    from .routes.inscricoes import bp as inscricoes_bp
    app.register_blueprint(atividades_bp)
    registrar_comandos(app)
    app.register_blueprint(eventos_bp)
    app.register_blueprint(usuarios_bp)
    app.register_blueprint(inscricoes_bp)


    @app.get("/api/health")
    def health():
        return {"status": "ok"}
    
    registrar_erros(app)
    return app

def registrar_erros(app):
    @app.errorhandler(ValidationError)
    def erro_validacao(e):
        return jsonify({"erro": "Dados inválidos", "detalhes": e.messages}), 400

    @app.errorhandler(HTTPException)
    def erro_http(e):
        return jsonify({"erro": e.description}), e.code

    @jwt.unauthorized_loader
    def sem_token(motivo):
        return jsonify({"erro": "Faça login para continuar."}), 401

    @jwt.invalid_token_loader
    def token_invalido(motivo):
        return jsonify({"erro": "Token inválido."}), 401

    @jwt.expired_token_loader
    def token_expirado(header, payload):
        return jsonify({"erro": "Sessão expirada. Faça login novamente."}), 401

    @app.errorhandler(429)
    def muitas_tentativas(e):
        return jsonify({"erro": "Muitas tentativas. Aguarde um pouco e tente de novo."}), 429

    @jwt.token_in_blocklist_loader
    def token_revogado(header, payload):
        usuario = db.session.get(Usuario, int(payload["sub"]))
        return usuario is None or payload.get("versao") != usuario.token_versao

    @jwt.revoked_token_loader
    def sessao_encerrada(header, payload):
        return jsonify({"erro": "Sua sessão foi encerrada. Faça login novamente."}), 401

def validar_config(app):
    obrigatorias = {"SQLALCHEMY_DATABASE_URI": "DATABASE_URL", "JWT_SECRET_KEY": "JWT_SECRET_KEY"}
    for chave, variavel in obrigatorias.items():
        if not app.config.get(chave):
            raise RuntimeError(f"Falta a variável {variavel} no arquivo .env.")

    if len(app.config["JWT_SECRET_KEY"]) < 32:
        raise RuntimeError("A JWT_SECRET_KEY precisa ter pelo menos 32 caracteres.")