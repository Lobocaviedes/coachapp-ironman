#!/bin/zsh
# =============================================================================
# sync_health_data.sh — Protocolo de Sincronización Diaria de Datos
# Proyecto: Ironman 70.3 — Personal Knowledge Assistant
# Autor: Simón (Data Analyst) — Coordinado por Jose (Orquestador)
# =============================================================================
# Este script copia los archivos NUEVOS (no existentes o modificados) desde
# la app Auto Export en iCloud Drive hacia los folders del proyecto,
# para que todos los agentes del equipo tengan acceso a los datos actualizados.
# =============================================================================

# --- Colores para el output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "🔄 =============================================="
echo "   SYNC DIARIO — EQUIPO IRONMAN 70.3"
echo "   $(date '+%d de %B de %Y, %H:%M')"
echo "================================================"
echo ""

# --- Rutas de origen (iCloud / Auto Export App) ---
SOURCE_WORKOUTS="/Users/Lobsang/Library/Mobile Documents/iCloud~com~ifunography~HealthExport/Documents/Ironman 70.3 incubator"
SOURCE_HEALTH="/Users/Lobsang/Library/Mobile Documents/iCloud~com~ifunography~HealthExport/Documents/Health for Ironman "

# --- Rutas de destino (Personal Knowledge Assistant) ---
DEST_WORKOUTS="/Users/Lobsang/Library/Mobile Documents/com~apple~CloudDocs/Personal Knowledge Assitant/Incubadora/Ironman_70_3_Project/Workouts Apple Watch"
DEST_HEALTH="/Users/Lobsang/Library/Mobile Documents/com~apple~CloudDocs/Personal Knowledge Assitant/Incubadora/Ironman_70_3_Project/health data apple watch"

# Nota: DEST_WORKOUTS apunta a 'Workouts Apple Watch' (sesiones de actividad)
# Nota: DEST_HEALTH apunta a 'health data apple watch' (HRV, VO2, RHR, SpO2, etc.)

# --- Función de copia ---
sync_folder() {
    local SOURCE="$1"
    local DEST="$2"
    local LABEL="$3"

    if [ ! -d "$SOURCE" ]; then
        echo "${RED}❌ ERROR: Origen no encontrado: $SOURCE${NC}"
        return 1
    fi

    mkdir -p "$DEST"

    # rsync: copia solo archivos nuevos o modificados (--update), preservando timestamps
    RESULT=$(rsync -av --update --include="*.json" --exclude="*" "$SOURCE/" "$DEST/" 2>&1)
    NEW_FILES=$(echo "$RESULT" | grep "\.json" | grep -v "/" | wc -l | tr -d ' ')

    if [ "$NEW_FILES" -gt "0" ]; then
        echo "${GREEN}✅ $LABEL: $NEW_FILES archivo(s) nuevo(s) copiado(s)${NC}"
        echo "$RESULT" | grep "\.json" | grep -v "/" | sed 's/^/   📄 /'
    else
        echo "${YELLOW}✓  $LABEL: Sin archivos nuevos. Todo al día.${NC}"
    fi
    echo ""
}

# --- Ejecutar sincronización ---
echo "🏊 Sincronizando Workouts (Nado, Bici, Trote)..."
sync_folder "$SOURCE_WORKOUTS" "$DEST_WORKOUTS" "Workouts Apple Watch"

echo "🧬 Sincronizando Health Data (HRV, VO2, Sueño, SpO2)..."
sync_folder "$SOURCE_HEALTH" "$DEST_HEALTH" "Health Data Apple Watch"

# --- Conteo final ---
TOTAL_W=$(ls "$DEST_WORKOUTS"/*.json 2>/dev/null | wc -l | tr -d ' ')
TOTAL_H=$(ls "$DEST_HEALTH"/*.json 2>/dev/null | wc -l | tr -d ' ')

echo "================================================"
echo "📊 RESUMEN FINAL:"
echo "   Workouts disponibles: $TOTAL_W archivos"
echo "   Health data disponibles: $TOTAL_H archivos"
echo "   📁 Destino: Personal Knowledge Assistant/Incubadora/Ironman_70_3_Project/"
echo ""
echo "💡 Próximo paso: Abre simon_data_analysis.ipynb y corre 'Run All'"
echo "================================================"
echo ""
