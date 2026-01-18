import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Tag, Package, Store, LogOut } from 'lucide-react';

export default function AdminLayout() {
    const location = useLocation();

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Pricing & Promotion', href: '/pricing', icon: Tag },
    ];

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col text-gray-600 transition-all duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-tight text-gray-900">POS Admin</span>
                        <span className="text-xs text-gray-500 font-medium">Management Console</span>
                    </div>
                </div>

                <nav className="p-4 flex-1 space-y-2 mt-4">
                    {navigation.map((item) => {
                        const isActive = location.pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <Link
                        to="/terminal"
                        className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl w-full transition-all text-sm font-medium group"
                    >
                        <div className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center group-hover:border-gray-900 transition-colors">
                            <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900">T</span>
                        </div>
                        Open Terminal
                    </Link>

                    <button className="flex items-center gap-3 px-4 py-3 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl w-full transition-all text-sm font-medium">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-gray-50/50">
                <header className="bg-white px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-900">Admin User</p>
                                <p className="text-xs text-gray-500">Store Manager</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 border-2 border-white shadow-md" />
                        </div>
                    </div>
                </header>
                <main className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
