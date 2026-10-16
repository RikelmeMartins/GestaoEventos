from flask import Blueprint, jsonify, request
from app.schemas.atividade_schemas import AtividadeSchema
from app.services import atividade_service
from app.auth import perfil_requerido

bp = Blueprint("atividades", __name__, url_prefix="/api")

atividade_schema = AtividadeSchema()
atividades_schema = AtividadeSchema(many=True)

@bp.get("/eventos/<int:evento_id>/atividades")
def listar(evento_id):
    return jsonify(atividades_schema.dump(atividade_service.listar_atividades(evento_id)))

@bp.post("/eventos/<int:evento_id>/atividades")
@perfil_requerido("organizador")
def criar(evento_id):
    atividade = atividade_service.criar_atividade(evento_id, request.get_json())
    return jsonify(atividade_schema.dump(atividade)), 201

@bp.get("/atividades/<int:id>")
def detalhar(id):
    return jsonify(atividade_schema.dump(atividade_service.buscar_atividade(id)))

@bp.put("/atividades/<int:id>")
@bp.patch("/atividades/<int:id>")
@perfil_requerido("organizador")
def atualizar(id):
    parcial = request.method == "PATCH"
    atividade = atividade_service.atualizar_atividade(id, request.get_json(), parcial=parcial)
    return jsonify(atividade_schema.dump(atividade))

@bp.delete("/atividades/<int:id>")
@perfil_requerido("organizador")
def excluir(id):
    atividade_service.excluir_atividade(id)
    return "", 204