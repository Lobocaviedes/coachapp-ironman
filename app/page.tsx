'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DailyMetrics {
  vo2: number;
  hrv7d: number;
  semaforoHrv: string;
  rhr7d: number;
  faseName: string;
  brechas: { natacion: string; ciclismo: string; running: string };
  fecha: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [isSunday] = useState(new Date().getDay() === 0);
  const [weeklyPlan, setWeeklyPlan] = useState('');
  const [showWeekly, setShowWeekly] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDailySummary();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadDailySummary() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/summary');
      const data = await res.json();
      if (data.summary) {
        setMessages([{ role: 'assistant', content: data.summary }]);
        setMetrics(data.metrics);
      }
    } catch {
      setMessages([{
        role: 'assistant',
        content: '¡Buenos días! Soy Carlos, tu Head Coach. Hubo un problema cargando los datos del día, pero estoy aquí. ¿En qué te puedo ayudar?'
      }]);
    }
    setIsLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');

    const newHistory = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newHistory);
    setIsLoading(true);
    setMessages([...newHistory, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages.slice(-10) }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setMessages([...newHistory, { role: 'assistant', content: fullText }]);
        }
      }
    } catch {
      setMessages([...newHistory, {
        role: 'assistant',
        content: 'Error de conexión. Revisa tu internet e intenta de nuevo.'
      }]);
    }
    setIsLoading(false);
  }

  async function requestWeeklyPlan() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/weekly', { method: 'POST' });
      const data = await res.json();
      if (data.weeklyPlan) {
        setWeeklyPlan(data.weeklyPlan);
        setShowWeekly(true);
      }
    } catch {
      alert('Error generando el plan semanal.');
    }
    setIsLoading(false);
  }

  const semaforoColor = metrics?.semaforoHrv?.includes('VERDE')
    ? 'bg-green-500'
    : metrics?.semaforoHrv?.includes('ROJO')
    ? 'bg-red-500'
    : 'bg-yellow-500';

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white max-w-lg mx-auto">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold flex-shrink-0">C</div>
        <div className="flex-1">
          <div className="font-semibold text-sm">Carlos Ospina</div>
          <div className="text-xs text-slate-400">Head Coach · Ironman 70.3</div>
        </div>
        <button onClick={() => setShowMetrics(!showMetrics)} className="text-xs bg-slate-700 px-3 py-1.5 rounded-full hover:bg-slate-600 transition">
          📊 Métricas
        </button>
      </div>

      {showMetrics && metrics && (
        <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-700 rounded-lg p-2">
            <div className="text-slate-400">VO2 Max</div>
            <div className="font-bold text-blue-400 text-base">{metrics.vo2}</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-2">
            <div className="text-slate-400">HRV 7d</div>
            <div className="font-bold text-base flex items-center justify-center gap-1">
              <span className={`w-2 h-2 rounded-full ${semaforoColor}`}></span>
              {metrics.hrv7d}
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-2">
            <div className="text-slate-400">RHR 7d</div>
            <div className="font-bold text-base">{metrics.rhr7d}</div>
          </div>
          <div className="col-span-3 bg-slate-700 rounded-lg p-2 text-left">
            <div className="text-slate-400 mb-1">Brechas Ironman 70.3</div>
            <div>🏊 {metrics.brechas.natacion}</div>
            <div>🚴 {metrics.brechas.ciclismo}</div>
            <div>🏃 {metrics.brechas.running}</div>
          </div>
          <div className="col-span-3 text-slate-500 text-center">
            Fase: <span className="text-blue-400 font-semibold">{metrics.faseName}</span>
          </div>
        </div>
      )}

      {showWeekly && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <span className="font-semibold">📅 Plan Semana Próxima</span>
              <button onClick={() => setShowWeekly(false)} className="text-slate-400 text-xl">✕</button>
            </div>
            <div className="overflow-y-auto p-4 text-sm whitespace-pre-wrap text-slate-200">{weeklyPlan}</div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 flex-shrink-0">C</div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-700 text-slate-100 rounded-bl-sm'
            }`}>
              {msg.content || <span className="animate-pulse text-slate-400">●●●</span>}
            </div>
          </div>
        ))}
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center text-slate-500 text-sm pt-10">Cargando análisis del día...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {isSunday && (
        <div className="px-4 pb-2">
          <button onClick={requestWeeklyPlan} disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition">
            📅 Ajustar plan para la próxima semana
          </button>
        </div>
      )}

      <div className="px-4 pb-6 pt-2 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Escríbele a Carlos..."
            rows={1}
            className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()}
            className="w-11 h-11 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-full flex items-center justify-center flex-shrink-0 transition">
            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
