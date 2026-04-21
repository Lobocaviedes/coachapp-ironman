#!/bin/zsh
# sync_to_coachapp.sh
# 
# Copia el reporte diario de Simón al repositorio de CoachApp y hace push.
# Se ejecuta automáticamente después de correr el notebook de análisis.
#
# Uso: ./sync_to_coachapp.sh
# Cron sugerido: 9:30 AM (30 min después del sync de Apple Watch)

set -e

WORKSPACE_ROOT="/Users/Lobsang/Library/Mobile Documents/com~apple~CloudDocs/Personal Knowledge Assitant"
IRONMAN_REPORTES="$WORKSPACE_ROOT/Incubadora/Ironman_70_3_Project/reportes"
COACHAPP_DATA="$WORKSPACE_ROOT/Incubadora/CoachApp/app/public/data"
COACHAPP_REPO="$WORKSPACE_ROOT/Incubadora/CoachApp/app"

echo "🔄 Sincronizando reportes a CoachApp..."

# Encontrar el reporte más reciente
LATEST=$(ls -t "$IRONMAN_REPORTES"/reporte_*.txt 2>/dev/null | head -1)

if [ -z "$LATEST" ]; then
  echo "❌ No se encontró ningún reporte en $IRONMAN_REPORTES"
  exit 1
fi

FILENAME=$(basename "$LATEST")
echo "📄 Reporte encontrado: $FILENAME"

# Copiar al repo de CoachApp
cp "$LATEST" "$COACHAPP_DATA/$FILENAME"

# Commit y push
cd "$COACHAPP_REPO"
git add "public/data/$FILENAME"
git commit -m "data: actualizar $FILENAME — sync diario $(date '+%Y-%m-%d %H:%M')" || echo "ℹ️  Sin cambios que commitear"
git push origin main

echo "✅ Reporte sincronizado y publicado en CoachApp"
echo "🚀 Vercel re-deploy automático desde GitHub en ~30 segundos"
