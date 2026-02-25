import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getExams, getDiagnostic } from '../../services/api';
import './ExamPage.css';

// Map question categories to the 5 diagnostic areas
const CATEGORY_TO_AREA = {
    'Ingeniería de Software': 'calif_software',
    'Teoría de Compiladores': 'calif_software',
    'Computación Evolutiva': 'calif_software',
    'Redes': 'calif_redes',
    'Bases de Datos': 'calif_bd',
    'Matemáticas': 'calif_matematicas',
    'Lógica y Algoritmos': 'calif_logica',
};

const AREA_LABELS = {
    calif_software: 'Ing. de Software',
    calif_redes: 'Redes',
    calif_bd: 'Bases de Datos',
    calif_matematicas: 'Matemáticas',
    calif_logica: 'Lógica y Algoritmos',
};

export default function ExamPage() {
    const navigate = useNavigate();

    // --- States ---
    const [phase, setPhase] = useState('setup'); // 'setup' | 'exam' | 'submitting'
    const [semestre, setSemestre] = useState(7);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Exam state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});          // { questionId: 'a'|'b'|'c'|'d' }
    const [answerChanges, setAnswerChanges] = useState(0);
    const [timePerQuestion, setTimePerQuestion] = useState({}); // { questionId: seconds }
    const [questionStartTime, setQuestionStartTime] = useState(null);
    const [totalExamTime, setTotalExamTime] = useState(0);
    const [examStartTime, setExamStartTime] = useState(null);

    // Timer ref
    const timerRef = useRef(null);
    const questionTimerRef = useRef(null);
    const [currentQuestionElapsed, setCurrentQuestionElapsed] = useState(0);

    // --- Load questions ---
    const loadQuestions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const exams = await getExams();
            if (exams.length === 0) {
                setError('No hay exámenes disponibles. Asegúrate de ejecutar el seed.');
                return;
            }

            // Get all questions from all exams (typically the diagnostic exam)
            let allQuestions = [];
            for (const exam of exams) {
                if (exam.questions) {
                    allQuestions = [...allQuestions, ...exam.questions];
                }
            }

            if (allQuestions.length === 0) {
                setError('No hay preguntas cargadas. Ejecuta el seed de la base de datos.');
                return;
            }

            // Shuffle questions
            const shuffled = allQuestions.sort(() => Math.random() - 0.5);
            setQuestions(shuffled);
        } catch (err) {
            setError(err.message || 'Error al cargar las preguntas');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- Start Exam ---
    const startExam = async () => {
        await loadQuestions();
    };

    useEffect(() => {
        if (questions.length > 0 && phase === 'setup') {
            setPhase('exam');
            setCurrentIndex(0);
            setAnswers({});
            setAnswerChanges(0);
            setTimePerQuestion({});
            setExamStartTime(Date.now());
            setQuestionStartTime(Date.now());
            setCurrentQuestionElapsed(0);
        }
    }, [questions, phase]);

    // --- Track total exam time ---
    useEffect(() => {
        if (phase === 'exam' && examStartTime) {
            timerRef.current = setInterval(() => {
                setTotalExamTime(Math.floor((Date.now() - examStartTime) / 1000));
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [phase, examStartTime]);

    // --- Track current question time ---
    useEffect(() => {
        if (phase === 'exam' && questionStartTime) {
            questionTimerRef.current = setInterval(() => {
                setCurrentQuestionElapsed(Math.floor((Date.now() - questionStartTime) / 1000));
            }, 100);
        }
        return () => clearInterval(questionTimerRef.current);
    }, [phase, questionStartTime]);

    // --- Save time for current question when navigating ---
    const saveQuestionTime = () => {
        if (questionStartTime && questions[currentIndex]) {
            const elapsed = (Date.now() - questionStartTime) / 1000;
            const qId = questions[currentIndex].id;
            setTimePerQuestion(prev => ({
                ...prev,
                [qId]: (prev[qId] || 0) + elapsed,
            }));
        }
    };

    // --- Select answer ---
    const selectAnswer = (option) => {
        const qId = questions[currentIndex].id;
        if (answers[qId] && answers[qId] !== option) {
            setAnswerChanges(prev => prev + 1);
        }
        setAnswers(prev => ({ ...prev, [qId]: option }));
    };

    // --- Navigation ---
    const goToQuestion = (index) => {
        saveQuestionTime();
        setCurrentIndex(index);
        setQuestionStartTime(Date.now());
        setCurrentQuestionElapsed(0);
    };

    const goNext = () => {
        if (currentIndex < questions.length - 1) {
            goToQuestion(currentIndex + 1);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            goToQuestion(currentIndex - 1);
        }
    };

    // --- Submit Exam ---
    const submitExam = async () => {
        saveQuestionTime();
        setPhase('submitting');

        // 1. Calculate area scores
        const areaCorrect = {};
        const areaTotal = {};

        for (const q of questions) {
            const area = CATEGORY_TO_AREA[q.category] || 'calif_software';
            areaTotal[area] = (areaTotal[area] || 0) + 1;

            if (answers[q.id] === q.correct_answer) {
                areaCorrect[area] = (areaCorrect[area] || 0) + 1;
            }
        }

        const areaScores = {};
        for (const area of Object.keys(AREA_LABELS)) {
            const correct = areaCorrect[area] || 0;
            const total = areaTotal[area] || 1;
            areaScores[area] = Math.round((correct / total) * 100);
        }

        // 2. Calculate behavioral metrics
        const answeredCount = Object.keys(answers).length;
        const omitted = questions.length - answeredCount;

        // Time per question (average in seconds)
        const allTimes = Object.values(timePerQuestion);
        const avgTime = allTimes.length > 0
            ? allTimes.reduce((a, b) => a + b, 0) / allTimes.length
            : 60;

        // Consecutive correct answers (racha)
        let maxStreak = 0;
        let currentStreak = 0;
        for (const q of questions) {
            if (answers[q.id] === q.correct_answer) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        // 3. Build diagnostic request
        const diagnosticData = {
            calif_software: areaScores.calif_software,
            calif_redes: areaScores.calif_redes,
            calif_bd: areaScores.calif_bd,
            calif_matematicas: areaScores.calif_matematicas,
            calif_logica: areaScores.calif_logica,
            tiempo_promedio: Math.round(avgTime * 100) / 100,
            preguntas_omitidas: omitted,
            cambios_respuesta: answerChanges,
            racha_aciertos: maxStreak,
            semestre_actual: semestre,
        };

        try {
            const result = await getDiagnostic(diagnosticData);

            // Save to localStorage for dashboard
            const fullResult = {
                ...result,
                areaScores,
                diagnosticData,
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem('lastDiagnosticResult', JSON.stringify(fullResult));

            navigate('/results');
        } catch (err) {
            setError(err.message || 'Error al enviar el diagnóstico');
            setPhase('exam');
        }
    };

    // --- Format time ---
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // --- Render: Setup Phase ---
    if (phase === 'setup') {
        return (
            <div className="exam-setup animate-fade-in">
                <div className="card exam-setup-card">
                    <div className="exam-setup-icon">Diagnostico</div>
                    <h1>Simulacro de Diagnóstico</h1>
                    <p className="exam-setup-desc">
                        Este examen evaluará tus conocimientos en 5 áreas clave del CENEVAL.
                        Tu IA medirá automáticamente tu tiempo, respuestas omitidas, cambios de respuesta
                        y racha de aciertos para dar una predicción precisa.
                    </p>

                    <div className="exam-setup-info">
                        <div className="setup-stat">
                            <span className="setup-stat-icon"></span>
                            <div>
                                <strong>30 preguntas</strong>
                                <small>Opción múltiple (A, B, C, D)</small>
                            </div>
                        </div>
                        <div className="setup-stat">
                            <span className="setup-stat-icon"></span>
                            <div>
                                <strong>Sin límite de tiempo</strong>
                                <small>Pero se mide tu velocidad</small>
                            </div>
                        </div>
                        <div className="setup-stat">
                            <span className="setup-stat-icon"></span>
                            <div>
                                <strong>IA en tiempo real</strong>
                                <small>Tracking automático de comportamiento</small>
                            </div>
                        </div>
                    </div>

                    <div className="exam-setup-semester">
                        <label htmlFor="semestre">¿Qué semestre cursas actualmente?</label>
                        <select
                            id="semestre"
                            className="input-field"
                            value={semestre}
                            onChange={(e) => setSemestre(Number(e.target.value))}
                        >
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                                <option key={s} value={s}>Semestre {s}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="login-error animate-fade-in">
                            <span>!</span> {error}
                        </div>
                    )}

                    <button
                        className="btn btn-primary btn-lg exam-start-btn"
                        onClick={startExam}
                        disabled={loading}
                        id="btn-start-exam"
                    >
                        {loading ? (
                            <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span> Cargando preguntas...</>
                        ) : (
                            <>Comenzar Examen <span>→</span></>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // --- Render: Submitting Phase ---
    if (phase === 'submitting') {
        return (
            <div className="exam-submitting animate-fade-in">
                <div className="card exam-submitting-card">
                    <div className="spinner spinner-lg"></div>
                    <h2>Analizando tu desempeño...</h2>
                    <p>Nuestro modelo de Machine Learning está procesando tus resultados.</p>
                    <div className="submitting-steps">
                        <div className="submitting-step active">✓ Respuestas recopiladas</div>
                        <div className="submitting-step active">✓ Calificaciones por área calculadas</div>
                        <div className="submitting-step pulse-anim">... Ejecutando Random Forest...</div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Render: Exam Phase ---
    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="exam-page">
            {/* Top Status Bar */}
            <div className="exam-status-bar animate-fade-in">
                <div className="exam-status-left">
                    <span className="exam-status-badge">
                        Pregunta {currentIndex + 1} / {questions.length}
                    </span>
                    <span className="exam-category-badge badge-accent">
                        {currentQ.category}
                    </span>
                </div>
                <div className="exam-status-center">
                    <div className="progress-bar-track" style={{ width: '200px', height: '6px' }}>
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${progress}%`, background: 'var(--accent-gradient)' }}
                        />
                    </div>
                </div>
                <div className="exam-status-right">
                    <div className="exam-timer" id="exam-timer">
                        <span className="timer-icon">T:</span>
                        <span className="timer-value">{formatTime(totalExamTime)}</span>
                    </div>
                    <div className="exam-answered">
                        {answeredCount}/{questions.length}
                    </div>
                </div>
            </div>

            <div className="exam-content">
                {/* Question Card */}
                <div className="card exam-question-card animate-fade-in-scale" key={currentQ.id}>
                    {/* Difficulty indicator */}
                    <div className="question-difficulty">
                        <span>Dificultad:</span>
                        <div className="difficulty-dots">
                            {[1, 2, 3, 4, 5].map((d) => (
                                <div
                                    key={d}
                                    className={`difficulty-dot ${d <= Math.round(currentQ.difficulty * 5) ? 'filled' : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    <h2 className="question-text">{currentQ.text}</h2>

                    {/* Options */}
                    <div className="question-options">
                        {['a', 'b', 'c', 'd'].map((letter) => {
                            const optionText = currentQ[`option_${letter}`];
                            const isSelected = answers[currentQ.id] === letter;
                            return (
                                <button
                                    key={letter}
                                    className={`question-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => selectAnswer(letter)}
                                    id={`option-${letter}`}
                                >
                                    <span className="option-letter">{letter.toUpperCase()}</span>
                                    <span className="option-text">{optionText}</span>
                                    {isSelected && <span className="option-check">✓</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Navigation */}
                    <div className="question-nav">
                        <button
                            className="btn btn-secondary"
                            onClick={goPrev}
                            disabled={currentIndex === 0}
                            id="btn-prev-question"
                        >
                            ← Anterior
                        </button>

                        {currentIndex < questions.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={goNext}
                                id="btn-next-question"
                            >
                                Siguiente →
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={submitExam}
                                id="btn-finish-exam"
                            >
                                Finalizar Examen ✓
                            </button>
                        )}
                    </div>
                </div>

                {/* Question Map (sidebar) */}
                <div className="exam-sidebar animate-slide-right">
                    <div className="card exam-map-card">
                        <h4 className="exam-map-title">Mapa de Preguntas</h4>
                        <div className="exam-map-grid">
                            {questions.map((q, i) => (
                                <button
                                    key={q.id}
                                    className={`exam-map-btn 
                    ${i === currentIndex ? 'current' : ''} 
                    ${answers[q.id] ? 'answered' : ''}`}
                                    onClick={() => goToQuestion(i)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Live tracking stats */}
                    <div className="card exam-tracking-card">
                        <h4 className="exam-map-title">Tracking en Vivo</h4>
                        <div className="tracking-stats">
                            <div className="tracking-stat">
                                <span className="tracking-label">Tiempo en esta pregunta</span>
                                <span className="tracking-value">{currentQuestionElapsed}s</span>
                            </div>
                            <div className="tracking-stat">
                                <span className="tracking-label">Preguntas omitidas</span>
                                <span className="tracking-value">{questions.length - answeredCount}</span>
                            </div>
                            <div className="tracking-stat">
                                <span className="tracking-label">Cambios de respuesta</span>
                                <span className="tracking-value">{answerChanges}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
