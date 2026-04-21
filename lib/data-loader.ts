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
  brechas: { natacion: string; ciclismo: string; running: string };
  reporteCompleto: string;
  perfilAtleta: AtletaPerfil | null;
}

export interface AtletaPerfil {
  atleta: { nombre: string; edad: number; peso_kg: number | null; objetivo_principal: string; proxima_carrera: string; bicicleta?: string };
  composicion_corporal: { fecha: string; peso_kg: number | null; grasa_corporal_pct: number | null; masa_muscular_kg: number | null; nota?: string }[];
  historial_lesiones: {
    fecha_inicio: string | null;
    zona: string | null;
    descripcion: string | null;
    estado_actual?: string | null;
    impacto_entrenamiento: string[] | string | null;
    nivel_dolor_actual?: string;
  }[];
  marcas_personales: {
    natacion: {
      SWOLF_promedio_reciente?: number | null;
      SWOLF_promedio?: number | null;
      cadencia_brazadas_promedio_spm?: number | null;
      distancia_continua_max_m?: number | null;
      nota?: string;
    };
    ciclismo: {
      FTP_watts: number | null;
      velocidad_Z2_kmh?: number | null;
      velocidad_mejor_reciente_kmh?: number | null;
      cadencia_optima_rpm?: number | null;
      nota?: string;
    };
    running: {
      pace_Z2_min_km: string | number | null;
      pace_Z2_rango_min_km?: string | null;
      pace_threshold_min_km?: string | null;
      cadencia_optima_spm?: number | null;
      distancia_CACO_max_km?: number | null;
      nota?: string;
    };
    fuerza: {
      dominadas_max_reps?: number | null;
      dominadas_max?: number | null;
      sentadilla_1RM_kg?: number | null;
      nota?: string;
    };
  };
  registro_fuerza: {
    fecha: string;
    gimnasio: string;
    contexto?: string;
    objetivo?: string;
    duracion_min: number | null;
    ejercicios: { nombre: string | null; series: number | null; repeticiones: string | number | null; peso_kg: string | number | null; proposito?: string }[];
    notas_sesion: string | null;
  }[];
  zonas_frecuencia_cardiaca: { FCmax: number | null; FC_reposo: number; Z2_base_aerobica?: string };
}

const IRONMAN_BASE = path.resolve(process.cwd(), '../../Ironman_70_3_Project');
const LOCAL_DATA_DIR = path.join(process.cwd(), 'public', 'data');

function getLatestReporte(): string | null {
  if (fs.existsSync(LOCAL_DATA_DIR)) {
    const files = fs.readdirSync(LOCAL_DATA_DIR)
      .filter(f => f.startsWith('reporte_') && f.endsWith('.txt'))
      .sort().reverse();
    if (files.length > 0) return fs.readFileSync(path.join(LOCAL_DATA_DIR, files[0]), 'utf-8');
  }
  const reportesDir = path.join(IRONMAN_BASE, 'reportes');
  if (!fs.existsSync(reportesDir)) return null;
  const files = fs.readdirSync(reportesDir)
    .filter(f => f.startsWith('reporte_') && f.endsWith('.txt'))
    .sort().reverse();
  if (files.length === 0) return null;
  return fs.readFileSync(path.join(reportesDir, files[0]), 'utf-8');
}

function loadPerfilAtleta(): AtletaPerfil | null {
  const perfilPath = path.join(LOCAL_DATA_DIR, 'perfil_atleta.json');
  if (!fs.existsSync(perfilPath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(perfilPath, 'utf-8'));
    return {
      atleta: raw.atleta || {},
      composicion_corporal: raw.composicion_corporal || [],
      historial_lesiones: raw.historial_lesiones || [],
      marcas_personales: raw.marcas_personales || {},
      registro_fuerza: raw.registro_fuerza || [],
      zonas_frecuencia_cardiaca: raw.zonas_frecuencia_cardiaca || {},
    };
  } catch { return null; }
}

function parseReporte(raw: string): Partial<DailyContext> {
  const ctx: Partial<DailyContext> = {};
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
    fecha: new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    vo2: 0, hrv7d: 0, hrvGlobal: 0,
    semaforoHrv: '🟡 AMARILLO',
    rhr7d: 0, sesiones7d: 0, faseName: 'BASE',
    brechas: { natacion: 'sin datos', ciclismo: 'sin datos', running: 'sin datos' },
    reporteCompleto: 'No se encontró reporte del día.',
    perfilAtleta: null,
  };
  try {
    const raw = getLatestReporte();
    const perfil = loadPerfilAtleta();
    if (!raw) return { ...defaults, perfilAtleta: perfil };
    return { ...defaults, ...parseReporte(raw), perfilAtleta: perfil };
  } catch (err) {
    console.error('[data-loader] Error:', err);
    return defaults;
  }
}

function formatComposicion(p: AtletaPerfil): string {
  const last = p.composicion_corporal.filter(c => c.peso_kg).slice(-1)[0];
  const peso = p.atleta?.peso_kg;
  if (!last && !peso) return 'Sin datos registrados.';
  const pesoFinal = last?.peso_kg ?? peso;
  const grasa = last?.grasa_corporal_pct ?? null;
  const musculo = last?.masa_muscular_kg ?? null;
  const fecha = last?.fecha ?? 'sin fecha';
  return `Peso: ${pesoFinal} kg | Grasa: ${grasa ?? 'sin dato'}% | Músculo: ${musculo ?? 'sin dato'} kg (registrado: ${fecha})`;
}

function formatLesiones(p: AtletaPerfil): string {
  const activas = p.historial_lesiones.filter(l => l.zona);
  if (!activas.length) return 'Sin lesiones registradas.';
  return activas.map(l => {
    const impacto = Array.isArray(l.impacto_entrenamiento)
      ? l.impacto_entrenamiento.join(' | ')
      : (l.impacto_entrenamiento ?? '');
    const estado = l.estado_actual ? ` [${l.estado_actual}]` : '';
    const dolor = l.nivel_dolor_actual ? ` — Dolor actual: ${l.nivel_dolor_actual}` : '';
    return `• ${l.zona} (desde ${l.fecha_inicio ?? '?'})${estado}${dolor}\n  ${l.descripcion}\n  ⚠️ Restricciones: ${impacto}`;
  }).join('\n\n');
}

function formatMarcas(p: AtletaPerfil): string {
  const m = p.marcas_personales;
  const swolf = m?.natacion?.SWOLF_promedio_reciente ?? m?.natacion?.SWOLF_promedio;
  const swolfStr = swolf ? `SWOLF ~${swolf} (calc: seg/largo + brazadas/largo)` : 'pendiente (Simón calcula en notebook v2)';
  const cadNat = m?.natacion?.cadencia_brazadas_promedio_spm ?? '~13';
  const distCont = m?.natacion?.distancia_continua_max_m ?? '?';
  const ftpStr = m?.ciclismo?.FTP_watts ? `${m.ciclismo.FTP_watts}W` : 'sin dato (Apple Watch no mide watts — requiere potenciómetro)';
  const velZ2 = m?.ciclismo?.velocidad_Z2_kmh ? `${m.ciclismo.velocidad_Z2_kmh} km/h` : '?';
  const velMejor = m?.ciclismo?.velocidad_mejor_reciente_kmh ? `${m.ciclismo.velocidad_mejor_reciente_kmh} km/h` : '?';
  const paceZ2 = m?.running?.pace_Z2_min_km ?? '?';
  const paceRango = m?.running?.pace_Z2_rango_min_km ?? '?';
  const paceTh = m?.running?.pace_threshold_min_km ?? '?';
  const distCACO = m?.running?.distancia_CACO_max_km ?? '?';
  const dominadas = m?.fuerza?.dominadas_max_reps ?? m?.fuerza?.dominadas_max ?? '?';
  return [
    `🏊 NATACIÓN — ${swolfStr} | Cadencia: ${cadNat} braz/min | Distancia continua máx: ${distCont} m`,
    `� CICLISMO — FTP: ${ftpStr} | Vel Z2: ${velZ2} | Mejor Azzurri: ${velMejor}`,
    `🏃 RUNNING — Pace Z2: ${paceZ2} min/km (rango: ${paceRango}) | Umbral: ${paceTh} min/km | Distancia CACO máx: ${distCACO} km`,
    `💪 FUERZA — Dominadas: ${dominadas} reps | Sentadilla 1RM: ${m?.fuerza?.sentadilla_1RM_kg ?? 'sin dato'} kg`,
  ].join('\n');
}

function formatFuerza(p: AtletaPerfil): string {
  const sesiones = p.registro_fuerza.filter(s => s.fecha).slice(-3);
  if (!sesiones.length) return 'Sin sesiones registradas. Snap Fitness no sincroniza con Apple Health — ingreso manual requerido.';
  return sesiones.map(s => {
    const ejerciciosList = s.ejercicios
      .filter(e => e.nombre)
      .map(e => `    - ${e.nombre}: ${e.series}x${e.repeticiones} [${e.peso_kg ?? 'sin peso'}]`)
      .join('\n');
    return `• ${s.fecha} [${s.gimnasio}] — ${s.objetivo ?? ''}\n  Contexto: ${s.contexto ?? ''}\n${ejerciciosList}\n  Nota: ${s.notas_sesion ?? ''}`;
  }).join('\n\n');
}

export function buildCarlosSystemPrompt(ctx: DailyContext): string {
  const p = ctx.perfilAtleta;
  return `Eres Carlos Andrés Ospina, Head Coach del proyecto Ironman 70.3 de Lobsang.
Eres de Pereira, Risaralda. Directo, empático, apasionado por el triatlón. Basas TODO en datos.

## ATLETA
- Nombre: Lobsang, 42 años
- Objetivo: Ironman 70.3 — Natación 1.9km | Ciclismo 90km | Running 21.1km

## ESTADO HOY — ${ctx.fecha}
- VO2 Max: ${ctx.vo2} ml/kg/min
- HRV 7d: ${ctx.hrv7d} ms — ${ctx.semaforoHrv}
- RHR 7d: ${ctx.rhr7d} BPM | Fase: ${ctx.faseName}

## BRECHAS SEMANALES vs IRONMAN 70.3
- Natación: ${ctx.brechas.natacion}
- Ciclismo: ${ctx.brechas.ciclismo}
- Running: ${ctx.brechas.running}

## COMPOSICIÓN CORPORAL
${p ? formatComposicion(p) : 'Sin datos.'}

## LESIONES / HISTORIAL MÉDICO
${p ? formatLesiones(p) : 'Sin lesiones registradas.'}

## MARCAS PERSONALES Y MÉTRICAS DE DISCIPLINA
${p ? formatMarcas(p) : 'Sin marcas registradas.'}

## FUERZA — ÚLTIMAS SESIONES (Snap Fitness)
${p ? formatFuerza(p) : 'Sin sesiones. Snap Fitness no sincroniza con Apple Health — ingreso manual requerido.'}

## REPORTE COMPLETO DEL NOTEBOOK (Simón)
${ctx.reporteCompleto}

## REGLAS DE CONDUCTA
- Responde SIEMPRE en español
- Sé conciso — Lobsang lee desde iPhone, máximo 4-5 párrafos
- HRV 🔴 ROJO = descanso, sin negociación
- Cita datos específicos cuando das recomendaciones
- NUNCA inventes métricas. Si dice "pendiente", invita a completar el dato
- Termina el primer mensaje del día preguntando cómo se siente Lobsang
- Los domingos, ofrece proactivamente ajustar el plan semanal`;
}
