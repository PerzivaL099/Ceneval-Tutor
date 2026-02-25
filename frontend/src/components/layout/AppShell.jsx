import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import './AppShell.css';

export default function AppShell() {
    return (
        <div className="app-shell">
            <Sidebar />
            <TopBar />
            <main className="app-content" id="main-content">
                <Outlet />
            </main>
        </div>
    );
}
