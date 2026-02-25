import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('admin@admin.com');
    const [password, setPassword] = useState('admin');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isRegister && password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres');
            return;
        }

        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password);
            } else {
                await login(email, password);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Error de autenticación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Background decoration */}
            <div className="login-bg-decoration">
                <div className="login-bg-orb orb-1"></div>
                <div className="login-bg-orb orb-2"></div>
                <div className="login-bg-orb orb-3"></div>
                <div className="login-bg-grid"></div>
            </div>

            <div className="login-container animate-fade-in-scale">
                {/* Left — Branding Panel */}
                <div className="login-branding">
                    <div className="login-branding-content">
                        <div className="login-brand-logo">
                            <div className="login-logo-icon">🎓</div>
                            <h1>
                                <span className="brand-ceneval">CENEVAL</span>
                                <span className="brand-ai">AI</span>
                            </h1>
                        </div>
                        <p className="login-tagline">
                            Tu Tutor Inteligente para dominar el CENEVAL
                        </p>
                        <div className="login-features">
                            <div className="login-feature">
                                <span className="feature-icon">🧠</span>
                                <div>
                                    <strong>IA Predictiva</strong>
                                    <span>Predicción de éxito con Machine Learning</span>
                                </div>
                            </div>
                            <div className="login-feature">
                                <span className="feature-icon">📊</span>
                                <div>
                                    <strong>Diagnóstico por Áreas</strong>
                                    <span>Identifica tus fortalezas y debilidades</span>
                                </div>
                            </div>
                            <div className="login-feature">
                                <span className="feature-icon">⚡</span>
                                <div>
                                    <strong>Exámenes Adaptativos</strong>
                                    <span>Preguntas calibradas por dificultad</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="login-branding-footer">
                        <small>Potenciado por Random Forest + XGBoost</small>
                    </div>
                </div>

                {/* Right — Form Panel */}
                <div className="login-form-panel">
                    <div className="login-form-header">
                        <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
                        <p>
                            {isRegister
                                ? 'Regístrate para comenzar tu preparación'
                                : 'Accede a tu tutor inteligente'}
                        </p>
                    </div>

                    {error && (
                        <div className="login-error animate-fade-in" id="login-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form" id="auth-form">
                        <div className="input-group">
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                id="email"
                                type="email"
                                className="input-field"
                                placeholder="tu@universidad.edu.mx"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {isRegister && (
                            <div className="input-group animate-fade-in">
                                <label htmlFor="confirm-password">Confirmar Contraseña</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg login-submit"
                            disabled={loading}
                            id="btn-submit"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    {isRegister ? 'Crear Cuenta' : 'Entrar'}
                                    <span style={{ fontSize: '1.1rem' }}>→</span>
                                </>
                            )}
                        </button>
                    </form>

                    {!isRegister && (
                        <div className="login-credentials-hint" id="credentials-hint">
                            <span className="hint-icon">🔑</span>
                            <div>
                                <strong>Credenciales de prueba:</strong>
                                <span>admin@admin.com / admin</span>
                            </div>
                        </div>
                    )}

                    <div className="login-toggle">
                        <span>{isRegister ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?'}</span>
                        <button
                            type="button"
                            className="login-toggle-btn"
                            onClick={() => { setIsRegister(!isRegister); setError(''); }}
                            id="btn-toggle-auth"
                        >
                            {isRegister ? 'Inicia Sesión' : 'Regístrate aquí'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
