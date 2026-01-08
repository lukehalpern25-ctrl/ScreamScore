#!/bin/bash
# Build script for Vercel that generates Prisma client without database connection

# Temporarily set a dummy DATABASE_URL if not set (for Prisma generate)
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="postgresql://dummy:dummy@dummy:5432/dummy"
fi

# Generate Prisma client (this shouldn't need a real connection)
prisma generate --schema=./prisma/schema.prisma

# Build Next.js
next build
