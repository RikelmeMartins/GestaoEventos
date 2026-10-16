from marshmallow import fields, Schema, ValidationError, validate, validates_schema
from app.models.atividade import TIPOS_ATIVIDADES

class AtividadeSchema(Schema):
    id = fields.Int(dump_only=True)
    evento_id = fields.Int(dump_only=True)
    titulo = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    tipo = fields.Str(required=True, validate=validate.OneOf(TIPOS_ATIVIDADES))
    descricao = fields.Str(allow_none=True)
    palestrante = fields.Str(allow_none=True, validate=validate.Length(max=200))
    data_inicio = fields.DateTime(required=True)
    data_fim = fields.DateTime(required=True)
    local = fields.Str(allow_none=True, validate=validate.Length(max=200))

    @validates_schema
    def validar_datas(self, dados, **kwargs):
        inicio, fim = dados.get("data_inicio"), dados.get("data_fim")
        if inicio and fim and fim < inicio:
            raise ValidationError("A data de término deve ser igual ou posterior à de início.", "data_fim")