from marshmallow import fields, Schema

class EventoResumoSchema(Schema):
    id = fields.Int()
    titulo = fields.Str()
    data_inicial = fields.DateTime()
    data_fim = fields.DateTime()
    local = fields.Str()
    status = fields.Str()

class InscricaoSchema(Schema):
    id = fields.Int(dump_only=True)
    status = fields.Str(dump_only=True)
    criada_em = fields.DateTime(dump_only=True)
    cancelada_em = fields.DateTime(dump_only=True)
    usuario_id = fields.Int(dump_only=True)
    evento_id = fields.Int(dump_only=True)
    evento = fields.Nested(EventoResumoSchema, dump_only=True)