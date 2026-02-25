import { useAuth } from '../../context/AuthContext';
import './TopBar.css';

export default function TopBar() {
    const { user } = useAuth();

    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'US';

    return (
        <header className="topbar" id="topbar">
            {/* Search */}
            <div className="topbar-search">
                <span className="search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="Buscar tema (ej. Complejidad Algorítmica)..."
                    className="search-input"
                    id="search-input"
                />
            </div>

            {/* Right section */}
            <div className="topbar-right">
                <div className="topbar-streak" id="streak-badge">
                    <span className="streak-fire">🔥</span>
                    <span className="streak-text">Racha: 1 día</span>
                </div>
                <button className="topbar-notification btn-icon" id="btn-notifications">
                    🔔
                </button>
                <div className="topbar-avatar" id="user-avatar">
                    {initials}
                </div>
            </div>
        </header>
    );
}
