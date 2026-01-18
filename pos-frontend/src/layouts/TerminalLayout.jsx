import { Outlet } from 'react-router-dom';

export default function TerminalLayout() {
    return (
        <div className="h-screen w-screen bg-gray-50 flex flex-col overflow-hidden font-sans">
            <Outlet />
        </div>
    );
}
