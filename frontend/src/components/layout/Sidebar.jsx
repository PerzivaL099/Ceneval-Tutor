import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/exam', label: 'Simulacro Exam', icon: '⚡' },
    { path: '/results', label: 'Mis Resultados', icon: '📈' },
    { path: '/clasificador', label: 'Clasificador IA', icon: '🧠' },
];

export default function Sidebar() {
    const { logout } = useAuth();
    const location = useLocation();

    return (
        <aside className="sidebar" id="sidebar">
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <span>🎓</span>
                </div>
                <div className="sidebar-brand-text">
                    <span className="brand-ceneval">CENEVAL</span>
                    <span className="brand-ai">AI</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        id={`nav-${item.path.replace('/', '')}`}
                    >
                        <span className="sidebar-link-icon">{item.icon}</span>
                        <span className="sidebar-link-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom */}
            <div className="sidebar-bottom">
                <div className="sidebar-pro-badge">
                    <span className="pro-icon">⚡</span>
                    <div className="pro-text">
                        <strong>Tutor Activo</strong>
                        <small>Tu IA analiza tu progreso</small>
                    </div>
                </div>
                <button className="sidebar-logout" onClick={logout} id="btn-logout">
                    <span>→</span>
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
