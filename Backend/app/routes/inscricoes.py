from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.schemas.inscricao_schemas import InscricaoSchema
from app.services import inscricao_service

bp = Blueprint("inscricoes", __name__, url_prefix="/api")

inscricao_schema = InscricaoSchema()
inscricoes_schema = InscricaoSchema(many=True)


@bp.post("/eventos/<int:evento_id>/inscricao")
@jwt_required()
def inscrever(evento_id):
    inscricao = inscricao_service.inscrever(evento_id)
    return jsonify(inscricao_schema.dump(inscricao)), 201


@bp.delete("/eventos/<int:evento_id>/inscricao")
@jwt_required()
def cancelar(evento_id):
    inscricao = inscricao_service.cancelar_inscricao(evento_id)
    return jsonify(inscricao_schema.dump(inscricao))


@bp.get("/inscricoes/minhas")
@jwt_required()
def minhas():
    return jsonify(inscricoes_schema.dump(inscricao_service.listar_minhas()))