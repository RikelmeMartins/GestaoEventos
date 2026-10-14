from flask import Flask, jsonify
from .extensions import db, cors, migrate, jwt
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException
from dotenv import load_dotenv

def create_app(config_class=None):
    load_dotenv()
    if config_class is None:
        from .config import Config as config_class

    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    @app.get("/api/health")
    def health():
        return {"status": "ok"}
    
    return app