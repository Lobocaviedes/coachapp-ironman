import fs from 'fs';
import path from 'path';

export interface DailyContext {
  fecha: string;
  vo2: number;
  hrv7d: number;
  hrvGlobal: number;
  semaforoHrv: '🟢 VERDE' | '🟡 AMARILLO' | '🔴 ROJO';
  rhr7d: number;
  sesiones7d: number;
  faseName: string;
  brechas: {
    natacion: string;
    ciclismo: string;
    running: string;
  };
  reporteCompleto: string;
}

// Path al proyecto Ironman (relativo al workspace iCloud)
const IRONMAN_BASE = path.resolve(
  process.cwd(),
  '../../Ironman_70_3_Project'
);

function getLatestReporte(): string | null {
  const reportesDir = path.join(IRONMAN_BASE, 'reportes');
  if (!fs.existsSync(reportesDir)) return null;

  const files = fs
    .readdirSync(reportesDir)
    .filter((f) => f.startsWith('reporte_') && f.endsWith('.txt'))
    .sort()
    .reverse();

  if (files.length === 0) return null;
  return fs.readFileSync(path.join(reportesDir, files[0]), 'utf-8');
}

function parseReporte(raw: string): Partial<DailyContext> {
  const ctx: Partial<DailyContext> = {};

  // Línea ej: "VO2: 40.8 | HRV 7d: 45.4 ms (🟢 VERDE) | RHR: 63.7 | Fase: PICO | ..."
  const vo2Match = raw.match(/VO2[:\s]+([\d.]+)/);
  if (vo2Match) ctx.vo2 = parseFloat(vo2Match[1]);

  const hrv7dMatch = raw.match(/HRV 7d[:\s]+([\d.]+)/);
  if (hrv7dMatch) ctx.hrv7d = parseFloat(hrv7dMatch[1]);

  const semMatch = raw.match(/(🟢 VERDE|🟡 AMARILLO|🔴 ROJO)/);
  if (semMatch) ctx.semaforoHrv = semMatch[1] as DailyContext['semaforoHrv'];

  const rhrMatch = raw.match(/RHR[:\s]+([\d.]+)/);
  if (rhrMatch) ctx.rhr7d = parseFloat(rhrMatch[1]);

  const faseMatch = raw.match(/Fase[:\s]+(\w+)/);
  if (faseMatch) ctx.faseName = faseMatch[1];

  const natMatch = raw.match(/Nataci[oó]n[:\s]+([\d./\s]+km)/i);
  const cicMatch = raw.match(/Ciclismo[:\s]+([\d./\s]+km)/i);
  const runMatch = raw.match(/Running[:\s]+([\d./\s]+km)/i);
  if (natMatch || cicMatch || runMatch) {
    ctx.brechas = {
      natacion: natMatch ? natMatch[1].trim() : 'sin datos',
      ciclismo: cicMatch ? cicMatch[1].trim() : 'sin datos',
      running: runMatch ? runMatch[1].trim() : 'sin datos',
    };
  }

  ctx.reporteCompleto = raw;
  return ctx;
}

export function loadDailyContext(): DailyContext {
  const defaults: DailyContext = {
    fecha: new Date().toLocaleDateString('es-CO', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }),
    vo2: 0,
    hrv7d: 0,
    hrvGlobal: 0,
    semaforoHrv: '🟡 AMARILLO',
    rhr7d: 0,
    sesiones7d: 0,
    faseName: 'BASE',
    brechas: { natacion: 'sin datos', ciclismo: 'sin datos', running: 'sin datos' },
    reporteCompleto: 'No se encontró reporte del día.',
  };

  try {
    const raw = getLatestReporte();
    if (!raw) return defaults;
    const parsed = parseReporte(raw);
    return { ...defaults, ...parsed };
  } catch (err) {
    console.error('[data-loader] Error leyendo reporte:', err);
    return defaults;
  }
}

export function buildCarlosSystemPrompt(ctx: DailyContext): string {
  return `Eres Carlos Andrés Ospina, Head Coach del proyecto Ironman 70.3 de Lobsang.
Eres de Pereira, Risaralda. Eres directo, empático, apasionado por el triatlón y basas TODO en datos.

## ATLETA
- Nombre: Lobsang
- Objetivo: Completar un Ironman 70.3
- Disciplinas: Natación 1.9 km | Ciclismo 90 km | Running 21.1 km

## ESTADO HOY — ${ctx.fecha}
- VO2 Max: ${ctx.vo2} ml/kg/min
- HRV últimos 7d: ${ctx.hrv7d} ms
- Semáforo HRV: ${ctx.semaforoHrv}
- RHR últimos 7d: ${ctx.rhr7d} BPM
- Fase de entrenamiento: ${ctx.faseName}

## BRECHAS vs IRONMAN 70.3 (semana actual)
- Natación: ${ctx.brechas.natacion}
- Ciclismo: ${ctx.brechas.ciclismo}
- Running: ${ctx.brechas.running}

## REPORTE COMPLETO DEL NOTEBOOK
${ctx.reporteCompleto}

## REGLAS DE CONDUCTA
- Responde SIEMPRE en español
- Sé conciso — Lobsang lee esto desde el iPhone, máximo 4-5 párrafos
- Si el HRV está en 🔴 ROJO, prioriza descanso sin negociación
- Cita los datos específicos del reporte cuando das recomendaciones
- NUNCA inventes métricas que no aparezcan en el contexto
- Termina tu primer mensaje del día con una pregunta sobre cómo se siente Lobsang
- Los domingos, ofrece proactivamente ajustar el plan semanal`;
}
