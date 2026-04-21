# 📏 Reglas de Filtrado de Entrenamientos — Relevancia Ironman 70.3
**Definidas por:** Héctor, Nairo, Catherine, Alejandro, Simón  
**Aprobadas por:** Jose (Orquestador)  
**Fecha:** 2026-04-21

---

## Fundamento Científico

Un Ironman 70.3 exige:
- 🏊 **1.9 km** de natación (aguas abiertas)
- 🚴 **90 km** de ciclismo
- 🏃 **21.1 km** de carrera

Para que una sesión tenga **impacto real** en la preparación, debe generar un estímulo fisiológico medible: adaptación aeróbica, neuromuscular o metabólica. Sesiones muy cortas o de muy baja intensidad no generan adaptación suficiente para las distancias del 70.3.

---

## Reglas por Disciplina

| Actividad | ¿Cuenta? | Criterio mínimo | Justificación |
|---|---|---|---|
| **Pool Swim** | ✅ SIEMPRE | Cualquier distancia | Con solo 10 sesiones totales, cada metro en el agua cuenta |
| **Open Water Swim** | ✅ SIEMPRE | Cualquier distancia | Simula condición de carrera real |
| **Outdoor Cycling** | ✅ Si ≥ 8 km | < 8 km = descartado | Ciclos cortos (<30 min) no generan adaptación aeróbica relevante |
| **Indoor Cycling** | ✅ Si ≥ 20 min | < 20 min = descartado | En rodillo, el estímulo es más intenso, umbral menor |
| **Outdoor Run** | ✅ Si ≥ 3 km | < 3 km = descartado | Por debajo de 3 km no hay estímulo aeróbico real (< 20 min) |
| **Indoor Run** | ✅ Si ≥ 3 km | < 3 km = descartado | Igual que outdoor run |
| **Outdoor Walk** | ✅ Si ≥ 5 km | < 5 km = descartado | Caminatas cortas son recuperación activa, no entrenamiento |
| **Hiking** | ✅ Si ≥ 5 km | < 5 km = descartado | Terreno exigente pero distancia mínima para impacto |
| **Traditional Strength Training** | ✅ SIEMPRE | Cualquier duración | Fundamental para prevención de lesiones y economía de movimiento |
| **Core Training** | ✅ SIEMPRE | Cualquier duración | Esencial para postura en bici y running |
| **HIIT** | ✅ SIEMPRE | Cualquier duración | Alta intensidad = alto impacto metabólico independiente de distancia |
| **Brick Workout** (bici+run) | ✅ SIEMPRE | Cualquier distancia | Entrenamiento específico de triatlón |

---

## Clasificación por Disciplina Ironman

```python
# Usar en simon_data_analysis.ipynb
FILTROS_IRONMAN = {
    'Pool Swim':                    {'min_km': 0,    'min_min': 0,  'disciplina': 'Natación'},
    'Open Water Swim':              {'min_km': 0,    'min_min': 0,  'disciplina': 'Natación'},
    'Outdoor Cycling':              {'min_km': 8,    'min_min': 0,  'disciplina': 'Ciclismo'},
    'Indoor Cycling':               {'min_km': 0,    'min_min': 20, 'disciplina': 'Ciclismo'},
    'Outdoor Run':                  {'min_km': 3,    'min_min': 0,  'disciplina': 'Running'},
    'Indoor Run':                   {'min_km': 3,    'min_min': 0,  'disciplina': 'Running'},
    'Outdoor Walk':                 {'min_km': 5,    'min_min': 0,  'disciplina': 'Fuerza Base'},
    'Hiking':                       {'min_km': 5,    'min_min': 0,  'disciplina': 'Fuerza Base'},
    'Traditional Strength Training':{'min_km': 0,    'min_min': 0,  'disciplina': 'Fuerza'},
    'Core Training':                {'min_km': 0,    'min_min': 0,  'disciplina': 'Fuerza'},
    'High Intensity Interval Training': {'min_km': 0,'min_min': 0,  'disciplina': 'HIIT'},
}
```

---
*Documento técnico — Firmado por el Equipo Ironman 70.3*
