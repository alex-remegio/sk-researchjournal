#!/usr/bin/env bash
# Reliable seed runner — avoids bare `tsx` IPC issues and prints the full error.
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Set DATABASE_URL first (Neon/Supabase URI)."
  echo "Example:"
  echo '  DATABASE_URL="postgresql://USER:PASS@HOST/neondb?sslmode=require" npm run db:seed'
  exit 1
fi

# Strip Neon channel_binding which often breaks Node drivers
export DATABASE_URL
DATABASE_URL="$(node -e "const u=process.env.DATABASE_URL||''; process.stdout.write(u.replace(/([?&])channel_binding=require&?/g,'\$1').replace(/[?&]$/,'').replace(/\?&/,'?'))")"

echo "Seeding database at: $(node -e "try{const u=new URL(process.env.DATABASE_URL); console.log(u.hostname+'/'+u.pathname.slice(1))}catch{console.log('(unparseable)')}")"
node --import tsx prisma/seed.ts
