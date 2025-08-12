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

pushd server >/dev/null
if [ -f .env ]; then
  npx prisma db push >/dev/null
fi
popd >/dev/null

npm run dev
