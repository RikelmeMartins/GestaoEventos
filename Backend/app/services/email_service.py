import smtplib
from email.message import EmailMessage
from flask import current_app

def enviar_email(para, assunto, texto):
    config = current_app.config

    if not config["MAIL_SERVER"]:
        print(f"\n===== E-MAIL para {para} =====\nAssunto: {assunto}\n\n{texto}\n==========\n", flush=True)
        return

    mensagem = EmailMessage()
    mensagem["From"] = config["MAIL_FROM"]
    mensagem["To"] = para
    mensagem["Subject"] = assunto
    mensagem.set_content(texto)

    try: 
        with smtplib.SMTP(config["MAIL_SERVER"], config["MAIL_PORT"], timeout=10) as smtp:
            smtp.starttls()
            smtp.login(config["MAIL_USERNAME"], config["MAIL_PASSWORD"])
            smtp.send_message(mensagem)
    except (smtplib.SMTPException, OSError):
        current_app.logger.exception("Falha ao enviar e-mail para %s", para)