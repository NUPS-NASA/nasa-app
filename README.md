# nups-nasa Frontend

React + Vite client targeting the nups API. Development tooling relies on pnpm and Node.js 20.

## Local Development

Install dependencies and start Vite locally:
```bash
pnpm install
pnpm dev -- --host 0.0.0.0 --port 5173
```

## Docker Development

The repository root includes a `docker-compose.yml` that can run both the API and this frontend with hot reload.

Start only the frontend (container installs dependencies on first boot):
```bash
docker compose up --build nups-web
```

Or launch API + frontend together:
```bash
docker compose up --build
```

Vite publishes on http://localhost:5173 with polling-based reload so file changes on the host trigger updates in the container. Dependencies install into an isolated Docker volume, so you won't see host/node_modules conflicts across platforms. Stop the services with `Ctrl+C` or `docker compose down`.
