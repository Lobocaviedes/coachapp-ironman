import Anthropic from '@anthropic-ai/sdk';
import { buildCarlosSystemPrompt, loadDailyContext } from '@/lib/data-loader';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    const { message, history = [] }: { message: string; history: Message[] } =
      await request.json();

    const ctx = loadDailyContext();
    const systemPrompt = buildCarlosSystemPrompt(ctx);

    // Construir historial + nuevo mensaje
    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Streaming response
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('[/api/chat]', err);
    return Response.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
