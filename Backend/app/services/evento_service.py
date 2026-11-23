from flask import abort
from datetime import datetime
from app.extensions import db
from app.models.evento import Evento
from app.schemas.evento_schemas import EventoSchema
from app.auth import admin, usuario_atual
from marshmallow import ValidationError
from app.services.inscricao_service import contar_ativas
from app.models.inscricao import Inscricao
from app.models.usuario import Usuario

evento_schema = EventoSchema()

def listar_eventos():
    return db.session.scalars(db.select(Evento).order_by(Evento.data_inicial)).all()

def buscar_evento(id):
    return db.get_or_404(Evento, id, description="Evento não encontrado.")

def criar_evento(dados):
    evento = Evento(**evento_schema.load(dados), organizador_id=usuario_atual())
    db.session.add(evento)
    db.session.commit()
    return evento

def atualizar_evento(id, dados, parcial=False):
    evento = buscar_evento_gerenciavel(id)
    if evento.status == 'cancelado':
        abort(409, description="Não é possivel editar um evento cancelado.")

    if parcial and isinstance(dados, dict):
        atuais = {
            campo: valor
            for campo, valor in evento_schema.dump(evento).items()
            if campo in evento_schema.load_fields
        }
        dados = {**atuais, **dados}

    novos = evento_schema.load(dados)
    validar_mudancas(evento, novos)

    for campo, valor in novos.items():
        setattr(evento, campo, valor)

    db.session.commit()
    return evento

def cancelar_evento(id):
    evento = buscar_evento_gerenciavel(id)

    if evento.status == "cancelado":
        abort(409, description="O evento já está cancelado.")

    evento.status = "cancelado"
    db.session.commit()
    return evento

def buscar_evento_gerenciavel(id):
    evento = buscar_evento(id)

    if not admin() and evento.organizador_id != usuario_atual():
        abort(403, description="Apenas o responsável pelo evento pode gerenciá-lo.")

    return evento

def validar_mudancas(evento, novos):
    erros = {}

    if any(a.data_inicio < novos["data_inicial"] for a in evento.atividades):
        erros["data_inicial"] = ["Há atividades antes deste início. Ajuste a programação primeiro."]
    if any(a.data_fim > novos["data_fim"] for a in evento.atividades):
        erros["data_fim"] = ["Há atividades depois deste término. Ajuste a programação primeiro."]

    inscritos = contar_ativas(evento.id)
    if novos["vagas"] < inscritos:
        erros["vagas"] = [f"Já existem {inscritos} inscritos; as vagas não podem ser menos que isso."]

    if erros:
        raise ValidationError(erros)

def listar_inscritos(id):
    evento = buscar_evento_gerenciavel(id)
    consulta = (
        db.select(Inscricao)
        .join(Inscricao.usuario)
        .where(Inscricao.evento_id == evento.id, Inscricao.status == "ativa")
        .order_by(Usuario.nome)
    )

    return db.session.scalars(consulta).all()

def registrar_presenca(id, inscricao_id, dados):
    evento = buscar_evento_gerenciavel(id)
    if evento.status == "cancelado":
        abort(409, description="Não é possível registrar presença em um evento cancelado.")
    if evento.data_inicial > datetime.now():
        abort(409, description="A presença só pode ser registrada depois que o evento começar.")

    presente = (dados or {}).get("presente")
    if not isinstance(presente, bool):
        raise ValidationError({"presente": ["Informe true ou false."]})

    inscricao = db.session.get(Inscricao, inscricao_id)
    if inscricao is None or inscricao.evento_id != evento.id or inscricao.status != "ativa":
        abort(404, description="Inscrição não encontrada neste evento.")

    inscricao.presente = presente
    inscricao.presente_em = datetime.now() if presente else None
    db.session.commit()
    return inscricao