from functools import wraps
from flask import abort
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

def usuario_atual():
    return int(get_jwt_identity())

def perfil_atual():
    return get_jwt().get("perfil")

def admin():
    return perfil_atual() == "administrador"

def perfil_requerido(*perfis):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            if perfis and not admin() and perfil_atual() not in perfis:
                abort(403, description="Você não tem permissão.")
            return fn(*args, **kwargs)
        return wrapper
    return decorator