<p align="center">
  <img src="Frontend/public/favicon.svg" width="72" alt="Logo do Pauta">
</p>

<h1 align="center">Pauta</h1>

<p align="center">Sistema web para gestão de eventos acadêmicos: palestras, minicursos, workshops e semanas acadêmicas.</p>

---

## Sobre

O Pauta reúne os eventos de uma instituição em um só lugar. Participantes encontram os eventos do semestre e a programação de cada um. Organizadores publicam eventos e as atividades de cada dia.

O projeto tem uma **API REST em Flask** com PostgreSQL e uma **interface em React**.

## Funcionalidades

### v1.0 (atual)

- Cadastro e login com três perfis: participante, organizador e administrador (JWT)
- Eventos: criar, editar e cancelar (organizador dono do evento ou administrador)
- Atividades de cada evento, com validação para ficarem dentro do período do evento
- Lista de eventos com abas (Próximos, Encerrados, Todos) e busca por título, local ou categoria
- Calendário do semestre com todos os eventos numa linha do tempo
- Página do evento com a programação por dia e o botão **Salvar na agenda** (arquivo `.ics`)
- Layout adaptado para celular

### v1.1

- Inscrições em eventos com controle de vagas, bloqueio de duplicidade e histórico (cancelar não apaga)
- Botão de inscrição na página do evento

### Próximas versões (v2)

- Painel do organizador (criar e editar eventos e atividades pelo site)
- Registro de presença
- Emissão de certificados
- Filtros por categoria, data e local
- Dashboard com estatísticas por evento
- Painel do administrador

## Tecnologias

| Parte | Tecnologias |
|---|---|
| Backend | Python, Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, Marshmallow, Flask-CORS |
| Banco de dados | PostgreSQL (driver psycopg 3) |
| Frontend | React 19, Vite, React Router, Axios |

## Estrutura

```
├── Backend/
│   ├── app/
│   │   ├── models/      → tabelas do banco (Usuario, Evento, Atividade, Inscricao)
│   │   ├── schemas/     → validação e formato do JSON (Marshmallow)
│   │   ├── services/    → regras de negócio
│   │   ├── routes/      → rotas da API
│   │   ├── auth.py      → controle de acesso por perfil
│   │   └── commands.py  → comandos do terminal (flask criar-admin)
│   ├── migrations/      → histórico do banco (Alembic)
│   └── run.py
└── Frontend/
    └── src/
        ├── pages/       → telas (Eventos, EventoDetalhe, Login, Cadastro)
        ├── components/  → partes reutilizáveis (Topo, FaixaSemestre, ...)
        ├── contexts/    → login guardado (AuthContext)
        ├── services/    → conexão com a API (axios)
        └── utils/       → funções de datas
```

## Como rodar

### Pré-requisitos

- Python 3.12+
- PostgreSQL
- Node.js LTS

### 1. Banco de dados

No PostgreSQL, crie um usuário e um banco para o projeto:

```sql
CREATE USER eventos_user WITH PASSWORD 'sua_senha';
CREATE DATABASE eventos_db OWNER eventos_user;
```

### 2. Backend

```bash
cd Backend
py -m venv .venv
source .venv/Scripts/activate      # Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env               # depois edite o .env com os seus dados
flask db upgrade
python run.py
```

A API fica disponível em http://localhost:5000/api

### 3. Frontend

Em outro terminal:

```bash
cd Frontend
npm install
npm run dev
```

Acesse http://localhost:5173

### 4. Criar o primeiro administrador

Crie uma conta pelo site e depois promova essa conta a administrador:

```bash
cd Backend
flask criar-admin seu@email.com
```

## Variáveis de ambiente

Ficam no arquivo `Backend/.env` (use o `.env.example` como modelo):

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | conexão do PostgreSQL, ex.: `postgresql+psycopg://eventos_user:senha@localhost:5432/eventos_db` |
| `JWT_SECRET_KEY` | chave secreta dos tokens de login (gere com `py -c "import secrets; print(secrets.token_hex(32))"`) |
| `FLASK_APP` | `run.py` |

## API

Todas as rotas começam com `/api`. As rotas protegidas pedem o cabeçalho `Authorization: Bearer <token>`.

### Usuários

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/usuarios/` | público | cria uma conta (participante) |
| POST | `/usuarios/login` | público | devolve `token` e `usuario` |
| GET | `/usuarios/me` | logado | dados do usuário do token |
| GET | `/usuarios/` | administrador | lista os usuários |
| PATCH | `/usuarios/<id>/perfil` | administrador | muda o perfil de um usuário |

### Eventos

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/eventos/` | público | lista os eventos |
| GET | `/eventos/<id>` | público | detalhe com organizador e atividades |
| POST | `/eventos/` | organizador | cria um evento |
| PUT/PATCH | `/eventos/<id>` | organizador dono ou admin | edita um evento |
| POST | `/eventos/<id>/cancelar` | organizador dono ou admin | cancela um evento |

### Atividades

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/eventos/<id>/atividades` | público | atividades de um evento |
| POST | `/eventos/<id>/atividades` | organizador dono ou admin | cria uma atividade |
| GET | `/atividades/<id>` | público | detalhe de uma atividade |
| PUT/PATCH | `/atividades/<id>` | organizador dono ou admin | edita uma atividade |
| DELETE | `/atividades/<id>` | organizador dono ou admin | exclui uma atividade |

### Inscrições

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/eventos/<id>/inscricao` | logado | inscreve o usuário (respeita vagas) |
| DELETE | `/eventos/<id>/inscricao` | logado | cancela a inscrição |
| GET | `/inscricoes/minhas` | logado | inscrições do usuário |

Os erros têm sempre o mesmo formato:

```json
{ "erro": "Dados inválidos", "detalhes": { "campo": ["mensagem"] } }
```

## Autores

Rikelme Martins — [GitHub](https://github.com/RikelmeMartins)
Lucas Moreira - [GitHub](https://github.com/lucasm3)