#!/usr/bin/env bash
set -euo pipefail

DB_CONTAINER_NAME="guitar_chords_db"

if ! docker ps -a --format '{{.Names}}' | grep -Eq "^${DB_CONTAINER_NAME}$"; then
  docker run -d \
    --name "$DB_CONTAINER_NAME" \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=guitar_chords \
    -p 5432:5432 \
    postgres
else
  docker start "$DB_CONTAINER_NAME"
fi

# install dependencies for all workspaces
npm install >/dev/null

# ensure prisma client is generated
npm run prisma:generate -w server >/dev/null

# apply database migrations when env file is present
if [ -f server/.env ]; then
  npm run prisma:migrate -w server >/dev/null
fi

npm run dev:workspaces
