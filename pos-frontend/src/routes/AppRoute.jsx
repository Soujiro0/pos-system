import { Routes, Route, Navigate } from 'react-router-dom';
import ProductsPage from '../pages/ProductsPage';
import PricingPage from '../pages/PricingPage';
import TerminalPage from '../pages/TerminalPage';
import DashboardPage from '../pages/DashboardPage';
import AdminLayout from '../layouts/AdminLayout';
import TerminalLayout from '../layouts/TerminalLayout';

export default function AppRoute() {
    return (
        <Routes>
            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/pricing" element={<PricingPage />} />
            </Route>

            {/* Terminal Routes */}
            <Route element={<TerminalLayout />}>
                <Route path="/terminal" element={<TerminalPage />} />
            </Route>
        </Routes>
    );
}
