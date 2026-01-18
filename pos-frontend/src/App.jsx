import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import AppRoute from './routes/AppRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <AppRoute />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
