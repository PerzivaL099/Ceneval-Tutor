import { useState, useRef, useEffect } from 'react';
import './TutorChatPage.css';

const AREAS = [
    { id: 0, nombre: 'Algoritmia y Estructuras de Datos', icon: '⚙️', color: '#10b981' },
    { id: 1, nombre: 'Arquitectura de Computadoras', icon: '🖥️', color: '#3b82f6' },
    { id: 2, nombre: 'Ing. Software, BD y Ciberseguridad', icon: '🛡️', color: '#f59e0b' },
    { id: 3, nombre: 'Cómputo Inteligente y Dist.', icon: '🧠', color: '#a78bfa' },
];

function AreaBadge({ areaId, confianza, onOverride, overrideActive }) {
    const [open, setOpen] = useState(false);
    const area = areaId !== null && areaId !== undefined ? AREAS[areaId] : null;

    return (
        <div className="area-badge-container">
            {area ? (
                <div className="area-badge" style={{ '--area-color': area.color }}>
                    <span className="area-badge-icon">{area.icon}</span>
                    <span className="area-badge-name">{area.nombre}</span>
                    {confianza !== null && (
                        <span className="area-badge-conf">{confianza}%</span>
                    )}
                    {overrideActive && (
                        <span className="area-badge-override">corregido</span>
                    )}
                    <button
                        className="area-badge-edit"
                        onClick={() => setOpen(!open)}
                        title="Corregir área"
                    >
                        ✏️
                    </button>
                </div>
            ) : (
                <div className="area-badge area-badge-empty">
                    <span className="area-badge-name">Área no detectada</span>
                    <button
                        className="area-badge-edit"
                        onClick={() => setOpen(!open)}
                        title="Seleccionar área"
                    >
                        ✏️
                    </button>
                </div>
            )}

            {open && (
                <div className="area-dropdown">
                    <p className="area-dropdown-title">Corregir área temática</p>
                    {AREAS.map((a) => (
                        <button
                            key={a.id}
                            className={`area-dropdown-item ${areaId === a.id ? 'active' : ''}`}
                            style={{ '--area-color': a.color }}
                            onClick={() => { onOverride(a.id); setOpen(false); }}
                        >
                            <span>{a.icon}</span>
                            <span>{a.nombre}</span>
                        </button>
                    ))}
                    <button
                        className="area-dropdown-item area-dropdown-reset"
                        onClick={() => { onOverride(null); setOpen(false); }}
                    >
                        <span>🔄</span>
                        <span>Dejar que BERT-CNN decida</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="message message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble typing-bubble">
                <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
        </div>
    );
}

function ChatMessage({ msg }) {
    const isUser = msg.role === 'user';
    return (
        <div className={`message ${isUser ? 'message-user' : 'message-assistant'} animate-fade-in`}>
            {!isUser && <div className="message-avatar">🤖</div>}
            <div className="message-bubble">
                {!isUser && msg.area !== undefined && msg.area !== null && (
                    <div className="message-area-tag" style={{ '--area-color': AREAS[msg.area]?.color }}>
                        {AREAS[msg.area]?.icon} {AREAS[msg.area]?.nombre}
                        {msg.confianza && <span className="message-area-conf">{msg.confianza}%</span>}
                    </div>
                )}
                <p className="message-text">{msg.content}</p>
                <span className="message-time">
                    {new Date(msg.ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            {isUser && <div className="message-avatar message-avatar-user">👤</div>}
        </div>
    );
}

export default function TutorChatPage() {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '¡Hola! Soy tu Tutor IA para el EGEL-C. Hazme cualquier pregunta sobre los temas del examen y te ayudaré a entenderlos. BERT-CNN detectará automáticamente el área, pero puedes corregirla si es necesario.',
            area: null,
            confianza: null,
            ts: Date.now(),
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [areaOverride, setAreaOverride] = useState(null);
    const [lastArea, setLastArea] = useState(null);
    const [lastConfianza, setLastConfianza] = useState(null);
    const [error, setError] = useState(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const token = localStorage.getItem('access_token');

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    async function sendMessage() {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: 'user', content: text, ts: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setError(null);

        // Build historial (exclude the welcome message)
        const historial = messages
            .filter(m => m.role === 'user' || (m.role === 'assistant' && m.area !== undefined))
            .map(m => ({ role: m.role, content: m.content }));

        try {
            const res = await fetch('http://localhost:8000/tutor/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pregunta: text,
                    area_override: areaOverride,
                    historial,
                }),
            });

            if (!res.ok) throw new Error(`Error ${res.status}`);

            // Read stream
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';
            let detectedArea = null;
            let detectedConfianza = null;

            // Add empty assistant message to fill with streaming
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '',
                area: null,
                confianza: null,
                ts: Date.now(),
                streaming: true,
            }]);
            setLoading(false);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(l => l.trim());

                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);

                        // Capture metadata from first chunk
                        if (parsed.area !== undefined && detectedArea === null) {
                            detectedArea = parsed.area;
                            detectedConfianza = parsed.confianza_pct ?? null;
                            setLastArea(detectedArea);
                            setLastConfianza(detectedConfianza);
                        }

                        if (parsed.message?.content) {
                            assistantContent += parsed.message.content;
                            setMessages(prev => {
                                const updated = [...prev];
                                updated[updated.length - 1] = {
                                    ...updated[updated.length - 1],
                                    content: assistantContent,
                                    area: detectedArea,
                                    confianza: detectedConfianza,
                                };
                                return updated;
                            });
                        }
                    } catch {
                        // Non-JSON line, skip
                    }
                }
            }

            // Mark streaming done
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    streaming: false,
                };
                return updated;
            });

        } catch (err) {
            setLoading(false);
            setError('No se pudo conectar con el Tutor IA. Verifica que Ollama esté corriendo en localhost:11434.');
            setMessages(prev => prev.filter(m => !m.streaming));
        }

        inputRef.current?.focus();
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    function clearChat() {
        setMessages([{
            role: 'assistant',
            content: '¡Hola! Soy tu Tutor IA para el EGEL-C. Hazme cualquier pregunta sobre los temas del examen.',
            area: null,
            confianza: null,
            ts: Date.now(),
        }]);
        setLastArea(null);
        setLastConfianza(null);
        setAreaOverride(null);
        setError(null);
    }

    return (
        <div className="tutor-page">
            {/* Header */}
            <div className="tutor-header">
                <div className="tutor-header-left">
                    <div className="tutor-header-icon">🤖</div>
                    <div>
                        <h1 className="tutor-title">Tutor IA</h1>
                        <p className="tutor-subtitle">llama3.1:8b · EGEL-C · Powered by Ollama</p>
                    </div>
                </div>
                <div className="tutor-header-right">
                    <AreaBadge
                        areaId={areaOverride ?? lastArea}
                        confianza={areaOverride !== null ? null : lastConfianza}
                        onOverride={setAreaOverride}
                        overrideActive={areaOverride !== null}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={clearChat} title="Limpiar chat">
                        🗑️ Limpiar
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="tutor-messages">
                {messages.map((msg, i) => (
                    <ChatMessage key={i} msg={msg} />
                ))}
                {loading && <TypingIndicator />}
                {error && (
                    <div className="tutor-error animate-fade-in">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="tutor-input-area">
                {areaOverride !== null && (
                    <div className="tutor-override-notice">
                        <span>📌 Enviando como: <strong>{AREAS[areaOverride]?.nombre}</strong></span>
                        <button className="tutor-override-clear" onClick={() => setAreaOverride(null)}>× quitar</button>
                    </div>
                )}
                <div className="tutor-input-row">
                    <textarea
                        ref={inputRef}
                        className="tutor-textarea"
                        placeholder="Pregunta algo sobre el EGEL-C... (Enter para enviar)"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        rows={1}
                    />
                    <button
                        className="btn btn-primary tutor-send-btn"
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? <span className="spinner" /> : '↑'}
                    </button>
                </div>
                <p className="tutor-hint">
                    BERT-CNN detecta el área automáticamente · usa ✏️ para corregirla
                </p>
            </div>
        </div>
    );
}