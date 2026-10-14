from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.schemas.usuario_schemas import UsuarioSchema
from app.services import usuario_services

bp = Blueprint("usuarios", __name__, url_prefix="/api/usuarios")
usuario_schema = UsuarioSchema()

@bp.post("/")
def cadastrar_usuario():
    usuario = usuario_services.cadastrar_usuario(request.get_json())
    return jsonify(usuario_schema.dump(usuario)), 201

@bp.post("/login")
def login():
    usuario, token = usuario_services.autenticar(request.get_json())
    return jsonify({"token": token, "usuario": usuario_schema.dump(usuario)})

@bp.get("/me")
@jwt_required()
def eu():
    usuario = usuario_services.buscar_usuario(int(get_jwt_identity()))
    return jsonify(usuario_schema.dump(usuario))