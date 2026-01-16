import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import ProductsPage from './pages/ProductsPage';
import PricingPage from './pages/PricingPage';
import AdminLayout from './layouts/AdminLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminLayout>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Navigate to="/products" replace />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
        </AdminLayout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
