import Anthropic from '@anthropic-ai/sdk';
import { buildCarlosSystemPrompt, loadDailyContext } from '@/lib/data-loader';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  const today = new Date();
  const isSunday = today.getDay() === 0;

  if (!isSunday && process.env.NODE_ENV === 'production') {
    return Response.json(
      { error: 'El ajuste semanal solo está disponible los domingos.' },
      { status: 403 }
    );
  }

  try {
    const ctx = loadDailyContext();
    const systemPrompt = buildCarlosSystemPrompt(ctx);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Es domingo. Basándote en el análisis de esta semana, genera el plan de entrenamiento ajustado para la próxima semana. 
          
          El plan debe incluir:
          1. Evaluación de la semana que termina (qué funcionó, qué no)
          2. Objetivos específicos para la próxima semana por disciplina
          3. Plan día a día (Lunes a Domingo) con tipo de sesión, duración estimada y zonas de intensidad
          4. Ajustes de nutrición si aplican
          5. Señales de alerta a monitorear
          
          Formato: estructurado, fácil de leer en el teléfono.`,
        },
      ],
    });

    const weeklyPlan =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return Response.json({
      weeklyPlan,
      generadoEl: today.toISOString(),
      semana: `Semana del ${getMonday(today)} al ${getSunday(today)}`,
    });
  } catch (err) {
    console.error('[/api/weekly]', err);
    return Response.json({ error: 'Error generando plan semanal' }, { status: 500 });
  }
}

function getMonday(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff + 7)).toLocaleDateString('es-CO');
}

function getSunday(d: Date) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(d.setDate(diff + 7)).toLocaleDateString('es-CO');
}
