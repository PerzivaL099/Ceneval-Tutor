import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './DashboardPage.css';

// Category mapping for display
const AREA_LABELS = {
    calif_software: 'Ingeniería de Software',
    calif_redes: 'Redes',
    calif_bd: 'Bases de Datos',
    calif_matematicas: 'Matemáticas',
    calif_logica: 'Lógica y Algoritmos',
};

const AREA_ORDER = ['calif_software', 'calif_redes', 'calif_bd', 'calif_matematicas', 'calif_logica'];

function getStatusLabel(score) {
    if (score >= 80) return { label: 'Dominado', color: 'var(--color-success)' };
    if (score >= 60) return { label: 'Avanzado', color: 'var(--accent-primary)' };
    if (score >= 40) return { label: 'En progreso', color: 'var(--color-warning)' };
    return { label: 'Crítico', color: 'var(--color-danger)' };
}

function getBarColor(score) {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--accent-primary)';
    if (score >= 40) return 'var(--color-warning)';
    return 'var(--color-danger)';
}

// SVG Circular gauge
function ProbabilityGauge({ probability }) {
    const radius = 80;
    const stroke = 10;
    const circumference = 2 * Math.PI * radius;
    const progress = (probability / 100) * circumference;
    const dashoffset = circumference - progress;

    return (
        <div className="gauge-container">
            <svg className="gauge-svg" viewBox="0 0 200 200">
                {/* Background circle */}
                <circle
                    cx="100" cy="100" r={radius}
                    fill="none"
                    stroke="var(--border-color)"
                    strokeWidth={stroke}
                />
                {/* Progress arc */}
                <circle
                    cx="100" cy="100" r={radius}
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    className="gauge-progress"
                    transform="rotate(-90 100 100)"
                />
                {/* Glow filter */}
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
            </svg>
            <div className="gauge-text">
                <span className="gauge-value">{probability}%</span>
                <span className="gauge-label">PROB. APROBACIÓN</span>
            </div>
        </div>
    );
}

// Heatmap grid (simulated activity)
function ActivityHeatmap() {
    const days = 35;
    const cells = Array.from({ length: days }, (_, i) => {
        // Simulate activity levels
        const level = Math.random();
        if (i > 28) return 0;
        if (level > 0.7) return 3;
        if (level > 0.4) return 2;
        if (level > 0.2) return 1;
        return 0;
    });

    return (
        <div className="heatmap">
            <div className="heatmap-grid">
                {cells.map((level, i) => (
                    <div
                        key={i}
                        className={`heatmap-cell level-${level}`}
                        title={`Actividad: nivel ${level}`}
                    />
                ))}
            </div>
            <div className="heatmap-legend">
                <span>MENOS</span>
                <div className="heatmap-cell level-0" />
                <div className="heatmap-cell level-1" />
                <div className="heatmap-cell level-2" />
                <div className="heatmap-cell level-3" />
                <span>MÁS</span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [lastResult, setLastResult] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('lastDiagnosticResult');
        if (stored) {
            try {
                setLastResult(JSON.parse(stored));
            } catch { /* ignore */ }
        }
    }, []);

    const userName = user?.email?.split('@')[0] || 'Estudiante';
    const hasResults = !!lastResult;

    const probability = hasResults ? lastResult.probabilidad_aprobar : 0;
    const areaScores = hasResults ? lastResult.areaScores : {};

    // Find weakest area
    let weakestArea = '';
    let weakestScore = 101;
    if (hasResults) {
        for (const key of AREA_ORDER) {
            if (areaScores[key] !== undefined && areaScores[key] < weakestScore) {
                weakestScore = areaScores[key];
                weakestArea = AREA_LABELS[key];
            }
        }
    }

    // Count areas above average
    const areasAboveAvg = hasResults
        ? AREA_ORDER.filter(k => (areaScores[k] || 0) >= 60).length
        : 0;

    // Concept tags (from question categories)
    const conceptTags = [
        'Algoritmos', 'SQL', 'Redes', 'Compiladores',
        'Scrum', 'POO', 'Docker', 'Probabilidad',
        'Grafos', 'ACID',
    ];

    return (
        <div className="dashboard">
            {/* Top Section — Hero row */}
            <div className="dashboard-hero">
                {/* Probability card */}
                <div className="card dashboard-prob-card animate-fade-in">
                    <div className="prob-card-content">
                        <ProbabilityGauge probability={probability} />
                        <div className="prob-card-info">
                            <h2 className="prob-greeting">
                                ¡Hola, <span className="accent">{userName}</span>!
                            </h2>
                            {hasResults ? (
                                <p className="prob-message">
                                    Tu desempeño actual indica que estás{' '}
                                    {areasAboveAvg >= 3
                                        ? <strong>por encima del promedio en {areasAboveAvg} ramas.</strong>
                                        : <strong>en proceso de mejora.</strong>}
                                    <br />
                                    Tu IA recomienda reforzar{' '}
                                    <strong>{weakestArea}</strong> para asegurar el sobresaliente.
                                </p>
                            ) : (
                                <p className="prob-message">
                                    Aún no has realizado tu examen diagnóstico.
                                    Comienza ahora para obtener tu predicción personalizada.
                                </p>
                            )}
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => navigate(hasResults ? '/exam' : '/exam')}
                                id="btn-start-study"
                            >
                                {hasResults ? 'Repetir Diagnóstico' : 'Comenzar Diagnóstico'}
                                <span style={{ fontSize: '1.2rem' }}>→</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity heatmap */}
                <div className="card dashboard-activity-card animate-fade-in delay-1">
                    <ActivityHeatmap />
                </div>
            </div>

            {/* Bottom Section — Two columns */}
            <div className="dashboard-bottom">
                {/* Domain by Areas */}
                <div className="card dashboard-areas-card animate-fade-in delay-2">
                    <h3 className="card-title">
                        <span className="card-title-icon">◉</span>
                        Dominio por Áreas
                    </h3>
                    {hasResults ? (
                        <div className="areas-list">
                            {AREA_ORDER.map((key) => {
                                const score = areaScores[key] ?? 0;
                                const status = getStatusLabel(score);
                                return (
                                    <div className="area-item" key={key}>
                                        <div className="area-item-header">
                                            <span className="area-name">{AREA_LABELS[key]}</span>
                                            <span className="area-status" style={{ color: status.color }}>
                                                {status.label}
                                            </span>
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
                    ) : (
                        <div className="areas-empty">
                            <p>Realiza tu examen diagnóstico para ver tu dominio por áreas.</p>
                        </div>
                    )}
                </div>

                {/* Concept Ontology */}
                <div className="card dashboard-ontology-card animate-fade-in delay-3">
                    <h3 className="card-title">Ontología Personalizada</h3>
                    <p className="ontology-desc">
                        Visualiza cómo se conectan los conceptos que has aprendido.
                    </p>
                    <div className="ontology-tags">
                        {conceptTags.map((tag) => (
                            <span className="tag" key={tag}>{tag}</span>
                        ))}
                    </div>
                    <button className="btn btn-ghost ontology-explore" id="btn-explore-graph">
                        Explorar Grafo de Conocimiento →
                    </button>
                </div>
            </div>
        </div>
    );
}
