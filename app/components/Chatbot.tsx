import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { X, MessageSquare, Send, Bot, ChevronDown, RefreshCw } from 'lucide-react';
import {
  type ChatFieldKey,
  type ChatLeadData,
  appendChatMessage,
  clearStoredChatSessionId,
  countCompletedFields,
  ensureChatSession,
  getStoredChatSessionId,
  updateChatSession,
} from '../lib/crm';
import { trackBehaviorEvent } from '../lib/tracking';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  kind?: 'question' | 'answer' | 'faq' | 'system';
  stepKey?: string;
}

interface ChatState {
  messages: Message[];
  leadData: Partial<ChatLeadData>;
  currentStepIndex: number;
  sessionId: string | null;
  isComplete: boolean;
}

interface FlowStep {
  key: ChatFieldKey;
  placeholder: string;
  question: (leadData: Partial<ChatLeadData>) => string;
  validate?: (value: string) => string | null;
  normalize?: (value: string) => string;
}

const CHATBOT_STATE_STORAGE_KEY = 'layercloud_chatbot_state_v5';
const SKIP_PATTERN = /^(paso|skip|prefiero no compartir|prefiero no decirlo|n\/a|na|sin definir)$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+\s()\-]{6,}$/;

const FLOW: FlowStep[] = [
  {
    key: 'name',
    placeholder: 'Tu nombre',
    question: () => 'Voy a hacerte unas preguntas cortas para entender tu operacion. Empezamos: cual es tu nombre?',
  },
  {
    key: 'company',
    placeholder: 'Empresa o marca',
    question: () => 'Como se llama la empresa o marca?',
  },
  {
    key: 'role',
    placeholder: 'Tu rol',
    question: () => 'Cual es tu rol dentro de la operacion?',
  },
  {
    key: 'email',
    placeholder: 'mail@empresa.com',
    question: () => 'Cual es tu email de trabajo?',
    validate: (value) =>
      EMAIL_PATTERN.test(value)
        ? null
        : 'Necesito un email valido para seguir. Ejemplo: nombre@empresa.com',
    normalize: (value) => value.toLowerCase(),
  },
  {
    key: 'phone',
    placeholder: 'WhatsApp o telefono',
    question: () => 'Dejame un WhatsApp o telefono. Si preferis, escribi "paso".',
    validate: (value) =>
      value === 'Prefiere no compartir' || PHONE_PATTERN.test(value)
        ? null
        : 'Pasame un telefono valido o escribi "paso".',
  },
  {
    key: 'location',
    placeholder: 'Ciudad, pais o region',
    question: () => 'En que ciudad, pais o region operan hoy?',
  },
  {
    key: 'industry',
    placeholder: 'Industria',
    question: () => 'En que industria compiten?',
  },
  {
    key: 'website',
    placeholder: 'Web, ecommerce o red principal',
    question: () => 'Compartime su web, ecommerce, marketplace o red principal.',
  },
  {
    key: 'monthlyOrders',
    placeholder: 'Volumen mensual',
    question: () => 'Que volumen mensual manejan hoy, aunque sea aproximado?',
  },
  {
    key: 'teamSize',
    placeholder: 'Cantidad de personas',
    question: () => 'Cuantas personas participan en ventas u operacion?',
  },
  {
    key: 'currentTools',
    placeholder: 'ERP, Excel, WhatsApp, CRM...',
    question: () => 'Que herramientas usan hoy para ventas, stock, precios y clientes?',
  },
  {
    key: 'salesChannels',
    placeholder: 'Canales principales',
    question: () => 'Que canales sostienen la mayor parte de la facturacion?',
  },
  {
    key: 'topPain',
    placeholder: 'Friccion principal',
    question: () => 'Cual es la principal friccion que quieren resolver?',
  },
  {
    key: 'urgency',
    placeholder: 'Horizonte',
    question: () => 'Con que horizonte quieren resolverlo?',
  },
  {
    key: 'budget',
    placeholder: 'Rango de inversion',
    question: () => 'Tienen presupuesto definido o un rango de inversion?',
  },
  {
    key: 'extraContext',
    placeholder: 'Contexto adicional',
    question: () => 'Ultima: hay algun contexto clave que deba conocer?',
  },
];

const FAQ_RESPONSES = [
  {
    pattern: /(precio|precios|cuanto sale|cuanto cuesta|costo|valor)/i,
    answer: 'El alcance define la inversion. Si me das contexto, te orientamos con mas precision.',
  },
  {
    pattern: /(que hace|que hacen|que ofrecen|como funciona|erp|automatiza)/i,
    answer: 'Disenamos sistemas para unificar operacion, ventas, datos y capa digital en una misma arquitectura.',
  },
  {
    pattern: /(seo|ssl|e-?commerce|tienda online|web)/i,
    answer: 'Tambien construimos ecommerce y sitios de alto rendimiento con SEO tecnico, seguridad y foco en conversion.',
  },
  {
    pattern: /(integracion|mercado libre|whatsapp|tiendanube|excel|sistema actual)/i,
    answer: 'Integramos la operacion para reducir herramientas dispersas y mejorar control.',
  },
  {
    pattern: /(implementacion|soporte|demora|tiempo)/i,
    answer: 'Buscamos implementaciones claras, con priorizacion y el menor ruido operativo posible.',
  },
];

function sanitizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function buildInitialState(): ChatState {
  return {
    messages: [
      {
        role: 'assistant',
        content: FLOW[0].question({}),
        kind: 'question',
        stepKey: FLOW[0].key,
      },
    ],
    leadData: {},
    currentStepIndex: 0,
    sessionId: getStoredChatSessionId(),
    isComplete: false,
  };
}

function loadStoredState(): ChatState {
  if (typeof window === 'undefined') {
    return buildInitialState();
  }

  try {
    const rawState = window.localStorage.getItem(CHATBOT_STATE_STORAGE_KEY);
    if (!rawState) {
      return buildInitialState();
    }

    const parsed = JSON.parse(rawState) as ChatState;
    if (!parsed.messages?.length) {
      return buildInitialState();
    }

    return {
      messages: parsed.messages,
      leadData: parsed.leadData ?? {},
      currentStepIndex: parsed.currentStepIndex ?? 0,
      sessionId: parsed.sessionId ?? getStoredChatSessionId(),
      isComplete: Boolean(parsed.isComplete),
    };
  } catch {
    return buildInitialState();
  }
}

function getFaqReply(value: string) {
  const normalized = value.toLowerCase();
  const looksLikeQuestion =
    normalized.includes('?') ||
      /^(precio|cuanto|como|que|sirve|hacen|hace|funciona|integran|seo|ssl|soporte)/i.test(
      normalized,
    );

  if (!looksLikeQuestion) {
    return null;
  }

  return FAQ_RESPONSES.find((item) => item.pattern.test(value))?.answer ?? null;
}

function normalizeAnswer(step: FlowStep, value: string) {
  const cleaned = sanitizeText(value);
  if (SKIP_PATTERN.test(cleaned)) {
    return 'Prefiere no compartir';
  }

  return step.normalize ? step.normalize(cleaned) : cleaned;
}

function buildFinalReply(leadData: Partial<ChatLeadData>) {
  const name = leadData.name ? `, ${leadData.name}` : '';
  return `Listo${name}. Ya tengo un buen mapa inicial. Si queres sumar contexto, escribilo.`;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>(() => loadStoredState());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousIsOpenRef = useRef(false);

  const { messages, leadData, currentStepIndex, sessionId, isComplete } = chatState;
  const currentStep = FLOW[currentStepIndex];
  const completedFields = countCompletedFields(leadData);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CHATBOT_STATE_STORAGE_KEY, JSON.stringify(chatState));
  }, [chatState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isOpen) {
      timeoutId = window.setTimeout(() => inputRef.current?.focus(), 300);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isOpen]);

  // Allows any component to open the chatbot via:
  // window.dispatchEvent(new CustomEvent('layercloud:open-chat'))
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('layercloud:open-chat', handler);
    return () => window.removeEventListener('layercloud:open-chat', handler);
  }, []);

  useEffect(() => {
    if (isOpen && !previousIsOpenRef.current) {
      void trackBehaviorEvent({
        eventName: 'chat_open',
        payload: {
          completedFields,
          hasSession: Boolean(sessionId),
        },
      }).catch(() => undefined);
    }

    if (!isOpen && previousIsOpenRef.current && !isComplete && completedFields > 0) {
      void trackBehaviorEvent({
        eventName: 'chat_dropoff',
        payload: {
          completedFields,
          currentStep: currentStep?.key || 'completed',
        },
      }).catch(() => undefined);
    }

    previousIsOpenRef.current = isOpen;
  }, [completedFields, currentStep?.key, isComplete, isOpen, sessionId]);

  const resetConversation = () => {
    if (!isComplete && completedFields > 0) {
      void trackBehaviorEvent({
        eventName: 'chat_dropoff',
        payload: {
          completedFields,
          currentStep: currentStep?.key || 'completed',
          reason: 'manual_reset',
        },
      }).catch(() => undefined);
    }

    clearStoredChatSessionId();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(CHATBOT_STATE_STORAGE_KEY);
    }

    setInput('');
    setChatState(buildInitialState());
  };

  const sendMessage = async () => {
    const rawValue = sanitizeText(input);
    if (!rawValue || isLoading) return;

    const activeStep = currentStep;
    const activeSessionId = sessionId;
    const existingMessages = messages;
    const existingLeadData = leadData;
    const existingStepIndex = currentStepIndex;
    const existingCompleteState = isComplete;

    const userMessage: Message = {
      role: 'user',
      content: rawValue,
      kind: 'answer',
      stepKey: activeStep?.key,
    };

    let nextLeadData = existingLeadData;
    let nextStepIndex = existingStepIndex;
    let nextCompleteState = existingCompleteState;
    let sessionStepKey: string | null | undefined = activeStep?.key ?? null;
    let assistantMessage: Message;
    let shouldTrackCompletedStep = false;
    let shouldTrackCompletion = false;
    let eventStepKey = activeStep?.key ?? 'completed';

    if (existingCompleteState) {
      const mergedContext = existingLeadData.extraContext
        ? `${existingLeadData.extraContext} | ${rawValue}`
        : rawValue;

      nextLeadData = {
        ...existingLeadData,
        extraContext: mergedContext,
      };
      sessionStepKey = 'completed';
      assistantMessage = {
        role: 'assistant',
        content: 'Anotado. Si queres reiniciar el diagnostico, podes hacerlo desde aca.',
        kind: 'system',
        stepKey: 'completed',
      };
    } else {
      const faqReply = getFaqReply(rawValue);

      if (faqReply && activeStep) {
        assistantMessage = {
          role: 'assistant',
          content: `${faqReply} ${activeStep.question(existingLeadData)}`,
          kind: 'faq',
          stepKey: activeStep.key,
        };
      } else if (activeStep) {
        const normalized = normalizeAnswer(activeStep, rawValue);
        const validationError = activeStep.validate?.(normalized);

        if (validationError) {
          assistantMessage = {
            role: 'assistant',
            content: validationError,
            kind: 'system',
            stepKey: activeStep.key,
          };
        } else {
          nextLeadData = {
            ...existingLeadData,
            [activeStep.key]: normalized,
          };
          nextStepIndex = existingStepIndex + 1;
          nextCompleteState = nextStepIndex >= FLOW.length;
          sessionStepKey = nextCompleteState ? 'completed' : FLOW[nextStepIndex].key;
          shouldTrackCompletedStep = true;
          shouldTrackCompletion = nextCompleteState;
          eventStepKey = activeStep.key;

          assistantMessage = {
            role: 'assistant',
            content: nextCompleteState
              ? buildFinalReply(nextLeadData)
              : FLOW[nextStepIndex].question(nextLeadData),
            kind: nextCompleteState ? 'system' : 'question',
            stepKey: sessionStepKey ?? undefined,
          };
        }
      } else {
        assistantMessage = {
          role: 'assistant',
          content: 'Ya cerramos el diagnostico. Si queres sumar algo, mandalo. Si no, reinicialo.',
          kind: 'system',
          stepKey: 'completed',
        };
      }
    }

    setInput('');
    setIsLoading(true);

    const updatedMessages = [...existingMessages, userMessage, assistantMessage];
    setChatState((prev) => ({
      ...prev,
      messages: updatedMessages,
      leadData: nextLeadData,
      currentStepIndex: nextStepIndex,
      isComplete: nextCompleteState,
    }));

    try {
      if (!activeSessionId) {
        void trackBehaviorEvent({
          eventName: 'chat_start',
          payload: {
            firstStep: activeStep?.key || 'name',
          },
        }).catch(() => undefined);
      }

      const persistedSessionId = await ensureChatSession(activeSessionId, nextLeadData, {
        currentStepKey: sessionStepKey,
        currentStepIndex: nextStepIndex,
        status: nextCompleteState ? 'completed' : undefined,
      });

      if (!activeSessionId) {
        await appendChatMessage(persistedSessionId, {
          role: 'assistant',
          content: existingMessages[0]?.content ?? FLOW[0].question({}),
          kind: 'question',
          stepKey: FLOW[0].key,
        });
      }

      await appendChatMessage(persistedSessionId, {
        role: 'user',
        content: rawValue,
        kind: userMessage.kind,
        stepKey: userMessage.stepKey,
      });

      await appendChatMessage(persistedSessionId, {
        role: 'assistant',
        content: assistantMessage.content,
        kind: assistantMessage.kind,
        stepKey: assistantMessage.stepKey,
      });

      await updateChatSession(persistedSessionId, nextLeadData, {
        currentStepKey: sessionStepKey,
        currentStepIndex: nextStepIndex,
        status: nextCompleteState ? 'completed' : undefined,
      });

      setChatState((prev) => ({
        ...prev,
        sessionId: persistedSessionId,
      }));

      if (shouldTrackCompletedStep) {
        void trackBehaviorEvent({
          eventName: 'chat_step_completed',
          payload: {
            stepKey: eventStepKey,
            completedFields: countCompletedFields(nextLeadData),
          },
        }).catch(() => undefined);
      }

      if (shouldTrackCompletion) {
        void trackBehaviorEvent({
          eventName: 'chat_completed',
          payload: {
            completedFields: countCompletedFields(nextLeadData),
            sessionId: persistedSessionId,
          },
        }).catch(() => undefined);
      }
    } catch (error) {
      console.warn('[MotorCloud CRM]', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <>
      {/* ── Responsive overrides para el panel ── */}
      <style>{`
        .lc-chat-panel {
          position: fixed;
          bottom: 88px;
          right: 24px;
          width: 380px;
          max-height: 540px;
          z-index: 1000;
        }
        .lc-chat-toggle {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1001;
        }
        @media (max-width: 480px) {
          .lc-chat-panel {
            width: calc(100vw - 16px);
            right: 8px;
            bottom: 76px;
            max-height: calc(100svh - 140px);
          }
          .lc-chat-toggle {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>

      {/* ── Panel del chat ── */}
      <div
        className="lc-chat-panel"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.09)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'opacity 0.25s, transform 0.25s',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
          pointerEvents: isOpen ? 'auto' : 'none',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: 'rgba(255,59,0,0.15)',
                border: '1px solid rgba(255,59,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={16} color="#FF3B00" />
            </div>
            <div>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: '#FFFFFF',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}
              >
                Diagnóstico MotorCloud
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: '#FF3B00',
                    display: 'inline-block',
                    animation: 'blink 1.4s infinite',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {completedFields}/{FLOW.length} campos
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button
              onClick={resetConversation}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
              aria-label="Reiniciar conversación"
              title="Reiniciar"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.35)',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
              aria-label="Cerrar"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Sub-header */}
        <div
          style={{
            padding: '8px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          Diagnóstico gratuito · 5 minutos
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '86%',
                  padding: '10px 14px',
                  background:
                    message.role === 'user'
                      ? '#FF3B00'
                      : 'rgba(255,255,255,0.06)',
                  border: message.role === 'user'
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.08)',
                  /* Texto siempre legible sobre fondo dark */
                  color: message.role === 'user'
                    ? '#FFFFFF'
                    : 'rgba(255,255,255,0.82)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: message.role === 'user' ? 500 : 300,
                  lineHeight: 1.58,
                }}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              style={{
                display: 'flex',
                gap: '4px',
                padding: '10px 14px',
                width: 'fit-content',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {[0, 1, 2].map((value) => (
                <span
                  key={value}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.4)',
                    display: 'inline-block',
                    animation: `blink 1s ${value * 0.18}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKey}
              placeholder={
                isComplete
                  ? 'Suma contexto si hace falta...'
                  : currentStep?.placeholder || 'Escribí tu respuesta...'
              }
              disabled={isLoading}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 14px',
                /* Color explícito — nunca heredar del tema claro */
                color: '#FFFFFF',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                outline: 'none',
                fontWeight: 300,
                minWidth: 0,
              }}
              onFocus={(event) => {
                event.target.style.borderColor = 'rgba(255,59,0,0.6)';
                event.target.style.background = 'rgba(255,255,255,0.07)';
              }}
              onBlur={(event) => {
                event.target.style.borderColor = 'rgba(255,255,255,0.1)';
                event.target.style.background = 'rgba(255,255,255,0.05)';
              }}
            />
            <button
              onClick={() => { void sendMessage(); }}
              disabled={!input.trim() || isLoading}
              style={{
                background: '#FF3B00',
                border: 'none',
                padding: '10px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: !input.trim() || isLoading ? 0.4 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <Send size={14} color="#FFFFFF" />
            </button>
          </div>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'rgba(255,255,255,0.22)',
              letterSpacing: '0.08em',
            }}
          >
            Si algo no aplica, escribí "paso".
          </p>
        </div>
      </div>

      {/* ── Botón toggle ── */}
      <button
        className="lc-chat-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Cerrar diagnóstico' : 'Abrir diagnóstico'}
        style={{
          width: 48,
          height: 48,
          background: isOpen ? '#222222' : '#0A0A0A',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: '2px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 4px 16px rgba(0,0,0,0.32)',
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform = 'translateY(-2px)';
          event.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform = 'translateY(0)';
          event.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.32)';
        }}
      >
        {isOpen ? (
          <X size={17} color="rgba(255,255,255,0.65)" />
        ) : (
          <MessageSquare size={17} color="rgba(255,255,255,0.8)" />
        )}
      </button>
    </>
  );
}
