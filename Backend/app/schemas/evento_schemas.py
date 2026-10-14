from marshmallow import fields, Schema, ValidationError, validate, validates_schema

class EventoSchema(Schema):
    id = fields.Int(dump_only=True)
    titulo = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    descricao = fields.Str(allow_none=True)
    categoria = fields.Str(required=True, validate=validate.Length(max=50))
    data_inicial = fields.DateTime(required=True)
    data_fim = fields.DateTime(required=True)
    local = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    vagas = fields.Int(required=True, validate=validate.Range(min=1))
    status = fields.Str(dump_only=True)

    @validates_schema
    def validar_datas(self, dados, **kwargs):
        inicio, fim = dados.get("data_inicial"), dados.get("data_fim")
        if inicio and fim and fim < inicio:
            raise ValidationError(
                "A data de término deve ser igual ou posterior à de início.", "data_fim"
                )