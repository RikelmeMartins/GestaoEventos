from datetime import datetime
from flask import abort
from sqlalchemy import func
from app.extensions import db
from app.models.evento import Evento
from app.models.inscricao import Inscricao
from app.auth import usuario_atual


def contar_ativas(evento_id):
    return db.session.scalar(
        db.select(func.count(Inscricao.id)).where(
            Inscricao.evento_id == evento_id,
            Inscricao.status == "ativa",
        )
    )


def vagas_disponiveis(evento):
    return max(evento.vagas - contar_ativas(evento.id), 0)


def buscar_inscricao(usuario_id, evento_id):
    return db.session.scalar(
        db.select(Inscricao).where(
            Inscricao.usuario_id == usuario_id,
            Inscricao.evento_id == evento_id,
        )
    )


def evento_encerrado(evento):
    return evento.data_fim < datetime.now()


def inscrever(evento_id):
    evento = db.session.scalar(
        db.select(Evento).where(Evento.id == evento_id).with_for_update()
    )
    if evento is None:
        abort(404, description="Evento não encontrado.")
    if evento.status == "cancelado":
        abort(409, description="Não é possível se inscrever em um evento cancelado.")
    if evento_encerrado(evento):
        abort(409, description="Este evento já foi encerrado.")

    inscricao = buscar_inscricao(usuario_atual(), evento.id)
    if inscricao and inscricao.status == "ativa":
        abort(409, description="Você já está inscrito neste evento.")

    if contar_ativas(evento.id) >= evento.vagas:
        abort(409, description="Não há mais vagas disponíveis.")

    if inscricao: 
        inscricao.status = "ativa"
        inscricao.criada_em = datetime.now()
        inscricao.cancelada_em = None
    else:
        inscricao = Inscricao(usuario_id=usuario_atual(), evento_id=evento.id)
        db.session.add(inscricao)

    db.session.commit()
    return inscricao


def cancelar_inscricao(evento_id):
    inscricao = buscar_inscricao(usuario_atual(), evento_id)
    if inscricao is None or inscricao.status != "ativa":
        abort(404, description="Você não tem inscrição ativa neste evento.")
    if evento_encerrado(inscricao.evento):
        abort(409, description="Não é possível cancelar a inscrição de um evento encerrado.")

    inscricao.status = "cancelada"
    inscricao.cancelada_em = datetime.now()
    db.session.commit()
    return inscricao


def listar_minhas():
    consulta = (
        db.select(Inscricao)
        .where(Inscricao.usuario_id == usuario_atual())
        .order_by(Inscricao.criada_em.desc())
    )
    return db.session.scalars(consulta).all()