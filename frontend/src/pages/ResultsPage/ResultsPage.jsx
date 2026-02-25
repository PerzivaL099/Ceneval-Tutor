import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultsPage.css';

const AREA_LABELS = {
    calif_software: 'Ingeniería de Software',
    calif_redes: 'Redes',
    calif_bd: 'Bases de Datos',
    calif_matematicas: 'Matemáticas',
    calif_logica: 'Lógica y Algoritmos',
};

const AREA_ORDER = ['calif_software', 'calif_redes', 'calif_bd', 'calif_matematicas', 'calif_logica'];

function getBarColor(score) {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--accent-primary)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-danger)';
}

function getStatusInfo(score) {
    if (score >= 80) return { label: 'Dominado', color: 'var(--color-success)', icon: '🟢' };
    if (score >= 60) return { label: 'Avanzado', color: 'var(--accent-primary)', icon: '🔵' };
    if (score >= 40) return { label: 'En progreso', color: 'var(--color-warning)', icon: '🟡' };
    return { label: 'Crítico', color: 'var(--color-danger)', icon: '🔴' };
}

// Probability gauge (large version)
function ResultGauge({ probability, prediccion }) {
    const radius = 100;
    const stroke = 12;
    const circumference = 2 * Math.PI * radius;
    const progress = (probability / 100) * circumference;
    const dashoffset = circumference - progress;
    const isApproved = prediccion === 'Aprobado';

    return (
        <div className="result-gauge-container">
            <svg className="result-gauge-svg" viewBox="0 0 240 240">
                <circle
                    cx="120" cy="120" r={radius}
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth={stroke}
                />
                <circle
                    cx="120" cy="120" r={radius}
                    fill="none"
                    stroke={isApproved ? 'url(#resultGradientGreen)' : 'url(#resultGradientRed)'}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    className="result-gauge-progress"
                    transform="rotate(-90 120 120)"
                />
                <defs>
                    <linearGradient id="resultGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="resultGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="result-gauge-text">
                <span className="result-gauge-value" style={{ color: isApproved ? 'var(--accent-primary)' : 'var(--color-danger)' }}>
                    {probability}%
                </span>
                <span className="result-gauge-label">PROBABILIDAD</span>
            </div>
        </div>
    );
}

export default function ResultsPage() {
    const navigate = useNavigate();
    const [result, setResult] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('lastDiagnosticResult');
        if (stored) {
            try {
                setResult(JSON.parse(stored));
            } catch { /* ignore */ }
        }
    }, []);

    if (!result) {
        return (
            <div className="results-empty animate-fade-in">
                <div className="card results-empty-card">
                    <div className="results-empty-icon">📊</div>
                    <h2>Sin resultados</h2>
                    <p>Aún no has realizado ningún examen diagnóstico.</p>
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate('/exam')}
                        id="btn-go-exam"
                    >
                        Realizar Examen →
                    </button>
                </div>
            </div>
        );
    }

    const { probabilidad_aprobar, prediccion, mensaje, areaScores, diagnosticData } = result;
    const isApproved = prediccion === 'Aprobado';

    // Find strongest and weakest areas
    let strongest = { key: '', score: -1 };
    let weakest = { key: '', score: 101 };
    for (const key of AREA_ORDER) {
        const score = areaScores?.[key] ?? 0;
        if (score > strongest.score) strongest = { key, score };
        if (score < weakest.score) weakest = { key, score };
    }

    return (
        <div className="results-page animate-fade-in">
            {/* Hero Result */}
            <div className="results-hero">
                <div className={`card results-hero-card ${isApproved ? 'approved' : 'failed'}`}>
                    <div className="results-hero-content">
                        <ResultGauge probability={probabilidad_aprobar} prediccion={prediccion} />
                        <div className="results-hero-info">
                            <div className={`results-prediction-badge ${isApproved ? 'badge-success' : 'badge-danger'}`}>
                                {isApproved ? '✅ ' : '⚠️ '}{prediccion}
                            </div>
                            <h1 className="results-title">
                                {isApproved
                                    ? '¡Excelente Desempeño!'
                                    : 'Áreas de Oportunidad Detectadas'}
                            </h1>
                            <p className="results-message">{mensaje}</p>
                            <div className="results-hero-actions">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/dashboard')}
                                    id="btn-go-dashboard"
                                >
                                    Ver Dashboard →
                                </button>
                                <button
                                    className="btn btn-secondary btn-lg"
                                    onClick={() => navigate('/exam')}
                                    id="btn-retry-exam"
                                >
                                    Repetir Examen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="results-details">
                {/* Area Scores */}
                <div className="card results-areas-card animate-fade-in delay-1">
                    <h3 className="card-title">
                        <span className="card-title-icon">◉</span>
                        Desglose por Área
                    </h3>
                    <div className="results-areas-list">
                        {AREA_ORDER.map((key) => {
                            const score = areaScores?.[key] ?? 0;
                            const status = getStatusInfo(score);
                            return (
                                <div className="result-area-item" key={key}>
                                    <div className="result-area-header">
                                        <div className="result-area-left">
                                            <span>{status.icon}</span>
                                            <span className="result-area-name">{AREA_LABELS[key]}</span>
                                        </div>
                                        <div className="result-area-right">
                                            <span className="result-area-score" style={{ color: status.color }}>
                                                {score}%
                                            </span>
                                            <span className="result-area-status" style={{ color: status.color }}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="progress-bar-track">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${score}%`,
                                                background: `linear-gradient(90deg, ${getBarColor(score)}, ${getBarColor(score)}88)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Behavioral Metrics */}
                <div className="card results-metrics-card animate-fade-in delay-2">
                    <h3 className="card-title">
                        <span className="card-title-icon">📊</span>
                        Métricas de Comportamiento
                    </h3>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-icon">⏱️</div>
                            <div className="metric-value">{diagnosticData?.tiempo_promedio?.toFixed(1)}s</div>
                            <div className="metric-label">Tiempo promedio / pregunta</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-icon">⏭️</div>
                            <div className="metric-value">{diagnosticData?.preguntas_omitidas}</div>
                            <div className="metric-label">Preguntas omitidas</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-icon">🔄</div>
                            <div className="metric-value">{diagnosticData?.cambios_respuesta}</div>
                            <div className="metric-label">Cambios de respuesta</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-icon">🔥</div>
                            <div className="metric-value">{diagnosticData?.racha_aciertos}</div>
                            <div className="metric-label">Racha máxima de aciertos</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-icon">🎓</div>
                            <div className="metric-value">{diagnosticData?.semestre_actual}°</div>
                            <div className="metric-label">Semestre actual</div>
                        </div>
                    </div>
                </div>

                {/* AI Insight */}
                <div className="card results-insight-card animate-fade-in delay-3">
                    <h3 className="card-title">
                        <span className="card-title-icon">*</span>
                        Insights de la IA
                    </h3>
                    <div className="insight-content">
                        <div className="insight-item">
                            <strong>Área más fuerte:</strong>
                            <span style={{ color: 'var(--color-success)' }}>
                                {AREA_LABELS[strongest.key]} ({strongest.score}%)
                            </span>
                        </div>
                        <div className="insight-item">
                            <strong>Área a reforzar:</strong>
                            <span style={{ color: 'var(--color-danger)' }}>
                                {AREA_LABELS[weakest.key]} ({weakest.score}%)
                            </span>
                        </div>
                        <div className="insight-recommendation">
                            <p>
                                <strong>Recomendación:</strong>{' '}
                                {isApproved
                                    ? `Mantén tu nivel en ${AREA_LABELS[strongest.key]} y dedica sesiones de estudio adicionales a ${AREA_LABELS[weakest.key]} para asegurar un resultado sobresaliente.`
                                    : `Enfócate prioritariamente en ${AREA_LABELS[weakest.key]}. Te recomendamos al menos 2 horas diarias de estudio en esta área durante las próximas semanas.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
