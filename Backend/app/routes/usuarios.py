from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.schemas.usuario_schemas import UsuarioSchema
from app.services import usuario_services
from app.auth import perfil_requerido

bp = Blueprint("usuarios", __name__, url_prefix="/api/usuarios")
usuario_schema = UsuarioSchema()
usuarios_schema = UsuarioSchema(many=True)

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

@bp.get("/")
@perfil_requerido("administrador")
def listar():
    return jsonify(usuarios_schema.dump(usuario_services.listar_usuarios()))

@bp.patch("/<int:id>/perfil")
@perfil_requerido("administrador")
def alterar_perfil(id):
    usuario = usuario_services.alterar_perfil(id, request.get_json())
    return jsonify(usuario_schema.dump(usuario))