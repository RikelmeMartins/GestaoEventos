from flask import abort
from app.extensions import db
from app.models import Evento
from app.schemas.evento_schemas import EventoSchema

evento_schema = EventoSchema()

def listar_eventos():
    return db.session.scalars(db.select(Evento).order_by(Evento.data_iniciala)).all()

def buscar_evento(id):
    return db.get_or_404(Evento, id, description="Evento não encontrado.")

def criar_evento(dados):
    evento = Evento(**evento_schema.load(dados))
    db.session.add(evento)
    db.session.commit
    return evento

def atualizar_evento(id, dados, parcial=False):
    evento = buscar_evento(id)
    if evento.status == 'cancelado':
        abort(409, description="Não é possivel editar um evento cancelado.")

    if parcial and isinstance(dados, dict):
        atuais = {
            campo: valor
            for campo, valor in evento_schema.dump(evento).items()
            if campo in evento_schema.load_fields
        }
        dados = {**atuais, **dados}

    for campo, valor in evento_schema.load(dados).items():
        setattr(evento, campo, valor)

    db.session.commit()
    return evento

def cancelar_evento(id):
    evento = buscar_evento(id)

    if evento.status == "cancelado":
        abort(409, description="O evento já está cancelado.")

    evento.status = "cancelado"
    db.session.commit()
    return evento