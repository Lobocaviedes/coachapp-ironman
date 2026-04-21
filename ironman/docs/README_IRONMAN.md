# 🏆 Proyecto Ironman 70.3 — Índice Maestro

> **Empresa:** Ironman 70.3 Training Team (Incubadora)
> **Cliente:** Lobsang (42 años, nivel fitness: persona normal con ganas de ser Finisher)
> **Gestora de Documentación:** Mariana 📝
> **Última actualización:** 21 de Abril de 2026

---

## 📁 Estructura del Proyecto

```
Ironman_70_3_Project/
│
├── 📄 README.md                          ← Estás aquí. Índice maestro.
├── 📄 LEAN_CANVAS_IRONMAN.md             ← Estrategia y modelo de negocio del proyecto
├── 📄 Resumen_Entrenamiento_Lobsang_V1.md← Historial de entrenamientos, lesiones y aprendizajes
├── 📄 PROTOCOLO_SYNC_DATOS.md            ← Cómo sincronizar datos del Apple Watch cada día
├── 🔧 sync_health_data.sh                ← Script de sincronización automática (corre a las 9am)
│
├── 👥 equipo/                            ← SOLO perfiles y roles del equipo de expertos
│   └── 📖 README.md                      ← Índice del equipo y links a cada experto
│
├── 📊 analisis/                          ← Notebooks de Python y código de análisis
│   ├── 📖 README.md                      ← Cómo correr los análisis
│   ├── simon_data_analysis.ipynb         ← Notebook fuente (editable)
│   └── simon_data_analysis_output.ipynb  ← Notebook ejecutado (consulta rápida)
│
├── 📈 reportes/                          ← Gráficas e imágenes generadas automáticamente
│   ├── simon_metricas_base.png
│   └── alejandro_health_metrics.png
│
├── 🏋️ Workouts Apple Watch/              ← Datos crudos de sesiones (130 archivos JSON)
│   └── 📖 README.md                      ← Estructura del JSON y tipos de actividades
│
└── 🧬 health data apple watch/           ← Datos crudos de salud diaria (171 archivos JSON)
    └── 📖 README.md                      ← Métricas disponibles (HRV, VO2, RHR, SpO2)
```

---

## 🚀 ¿Por dónde empezar?

| Si quieres... | Ve a... |
|---|---|
| Entender la estrategia general del proyecto | [`LEAN_CANVAS_IRONMAN.md`](LEAN_CANVAS_IRONMAN.md) |
| Ver el historial de entrenamientos y lesiones | [`Resumen_Entrenamiento_Lobsang_V1.md`](Resumen_Entrenamiento_Lobsang_V1.md) |
| Ver o correr el análisis de datos del Apple Watch | [`analisis/simon_data_analysis.ipynb`](analisis/simon_data_analysis.ipynb) |
| Ver los resultados del análisis sin correr código | [`analisis/simon_data_analysis_output.ipynb`](analisis/simon_data_analysis_output.ipynb) |
| Ver las gráficas generadas | [`reportes/`](reportes/) |
| Conocer al equipo de expertos | [`equipo/README.md`](equipo/README.md) |
| Sincronizar nuevos datos desde el iPhone | [`PROTOCOLO_SYNC_DATOS.md`](PROTOCOLO_SYNC_DATOS.md) |
| Entender la estructura de los datos JSON | [`Workouts Apple Watch/README.md`](Workouts%20Apple%20Watch/README.md) |

---

## 👥 El Equipo de Expertos

| Experto | Especialidad | Archivo |
|---|---|---|
| 🏊 Héctor | Natación y aguas abiertas | [`equipo/hector_natacion.md`](equipo/hector_natacion.md) |
| 🚴 Nairo | Ciclismo y potencia | [`equipo/nairo_ciclismo.md`](equipo/nairo_ciclismo.md) |
| 🏃 Catherine | Running y biomecánica | [`equipo/catherine_running.md`](equipo/catherine_running.md) |
| 🥗 Andrea | Nutrición deportiva | [`equipo/andrea_nutricion.md`](equipo/andrea_nutricion.md) |
| 🧬 Alejandro | Medicina funcional y recuperación | [`equipo/alejandro_medicina.md`](equipo/alejandro_medicina.md) |
| 💻 Simón | Análisis de datos (Apple Watch) | [`equipo/simon_data.md`](equipo/simon_data.md) |
| 🧠 Valentina | Growth Mindset y psicología deportiva | [`equipo/valentina_mindset.md`](equipo/valentina_mindset.md) |

---

## 📊 Estado Actual del Proyecto (21 Abr 2026)

| KPI | Valor | Tendencia |
|---|---|---|
| VO2 Max | 40.8 ml/kg/min | 📈 +7.8 desde Nov 2025 |
| Sesiones totales | 193 entrenamientos | ✅ |
| Distancia acumulada | 851 km | ✅ |
| HRV últimos 7 días | 45.4 ms | ⚠️ Bajando, necesita recuperación |
| Isquiotibial izquierdo | En recuperación | 🟡 Estable |

---
*Documento mantenido por Mariana (Document Controller) — Eje Cafetero*
