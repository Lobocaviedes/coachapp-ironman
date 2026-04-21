import Anthropic from '@anthropic-ai/sdk';
import { buildCarlosSystemPrompt, loadDailyContext } from '@/lib/data-loader';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET() {
  try {
    const ctx = loadDailyContext();
    const systemPrompt = buildCarlosSystemPrompt(ctx);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content:
            'Genera el resumen diario de entrenamiento de hoy. Incluye: estado de recuperación (HRV/RHR), progreso en las 3 disciplinas vs el objetivo Ironman 70.3, recomendación para el entrenamiento de hoy, y una pregunta para saber cómo me siento.',
        },
      ],
    });

    const summary =
      response.content[0].type === 'text' ? response.content[0].text : '';

    return Response.json({
      summary,
      metrics: {
        vo2: ctx.vo2,
        hrv7d: ctx.hrv7d,
        semaforoHrv: ctx.semaforoHrv,
        rhr7d: ctx.rhr7d,
        faseName: ctx.faseName,
        brechas: ctx.brechas,
        fecha: ctx.fecha,
      },
    });
  } catch (err) {
    console.error('[/api/summary]', err);
    return Response.json({ error: 'Error generando resumen' }, { status: 500 });
  }
}
