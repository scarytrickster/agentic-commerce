# Agentic Commerce

An AI-powered commerce backend for product discovery, recommendations, and user authentication. The current implementation is a FastAPI service backed by PostgreSQL and SQLAlchemy's async engine.

## Features

- Product listing with category and price filtering
- Product recommendations with text search, category, price, stock, and result-limit filters
- User signup, login, JWT access tokens, and profile retrieval
- Async PostgreSQL access with SQLAlchemy
- Alembic database migrations
- Natural-language shopping query parsing and product search services

## Technology stack

- Python 3.14+
- FastAPI for the REST API
- Uvicorn for the ASGI development server
- PostgreSQL with `asyncpg` for asynchronous database access
- SQLAlchemy for ORM and database queries
- Alembic for database migrations
- Pydantic and `pydantic-settings` for validation and configuration
- PyJWT for JWT authentication
- `pwdlib` for password hashing with Argon2
- Pytest, `pytest-asyncio`, and HTTPX for testing

## Project structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- api/          # FastAPI routes
|   |   |-- agent/        # Agent tools
|   |   |-- core/         # Configuration and security
|   |   |-- database/     # Async database session
|   |   |-- models/       # SQLAlchemy models
|   |   |-- schemas/      # Pydantic schemas
|   |   `-- services/     # Search and recommendation logic
|   |-- alembic/          # Database migrations
|   |-- tests/            # Automated tests
|   `-- main.py
`-- frontend/             # Reserved for the frontend application
```

## Requirements

- Python 3.14 or newer
- PostgreSQL

## Getting started

1. Create a PostgreSQL database, for example `agentic_commerce`.

2. Create and activate a virtual environment from the repository root:

   ```bash
   cd backend
   python -m venv .venv
   ```

   On macOS/Linux:

   ```bash
   source .venv/bin/activate
   ```

   On Windows PowerShell:

   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create `backend/.env` with the following values:

   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/agentic_commerce
   JWT_SECRET_KEY=replace-with-a-long-random-secret
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

5. Apply migrations and seed sample products:

   ```bash
   alembic upgrade head
   python -m app.scripts.seed_products
   ```

6. Start the API:

   ```bash
   uvicorn app.main:app --reload
   ```

The API will be available at `http://127.0.0.1:8000`. Interactive documentation is available at `/docs`, and the ReDoc documentation is available at `/redoc`.

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Check service health |
| `GET` | `/products` | List products with optional filters |
| `GET` | `/products/recommendations` | Search and recommend products |
| `POST` | `/auth/signup` | Create a user account |
| `POST` | `/auth/login` | Authenticate and receive a JWT |
| `GET` | `/auth/profile` | Get the authenticated user profile |

Example recommendation request:

```bash
curl "http://127.0.0.1:8000/products/recommendations?query=running&category=shoes&max_price=4000&in_stock=true&limit=5"
```

Example signup request:

```bash
curl -X POST "http://127.0.0.1:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"shopper@example.com","password":"strong-password"}'
```

## Testing

Run the test suite from the `backend` directory:

```bash
pytest
```

The database connection test requires a running PostgreSQL instance and a valid `DATABASE_URL` in `backend/.env`.

## Development status

The backend API and core commerce services are under active development. The `frontend` directory is reserved for the client application and does not currently contain an implemented frontend.

## License

No license has been added yet.
