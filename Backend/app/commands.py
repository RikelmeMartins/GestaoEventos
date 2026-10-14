import click
from app.extensions import db
from app.models.usuario import Usuario

def registrar_comandos(app):
    @app.cli.command("criar-admin")
    @click.argument("email")
    def criar_admin(email):
        usuario = db.session.scalar(db.select(Usuario).filter_by(email=email.strip().lower()))
        if usuario is None:
            raise click.ClickException(f"Nenhum usuário com o e-mail {email}")

        if usuario.perfil == "administrador":
            click.echo(f"{email} já é administrador.")
            return

        usuario.perfil = "administrador"
        db.session.commit()
        click.echo(f"{email} agora é administrador. Faça login novamente.")