import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Tag, Package, Store, LogOut, Layers } from 'lucide-react';

export default function AdminLayout() {
    const location = useLocation();

    const navigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Categories', href: '/categories', icon: Layers },
        { name: 'Pricing & Promotion', href: '/pricing', icon: Tag },
    ];

    return (
        <div className="h-screen overflow-hidden bg-light flex">
            {/* Sidebar */}
            <div className="w-64 bg-primary flex flex-col text-white transition-all duration-300">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-light rounded-xl flex items-center justify-center text-primary font-bold shadow-lg">
                        <Store className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="font-bold text-lg tracking-tight block leading-tight">POS Admin</span>
                        <span className="text-xs text-light/70 font-medium">Management Console</span>
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
                                    ? 'bg-secondary text-white shadow-lg'
                                    : 'text-light/70 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'opacity-70 group-hover:opacity-100'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link
                        to="/terminal"
                        className="flex items-center gap-3 px-4 py-3 text-light/70 hover:text-white hover:bg-white/10 rounded-xl w-full transition-all text-sm font-medium group"
                    >
                        <div className="w-5 h-5 rounded border border-light/50 flex items-center justify-center group-hover:border-white transition-colors">
                            <span className="text-[10px] font-bold">T</span>
                        </div>
                        Open Terminal
                    </Link>

                    <button className="flex items-center gap-3 px-4 py-3 text-light/70 hover:text-white hover:bg-error/20 rounded-xl w-full transition-all text-sm font-medium">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto bg-light">
                <header className="bg-white px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm border-b border-accent/20">
                    <div>
                        <h1 className="text-2xl font-bold text-primary tracking-tight">
                            {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-6 border-l border-accent/20">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-primary">Admin User</p>
                                <p className="text-xs text-accent">Store Manager</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-secondary border-2 border-white shadow-md" />
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
