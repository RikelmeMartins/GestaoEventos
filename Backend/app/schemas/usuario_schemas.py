from marshmallow import fields, Schema, validate

class UsuarioSchema(Schema):
    id = fields.Int(dump_only=True)
    nome = fields.Str(required=True, validate=validate.Length(min=1, max=200))
    email = fields.Email(required=True, validate=validate.Length(max=200))
    senha = fields.Str(required=True, load_only=True, validate=validate.Length(min=6, max=128))
    perfil = fields.Str(dump_only=True)

class LoginSchema(Schema):
    email = fields.Str(required=True)
    senha = fields.Str(required=True, load_only=True)