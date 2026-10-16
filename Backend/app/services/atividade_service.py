from flask import abort  
from marshmallow import ValidationError
from app.extensions import db
from app.models.atividade import Atividade
from app.schemas.atividade_schemas import AtividadeSchema
from app.services import evento_service

atividade_schema = AtividadeSchema()

def listar_atividades(evento_id):
    evento_service.buscar_evento(evento_id)
    consulta = db.select(Atividade).filter_by(evento_id=evento_id).order_by(Atividade.data_inicio)
    return db.session.scalars(consulta).all()

def buscar_atividade(id):
    return db.get_or_404(Atividade, id, description="Atividade não encontrada.")

def buscar_atividade_gerenciavel(id):
    atividade = buscar_atividade(id)
    evento_service.buscar_evento_gerenciavel(atividade.evento_id)
    return atividade

def validar_evento_ativo(evento):
    if evento.status == "cancelado":
        abort(409, description="Não é possível alterar atividades de um evento cancelado.")

def validar_periodo(evento, dados):
    if dados["data_inicio"] < evento.data_inicial or dados["data_fim"] > evento.data_fim:
        raise ValidationError(
            {"data_inicio": ["A atividade deve acontecer dentro do periodo do evento."]}
        )

def criar_atividade(evento_id, dados):
    evento = evento_service.buscar_evento_gerenciavel(evento_id)
    validar_evento_ativo(evento)

    dados = atividade_schema.load(dados)
    validar_periodo(evento, dados)

    atividade = Atividade(**dados, evento_id=evento.id)
    db.session.add(atividade)
    db.session.commit()
    return atividade

def atualizar_atividade(id, dados, parcial=False):
    atividade = buscar_atividade_gerenciavel(id)
    validar_evento_ativo(atividade.evento)

    if parcial and isinstance(dados, dict):
        atuais = {
            campo: valor
            for campo, valor in atividade_schema.dump(atividade).items()
            if campo in atividade_schema.load_fields
        }
        dados = {**atuais, **dados}

    dados = atividade_schema.load(dados)
    validar_periodo(atividade.evento, dados)

    for campo, valor in dados.items():
        setattr(atividade, campo, valor)
    db.session.commit()
    return atividade

def excluir_atividade(id):
    atividade = buscar_atividade_gerenciavel(id)
    validar_evento_ativo(atividade.evento)
    db.session.delete(atividade)
    db.session.commit()