# 🔄 Protocolo de Sincronización Diaria de Datos
**Responsable:** Simón (Data Analyst) | **Supervisor:** Jose (Orquestador)

---

## ¿Por qué es necesario copiar los datos?

Los agentes del equipo (Simón, Alejandro, Andrea, Valentina) trabajan dentro del folder de **Personal Knowledge Assistant** en iCloud. Los archivos de la app **Auto Export** se guardan en una ubicación separada de iCloud (`iCloud~com~ifunography~HealthExport`), a la que los agentes no tienen acceso directo al analizar documentos. Por eso se deben sincronizar manualmente o de forma automática a las carpetas del proyecto.

---

## 📁 Estructura de Datos del Proyecto

```
Ironman_70_3_Project/
├── Workouts Apple Watch/     ← Datos de sesiones (Nado, Bici, Trote, HR)
├── health data apple watch/  ← Datos de salud diaria (HRV, VO2, SpO2, Sueño)
└── sync_health_data.sh       ← Script de sincronización
```

### Origen (Auto Export App en iCloud)
| Carpeta | Contenido |
|---------|-----------|
| `Ironman 70.3 incubator/` | Workouts registrados por actividad |
| `Health for Ironman /` | Métricas de salud diaria (HRV, VO2 Max, RHR, SpO2, etc.) |

### Destino (Personal Knowledge Assistant)
| Carpeta | Contenido |
|---------|-----------|
| `Workouts Apple Watch/` | Copia sincronizada de workouts |
| `health data apple watch/` | Copia sincronizada de health data |

---

## 🚀 Cómo Ejecutar la Sincronización

### Opción 1: Manual desde Terminal (Recomendado para empezar)
Abre una terminal en VS Code (`Ctrl + ~`) y ejecuta:

```zsh
"/Users/Lobsang/Library/Mobile Documents/com~apple~CloudDocs/Personal Knowledge Assitant/Incubadora/Ironman_70_3_Project/sync_health_data.sh"
```

El script copiará **solo los archivos nuevos** que no estén ya en el destino (usando `rsync --update`).

### Opción 2: Automatización con cron (Sincronización diaria automática)
Para que se ejecute todos los días a las 6:00 AM sin intervención manual:

1. Abre el editor de cron en la terminal:
```zsh
crontab -e
```

2. Agrega esta línea al final del archivo (se abre con `vi` → presiona `i` para editar):
```
0 9 * * * "/Users/Lobsang/Library/Mobile Documents/com~apple~CloudDocs/Personal Knowledge Assitant/Incubadora/Ironman_70_3_Project/sync_health_data.sh" >> /tmp/ironman_sync.log 2>&1
```

3. Guarda y sal: presiona `Esc`, luego escribe `:wq` y presiona `Enter`.

4. Para verificar que quedó activo:
```zsh
crontab -l
```

> **Nota:** macOS puede pedir permisos de acceso total al disco para cron. Si lo hace, ve a `Preferencias del Sistema → Seguridad y Privacidad → Privacidad → Acceso total al disco` y agrega `cron` o `Terminal`.

---

## 📋 Métricas Disponibles por Tipo de Archivo

### Workouts (`Workouts Apple Watch/`)
- `name` — Tipo de actividad (Cycling, Running, Swimming, etc.)
- `start / end` — Fecha y hora de la sesión
- `duration` — Duración total
- `distance` — Distancia recorrida (km)
- `avgHeartRate / maxHeartRate` — FC promedio y máxima
- `activeEnergyBurned` — Calorías quemadas
- `speed` — Velocidad promedio
- `heartRateData` — Serie temporal de FC minuto a minuto

### Health Data (`health data apple watch/`)
- `heart_rate_variability` — HRV (ms) — Usado por Alejandro
- `resting_heart_rate` — FC en reposo — Indicador de recuperación
- `vo2_max` — VO2 Máximo estimado — Marcador de fitness aeróbico
- `blood_oxygen_saturation` — SpO2 (%) — Oxigenación
- `respiratory_rate` — Frecuencia respiratoria
- `step_count` — Pasos diarios
- `active_energy` — Energía activa total del día
- `cardio_recovery` — Recuperación cardíaca post-esfuerzo

---

## ⚙️ Responsabilidades del Equipo

| Agente | Acción |
|--------|--------|
| **Simón** | Ejecutar el sync antes de cada análisis. Verificar integridad de los datos. |
| **Alejandro** | Revisar HRV y VO2 Max después de cada sincronización para evaluar recuperación. |
| **Andrea** | Cruzar calorías activas con plan nutricional. |
| **Valentina** | Revisar consistencia de pasos y actividad general para análisis de hábitos. |
| **Jose** | Recordarle a Lobsang exportar desde Auto Export en el iPhone cada 2-3 días. |

---

## 📱 Recordatorio para Lobsang (Exportar desde el iPhone)

1. Abre la app **Health Auto Export** en tu iPhone.
2. Ve a la sección de exportación y selecciona el folder `Ironman 70.3 incubator` para workouts y `Health for Ironman` para salud general.
3. Exporta los datos más recientes (los nuevos desde tu última exportación).
4. La app los sube automáticamente a iCloud.
5. En tu Mac, ejecuta `sync_health_data.sh` y el equipo ya tendrá los datos frescos.

**Frecuencia recomendada:** Exportar desde el iPhone cada 2-3 días (idealmente la noche antes de sesión de análisis semanal con el equipo).
