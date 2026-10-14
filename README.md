# Gestão de Eventos Acadêmicos

Plataforma web para criação, organização e gerenciamento de eventos acadêmicos,
como palestras, minicursos, workshops e congressos.

## Funcionalidades

- Cadastro e login de usuários (participante, organizador e administrador)
- Criação, edição e cancelamento de eventos
- Atividades dentro dos eventos (palestras, minicursos, workshops)
- Inscrições com controle de vagas
- Registro de presença
- Emissão de certificados
- Dashboard para organizadores
- Busca e filtro de eventos por categoria, data e local

## Tecnologias

- **Backend:** Python, Flask, SQLAlchemy, Flask-JWT-Extended, Marshmallow
- **Banco de dados:** PostgreSQL
- **Frontend:** React (Vite)
- **Testes:** Pytest

## Estrutura

```
├── Backend/    → API REST em Flask
└── frontend/   → interface em React
```

## Como rodar

### Pré-requisitos
- Python 3.12+
- PostgreSQL
- Node.js LTS

### Backend

```bash
cd Backend
py -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
cp .env.example .env    # depois edite o .env com os seus dados
flask db upgrade
python run.py
```

A API fica disponível em http://localhost:5000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL de conexão do PostgreSQL |
| `JWT_SECRET_KEY` | chave secreta para gerar os tokens de login |

## Testes

```bash
cd Backend
pytest
```

## Autor

<Rikelme Martins> — [GitHub](https://github.com/RikelmeMartins)