from flask import abort  
from datetime import datetime
from marshmallow import ValidationError
from app.extensions import db
from app.models.atividade import Atividade
from app.schemas.atividade_schemas import AtividadeSchema
from app.services import evento_service
from app.models.inscricao import Inscricao
from app.models.presenca import Presenca

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

    if atividade.presencas:
        abort(409, description="Esta atividade já tem presenças registradas e não pode ser excluída.")

    db.session.delete(atividade)
    db.session.commit()

def registrar_presenca(id, inscricao_id, dados):
    atividade = buscar_atividade_gerenciavel(id)

    if atividade.evento.status == "cancelado":
        abort(409, description="Não é possível registrar presença em um evento cancelado.")
    if atividade.data_inicio > datetime.now():
        abort(409, description="A presença só pode ser registrada depois que a atividade começar.")  

    presente = (dados or {}).get("presente")
    if not isinstance(presente, bool):
        raise ValidationError({"presente": ["Informe true ou false."]})

    inscricao = db.session.get(Inscricao, inscricao_id)
    if inscricao is None or inscricao.evento_id != atividade.evento_id or inscricao.status != "ativa":
        abort(404, description="Inscrição não encontrada neste evento.")

    presenca = db.session.scalar(db.select(Presenca).filter_by(inscricao_id=inscricao.id, atividade_id=atividade.id))
    if presente and presenca is None:
        db.session.add(Presenca(inscricao_id=inscricao.id, atividade_id=atividade.id))
    elif not presente and presenca is not None:
        db.session.delete(presenca)

    db.session.commit()
    return inscricao