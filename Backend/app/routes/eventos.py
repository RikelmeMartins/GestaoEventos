from flask import Blueprint, jsonify, request
from app.schemas.evento_schemas import EventoSchema
from app.services import evento_service
from app.auth import perfil_requerido

bp = Blueprint("eventos", __name__, url_prefix="/api/eventos")

evento_schema = EventoSchema()
eventos_schema = EventoSchema(many=True)

@bp.get("/")
def listar():
    return jsonify(eventos_schema.dump(evento_service.listar_eventos()))

@bp.get("/<int:id>")
def detalhar(id):
    return jsonify(evento_schema.dump(evento_service.buscar_evento(id)))

@bp.post("/")
@perfil_requerido("organizador")
def criar():
    evento = evento_service.criar_evento(request.get_json())
    return jsonify(evento_schema.dump(evento)), 201

@bp.put("/<int:id>")
@bp.patch("/<int:id>")
@perfil_requerido("organizador")
def atualizar(id):
    parcial = request.method == "PATCH"
    evento = evento_service.atualizar_evento(id, request.get_json(), parcial=parcial)
    return jsonify(evento_schema.dump(evento))

@bp.post("/<int:id>/cancelar")
@perfil_requerido("organizador")
def cancelar(id):
    return jsonify(evento_schema.dump(evento_service.cancelar_evento(id)))