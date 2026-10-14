from flask import Flask, jsonify
from .extensions import db, cors, migrate, jwt
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv

def create_app(config_class=None):
    load_dotenv()
    if config_class is None:
        from .config import Config as config_class

    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    from . import models
    from .routes.eventos import bp as eventos_bp
    from .routes.usuarios import bp as usuarios_bp
    from .commands import registrar_comandos
    registrar_comandos(app)
    app.register_blueprint(eventos_bp)
    app.register_blueprint(usuarios_bp)


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